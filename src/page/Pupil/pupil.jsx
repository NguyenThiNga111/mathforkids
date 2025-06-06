import { useState, useEffect } from 'react';
import { Input, Button, Select, Modal, DatePicker, Table, Pagination, Switch } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaEdit } from 'react-icons/fa';
import moment from 'moment';
import Navbar from '../../component/Navbar';
import api from '../../assets/api/Api';
import './pupil.css';

const PupilManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPupil, setEditingPupil] = useState(null);
    const [pupilsData, setPupilsData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [parentMap, setParentMap] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});
    const pupilsPerPage = 16;

    const { t } = useTranslation(['pupil', 'common']);
    const { Option } = Select;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pupilRes, userRes] = await Promise.all([
                api.get('/pupil'),
                api.get('/user')
            ]);
            const pupils = pupilRes.data;
            const users = userRes.data;

            const map = {};
            users.forEach(user => {
                map[user.id] = user.fullName;
            });

            const enrichedPupils = pupils.map(p => ({
                ...p,
                parentName: map[p.userId] || 'Unknown',
            }));
            const sortedPupils = enrichedPupils.sort((a, b) => {
                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);

                if (dateB - dateA !== 0) {
                    return dateB - dateA; // Latest first
                }

                return a.userId.localeCompare(b.userId);
            });

            setUsersData(users);
            setParentMap(map);
            setPupilsData(sortedPupils);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }));
        }
    };

    const formatFirebaseTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return '';
        const date = new Date(timestamp.seconds * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const openModal = (mode, pupil = null) => {
        if (mode === 'add') {
            setEditingPupil({
                fullName: '',
                nickName: '',
                gender: undefined,
                userId: undefined,
                dateOfBirth: null,
                grade: undefined,
                isDisabled: false,
            });
        } else if (mode === 'update' && pupil) {
            let formattedDOB = '';
            if (pupil.dateOfBirth?.seconds) {
                formattedDOB = moment(pupil.dateOfBirth.seconds * 1000).format('YYYY/MM/DD');
            } else if (typeof pupil.dateOfBirth === 'string') {
                formattedDOB = moment(pupil.dateOfBirth).isValid() ? moment(pupil.dateOfBirth).format('YYYY/MM/DD') : '';
            }
            setEditingPupil({ ...pupil, dateOfBirth: formattedDOB });
        }
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPupil(null);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!editingPupil?.fullName?.trim()) newErrors.fullName = t('fullNameRequired');
        if (!editingPupil?.nickName?.trim()) newErrors.nickName = t('nickNameRequired');
        if (!editingPupil?.gender) newErrors.gender = t('genderRequired');
        if (!editingPupil?.userId) newErrors.userId = t('parentRequired');
        if (!editingPupil?.dateOfBirth) newErrors.dateOfBirth = t('dateOfBirthRequired');
        if (!editingPupil?.grade) newErrors.grade = t('gradeRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                if (editingPupil?.id) {
                    await api.put(`/pupil/${editingPupil.id}`, editingPupil);
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post('/pupil', editingPupil);
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchData();
                closeModal();
            } catch {
                toast.error(t('errorSavingData', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        } else {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleToggleDisabled = async (pupil) => {
        try {
            await api.put(`/pupil/${pupil.id}`, { isDisabled: !pupil.isDisabled });
            fetchData();
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        } catch {
            toast.error(t('errorSavingData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const parseDate = (dateString) => {
        const [time, date] = dateString.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const filteredPupils = pupilsData.filter(pupil => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'no'
                    ? pupil.isDisabled === false
                    : pupil.isDisabled === true;
        const searchText = searchQuery.toLowerCase();
        const pupilName = pupil.fullName?.toLowerCase() || '';
        return matchStatus && pupilName.includes(searchText);
    });

    // Ant Design Table columns
    const columns = [
        {
            title: t('.no', { ns: 'common' }),
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => (currentPage - 1) * pupilsPerPage + index + 1,
        },
        {
            title: t('fullName'),
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: t('nickName'),
            dataIndex: 'nickName',
            key: 'nickName',
        },
        {
            title: t('parentName'),
            dataIndex: 'parentName',
            key: 'parentName',
        },
        {
            title: t('grade'),
            dataIndex: 'grade',
            key: 'grade',
            align: 'center',
        },
        {
            title: t('gender'),
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: t('dateOfBirth'),
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            render: (dateOfBirth) => formatFirebaseTimestamp(dateOfBirth),
        },
        // {
        //     title: t('action', { ns: 'common' }),
        //     key: 'action',
        //     align: 'center',
        //     render: (_, record) => (
        //         <button
        //             className="text-white px-3 py-1 buttonupdate"
        //             onClick={() => openModal('update', record)}
        //         >
        //             <FaEdit className="iconupdate" />
        //             {t('update', { ns: 'common' })}
        //         </button>
        //     ),
        // },
        {
            title: t('available', { ns: 'common' }),
            dataIndex: 'isDisabled',
            key: 'isDisabled',
            align: 'center',
            render: (isDisabled, record) => (
                <Switch
                    checked={isDisabled}
                    onChange={() => handleToggleDisabled(record)}
                    className="custom-switch"
                />
            ),
        },
    ];

    return (
        <div className="containers">
            <Navbar />
            <div className="title-search">
                <h1 className="container-title">{t('managementLessons')}</h1>
                <div className="search">
                    <Input
                        type="text"
                        className="inputsearch"
                        placeholder={t('searchPlaceholder', { ns: 'common' })}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>
            <div className="containers-content">
                <div className="filter-bar mb-2">
                    <div className="filter-containers">
                        <span className="filter-icon">
                            <svg
                                className="iconfilter"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                            </svg>
                            <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
                        </span>
                        <Select
                            className="filter-dropdown"
                            value={filterStatus}
                            onChange={(value) => {
                                setFilterStatus(value);
                                setCurrentPage(1);
                            }}
                        >
                            <Select.Option value="all">{t('pupilStatus')}</Select.Option>
                            <Select.Option value="yes">{t('yes', { ns: 'common' })}</Select.Option>
                            <Select.Option value="no">{t('no', { ns: 'common' })}</Select.Option>
                        </Select>
                    </div>
                    <Button className="rounded-add" onClick={() => openModal('add')}>
                        + {t('addNew', { ns: 'common' })}
                    </Button>
                </div>
                <div className="table-container-pupil">
                    <Table
                        columns={columns}
                        dataSource={filteredPupils.slice((currentPage - 1) * pupilsPerPage, currentPage * pupilsPerPage)}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                </div>

                <div className="paginations">
                    <Pagination
                        current={currentPage}
                        total={filteredPupils.length}
                        pageSize={pupilsPerPage}
                        onChange={(page) => setCurrentPage(page)}
                        className="pagination"
                        itemRender={(page, type, originalElement) => {
                            if (type === 'prev') {
                                return <button className="around" disabled={currentPage === 1}>{'<'}</button>;
                            }
                            if (type === 'next') {
                                return (
                                    <button
                                        className="around"
                                        disabled={currentPage === Math.ceil(filteredPupils.length / pupilsPerPage)}
                                    >
                                        {'>'}
                                    </button>
                                );
                            }
                            if (type === 'page') {
                                return <button className={`around ${currentPage === page ? 'active' : ''}`}>{page}</button>;
                            }
                            return originalElement;
                        }}
                    />
                </div>
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingPupil?.id ? t('updatePupil') : t('addPupil')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-pupil">
                        <div className="inputtext">
                            <label className="titleinput">{t('fullName')} <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('fullName')}
                                value={editingPupil?.fullName || ''}
                                onChange={e => setEditingPupil({ ...editingPupil, fullName: e.target.value })}
                            />
                            {errors.fullName && <div className="error-text">{errors.fullName}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('nickName')} <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('nickName')}
                                value={editingPupil?.nickName || ''}
                                onChange={e => setEditingPupil({ ...editingPupil, nickName: e.target.value })}
                            />
                            {errors.nickName && <div className="error-text">{errors.nickName}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('gender')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder="Select gender"
                                value={editingPupil?.gender || undefined}
                                onChange={(value) => setEditingPupil({ ...editingPupil, gender: value })}
                            >
                                <Select.Option value="Male">Male</Select.Option>
                                <Select.Option value="Female">Female</Select.Option>
                            </Select>
                            {errors.gender && <div className="error-text">{errors.gender}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('parentName')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectParent')}
                                value={editingPupil?.userId || undefined}
                                onChange={(value) => setEditingPupil({ ...editingPupil, userId: value })}
                            >
                                {usersData.map(user => (
                                    <Select.Option key={user.id} value={user.id}>
                                        {user.fullName}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.userId && <div className="error-text">{errors.userId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('dateOfBirth')} <span style={{ color: 'red' }}>*</span></label>
                            <DatePicker
                                style={{ width: '100%', height: '50px' }}
                                value={editingPupil?.dateOfBirth ? moment(editingPupil.dateOfBirth, 'YYYY/MM/DD') : null}
                                onChange={(date) =>
                                    setEditingPupil({
                                        ...editingPupil,
                                        dateOfBirth: date ? date.format('YYYY/MM/DD') : null,
                                    })
                                }
                            />
                            {errors.dateOfBirth && <div className="error-text">{errors.dateOfBirth}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('grade')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder="Select grade"
                                value={editingPupil?.grade || undefined}
                                onChange={(value) => setEditingPupil({ ...editingPupil, grade: value })}
                            >
                                <Select.Option value="1">1</Select.Option>
                                <Select.Option value="2">2</Select.Option>
                                <Select.Option value="3">3</Select.Option>
                            </Select>
                            {errors.grade && <div className="error-text">{errors.grade}</div>}
                        </div>
                    </div>
                    <div className="button-row">
                        <Button className="cancel-button" onClick={closeModal} block>
                            {t('cancel', { ns: 'common' })}
                        </Button>
                        <Button className="save-button" onClick={handleSave} block>
                            {t('save', { ns: 'common' })}
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default PupilManagement;