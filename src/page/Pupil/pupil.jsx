import { useState, useEffect } from 'react';
import { Input, Button, Select, Modal, DatePicker, Upload, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { Imgs } from '../../assets/theme/images';
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
            enrichedPupils.sort((a, b) => a.userId.localeCompare(b.userId));
            setUsersData(users);
            setParentMap(map);
            setPupilsData(enrichedPupils);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }));
        }
    };
    const formatFirebaseTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return '';
        const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const openModal = (mode, pupil = null) => {
        if (mode === 'add') {
            setEditingPupil(null);
        } else if (mode === 'update' && pupil) {
            let formattedDOB = '';
            if (pupil.dateOfBirth?.seconds) {
                // Nếu là timestamp Firebase
                formattedDOB = moment(pupil.dateOfBirth.seconds * 1000).format('YYYY/MM/DD');
            } else if (typeof pupil.dateOfBirth === 'string') {
                // Nếu đã là chuỗi string
                formattedDOB = moment(pupil.dateOfBirth).isValid() ? moment(pupil.dateOfBirth).format('YYYY/MM/DD') : '';
            }
            setEditingPupil({ ...pupil, dateOfBirth: formattedDOB });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!editingPupil.fullName) newErrors.fullName = t('fullNameRequired');
        if (!editingPupil.grade) newErrors.grade = t('gradeRequired');
        if (!editingPupil.userId) newErrors.userId = t('parentRequired');
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
            toast.error('Validation failed', {
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
    const filteredPupils = pupilsData.filter(pupil => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'no'
                    ? pupil.isDisabled === false
                    : pupil.isDisabled === true;

        return matchStatus;
    });
    const indexOfLastPupil = currentPage * pupilsPerPage;
    const indexOfFirstPupil = indexOfLastPupil - pupilsPerPage;
    const currentPupils = filteredPupils.slice(indexOfFirstPupil, indexOfLastPupil);
    const totalPages = Math.ceil(filteredPupils.length / pupilsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="containers">
            <Navbar />
            <h1 className="container-title">{t('managementLessons')}</h1>
            <div className="containers-content">
                <div className="flex justify-between items-center mb-2">
                    <div className="filter-bar">
                        <div className="filter-container">
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
                                        strokeLinejoin="round">
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                    <button className="filter-text">
                                        {t('filterBy', { ns: 'common' })}
                                    </button>
                                </span>
                                <select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('pupilStatus')}</option>
                                    <option value="yes">{t('yes', { ns: 'common' })}</option>
                                    <option value="no">{t('no', { ns: 'common' })}</option>
                                </select>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 px-4 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + {t('addNew', { ns: 'common' })}
                        </button>
                    </div>
                </div>
                <div className="table-container-pupil">
                    <table className="w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-3">{t('.no', { ns: 'common' })}</th>
                                <th className="p-3">{t('fullName')}</th>
                                <th className="p-3">{t('nickName')}</th>
                                <th className="p-3">{t('parentName')}</th>
                                <th className="p-3 text-center">{t('grade')}</th>
                                <th className="p-3">{t('gender')}</th>
                                <th className="p-3">{t('dateOfBirth')}</th>
                                <th className="p-3 text-center">{t('available', { ns: 'common' })}</th>
                                <th className="p-3 text-center">{t('action', { ns: 'common' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPupils.map((pupil, index) => (
                                <tr key={pupil.id} className="border-t">
                                    <td className="p-3">{indexOfFirstPupil + index + 1}</td>
                                    <td className="p-3">{pupil.fullName}</td>
                                    <td className="p-3">{pupil.nickName}</td>
                                    <td className="p-3">{pupil.parentName}</td>
                                    <td className="p-3 text-center">{pupil.grade}</td>
                                    <td className="p-3">{pupil.gender}</td>
                                    <td className="p-3">{formatFirebaseTimestamp(pupil.dateOfBirth)}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            className="text-white px-3 py-1 buttonupdate"
                                            onClick={() => openModal('update', pupil)}
                                        >
                                            <FaEdit className='iconupdate' />
                                            {t('update', { ns: 'common' })}
                                        </button>
                                    </td>
                                    <td className="p-3 text-center">
                                        <label className="switch">
                                            <input type="checkbox" checked={pupil.isDisabled} onChange={() => handleToggleDisabled(pupil)} />
                                            <span className="slider round"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end items-center mt-4 ml-auto paginations">
                        <div className="pagination">
                            <button
                                className="around"
                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    className={`around ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={() => paginate(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                className="around"
                                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
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
                                <Option value="Male">Male</Option>
                                <Option value="Female">Female</Option>
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
                                    <Option key={user.id} value={user.id}>
                                        {user.fullName}
                                    </Option>
                                ))}
                            </Select>
                            {errors.userId && <div className="error-text">{errors.userId}</div>}
                        </div>

                        <div className="inputtext">
                            <label className='titleinput'>Birthday <span style={{ color: 'red' }}>*</span></label>
                            <DatePicker
                                style={{ width: '100%', height: '50px' }}
                                defaultValue={moment()}
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
                                <Option value="1">1</Option>
                                <Option value="2">2</Option>
                                <Option value="3">3</Option>
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
