import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Select, Modal, Table, Pagination, Switch } from 'antd';
import { Imgs } from '../../assets/theme/images';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaBook, FaPlus, FaMinus, FaTimes, FaDivide, FaBookOpen } from 'react-icons/fa';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './lesson.css';

const { Option } = Select;

const Lesson = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessonsData, setLessonsData] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all / enabled / disabled
    const [filterType, setFilterType] = useState('all'); // all / addition / subtraction / multiplication / division
    const [searchQuery, setSearchQuery] = useState('');

    const { t, i18n } = useTranslation(['lesson', 'common']);
    const navigate = useNavigate();
    const lessonsPerPage = 16;

    const lessonTypes = [
        { value: 'addition', label: t('addition'), icon: <FaPlus className="icon-type" />, color: '#60D56C' },
        { value: 'subtraction', label: t('subtraction'), icon: <FaMinus className="icon-type" />, color: '#B526E4' },
        { value: 'multiplication', label: t('multiplication'), icon: <FaTimes className="icon-type" />, color: '#F73A7A' },
        { value: 'division', label: t('division'), icon: <FaDivide className="icon-type" />, color: '#FD8550' },
    ];

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const response = await api.get(`/lesson`);
            const sortedLessons = response.data.sort((a, b) => {
                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);
                return dateB - dateA; // Latest first
            });
            setLessonsData(sortedLessons);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                const { id, ...payload } = editingLesson;
                payload.name = {
                    vi: editingLesson.name?.vi || '',
                    en: editingLesson.name?.en || '',
                };
                payload.grade = Number(payload.grade);
                payload.type = editingLesson.type;

                if (editingLesson?.id) {
                    await api.put(`/lesson/${editingLesson.id}`, payload);
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post(`/lesson`, payload);
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchLessons();
                closeModal();
            } catch (error) {
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

    const handleToggleAvailable = async (lesson) => {
        try {
            const updatedLesson = {
                ...lesson,
                isDisabled: !lesson.isDisabled,
            };
            await api.put(`/lesson/${lesson.id}`, {
                ...updatedLesson,
                isDisabled: updatedLesson.isDisabled,
            });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            fetchLessons();
        } catch (error) {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!editingLesson?.name?.vi || editingLesson.name.vi.trim() === '') {
            newErrors.nameVi = t('nameViRequired');
        } else if (editingLesson.name.vi.trim().length < 3) {
            newErrors.nameVi = t('nameViMinLength');
        }
        if (!editingLesson?.name?.en || editingLesson.name.en.trim() === '') {
            newErrors.nameEn = t('nameEnRequired');
        } else if (editingLesson.name.en.trim().length < 3) {
            newErrors.nameEn = t('nameEnMinLength');
        }
        if (!editingLesson?.grade || editingLesson.grade === '') {
            newErrors.grade = t('gradeRequired');
        } else if (!['1', '2', '3'].includes(String(editingLesson.grade))) {
            newErrors.grade = t('gradeInvalid');
        }
        if (!editingLesson?.type || editingLesson.type === '') {
            newErrors.type = t('typeRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openModal = (mode, lesson = null) => {
        if (mode === 'add') {
            setEditingLesson({ name: { en: '', vi: '' }, grade: '', type: '' });
        } else if (mode === 'update') {
            setEditingLesson(lesson);
        }
        setIsModalOpen(true);
    };

    const handleViewExercises = (lessonId) => {
        console.log('Navigating with lessonId:', lessonId);
        navigate(`/exercise/lessonId/${lessonId}`);
    };

    const handleLessonDetail = (lessonId) => {
        console.log('Navigating with lessonId:', lessonId);
        navigate(`/lessondetail/${lessonId}`);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const parseDate = (dateString) => {
        const [time, date] = dateString.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const filteredLessons = lessonsData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter(lesson => {
            const matchGrade = selectedGrade ? lesson.grade === Number(selectedGrade) : true;
            const matchStatus =
                filterStatus === 'all'
                    ? true
                    : filterStatus === 'no'
                        ? lesson.isDisabled === false
                        : lesson.isDisabled === true;
            const matchType = filterType === 'all' ? true : lesson.type === filterType;
            const searchText = searchQuery.toLowerCase();
            const searchName = lesson.name?.[i18n.language]?.toLowerCase() || '';
            return matchStatus && matchGrade && matchType && searchName.includes(searchText);
        });

    // Ant Design Table columns
    const columns = [
        {
            title: t('.no', { ns: 'common' }),
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => (currentPage - 1) * lessonsPerPage + index + 1,
        },
        {
            title: t('lessonName'),
            dataIndex: 'name',
            key: 'name',
            render: (name) => name?.[i18n.language] || '',
        },
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (type) => {
                const lessonType = lessonTypes.find(t => t.value === type);
                return (
                    <span style={{ color: lessonType?.color, fontSize: '20px' }}>
                        {lessonType?.icon || type}
                    </span>
                );
            },
        },
        {
            title: t('grade'),
            dataIndex: 'grade',
            key: 'grade',
            align: 'center',
        },
        {
            title: t('action', { ns: 'common' }),
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className="buttonaction">
                    <button
                        className="text-white px-3 py-1 buttonupdate"
                        onClick={() => openModal('update', record)}
                    >
                        <FaEdit className="iconupdate" />
                        {t('update', { ns: 'common' })}
                    </button>
                    <button
                        className="text-white px-3 py-1 buttondetail"
                        onClick={() => handleViewExercises(record.id)}
                    >
                        <FaBook className="iconupdate" />
                        {t('exercises')}
                    </button>
                    <button
                        className="text-white px-3 py-1 buttonlessondetail"
                        onClick={() => handleLessonDetail(record.id)}
                    >
                        <FaBookOpen className="iconupdate" />
                        {t('detail')}
                    </button>
                </div>
            ),
        },
        {
            title: t('available', { ns: 'common' }),
            dataIndex: 'isDisabled',
            key: 'isDisabled',
            align: 'center',
            render: (isDisabled, record) => (
                <Switch
                    checked={isDisabled}
                    onChange={() => handleToggleAvailable(record)}
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
                            setCurrentPage(1); // Reset to first page on search
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
                            value={filterType}
                            onChange={(value) => {
                                setFilterType(value);
                                setCurrentPage(1);
                            }}
                            placeholder={t('type')}
                        >
                            <Select.Option value="all">{t('type')}</Select.Option>
                            <Select.Option value="addition">{t('addition')}</Select.Option>
                            <Select.Option value="subtraction">{t('subtraction')}</Select.Option>
                            <Select.Option value="multiplication">{t('multiplication')}</Select.Option>
                            <Select.Option value="division">{t('division')}</Select.Option>
                        </Select>
                        <Select
                            className="filter-dropdown"
                            value={selectedGrade}
                            onChange={(value) => setSelectedGrade(value)}
                            placeholder={t('grade')}
                        >
                            <Select.Option value="">{t('grade')}</Select.Option>
                            <Select.Option value="1">{t('grade')} 1</Select.Option>
                            <Select.Option value="2">{t('grade')} 2</Select.Option>
                            <Select.Option value="3">{t('grade')} 3</Select.Option>
                        </Select>
                        <Select
                            className="filter-dropdown"
                            value={filterStatus}
                            onChange={(value) => {
                                setFilterStatus(value);
                                setCurrentPage(1);
                            }}
                            placeholder={t('lessonStatus')}
                        >
                            <Select.Option value="all">{t('lessonStatus')}</Select.Option>
                            <Select.Option value="yes">{t('yes', { ns: 'common' })}</Select.Option>
                            <Select.Option value="no">{t('no', { ns: 'common' })}</Select.Option>
                        </Select>
                    </div>
                    <Button className="rounded-add" onClick={() => openModal('add')}>
                        + {t('addNew', { ns: 'common' })}
                    </Button>
                </div>
                <div className="table-container-lesson">
                    <Table
                        columns={columns}
                        dataSource={filteredLessons.slice(
                            (currentPage - 1) * lessonsPerPage,
                            currentPage * lessonsPerPage
                        )}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                </div>
                <div className="paginations">
                    <Pagination
                        current={currentPage}
                        total={filteredLessons.length}
                        pageSize={lessonsPerPage}
                        onChange={(page) => setCurrentPage(page)}
                        className="pagination"
                        itemRender={(page, type, originalElement) => {
                            if (type === 'prev') {
                                return (
                                    <button className="around" disabled={currentPage === 1}>
                                        {'<'}
                                    </button>
                                );
                            }
                            if (type === 'next') {
                                return (
                                    <button
                                        className="around"
                                        disabled={
                                            currentPage === Math.ceil(filteredLessons.length / lessonsPerPage)
                                        }
                                    >
                                        {'>'}
                                    </button>
                                );
                            }
                            if (type === 'page') {
                                return (
                                    <button className={`around ${currentPage === page ? 'active' : ''}`}>
                                        {page}
                                    </button>
                                );
                            }
                            return originalElement;
                        }}
                    />
                </div>
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingLesson?.id ? t('updateLesson') : t('addLesson')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-lesson">
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('lessonName')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputlessonNameVi')}
                                value={editingLesson?.name?.vi || ''}
                                onChange={(e) =>
                                    setEditingLesson({
                                        ...editingLesson,
                                        name: { ...editingLesson?.name, vi: e.target.value },
                                    })
                                }
                            />
                            {errors.nameVi && <div className="error-text">{errors.nameVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('lessonName')} (English) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputlessonNameEn')}
                                value={editingLesson?.name?.en || ''}
                                onChange={(e) =>
                                    setEditingLesson({
                                        ...editingLesson,
                                        name: { ...editingLesson?.name, en: e.target.value },
                                    })
                                }
                            />
                            {errors.nameEn && <div className="error-text">{errors.nameEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('grade')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('inputgrade')}
                                value={editingLesson?.grade || undefined}
                                onChange={(value) => setEditingLesson({ ...editingLesson, grade: value })}
                            >
                                <Select.Option value="1">{t('grade')} 1</Select.Option>
                                <Select.Option value="2">{t('grade')} 2</Select.Option>
                                <Select.Option value="3">{t('grade')} 3</Select.Option>
                            </Select>
                            {errors.grade && <div className="error-text">{errors.grade}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('type')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('inputType')}
                                value={editingLesson?.type || undefined}
                                onChange={(value) => setEditingLesson({ ...editingLesson, type: value })}
                            >
                                {lessonTypes.map((type) => (
                                    <Select.Option key={type.value} value={type.value}>
                                        {type.label}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.type && <div className="error-text">{errors.type}</div>}
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

export default Lesson;