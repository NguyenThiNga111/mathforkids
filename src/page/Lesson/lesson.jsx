import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Select, Modal } from 'antd';
import { Imgs } from '../../assets/theme/images';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaBook, FaPlus, FaMinus, FaTimes, FaDivide, FaBookOpen } from 'react-icons/fa';

import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './lesson.css';

const Lesson = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessonsData, setLessonsData] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all / enabled / disabled

    const { t, i18n } = useTranslation(['lesson', 'common']);
    const { Option } = Select;
    const lessonsPerPage = 16;
    const navigate = useNavigate();
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
                return dateB - dateA; // Mới nhất lên đầu
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
            newErrors.nameVi = t('nameViRequired'); // Thông báo lỗi nếu để trống
        } else if (editingLesson.name.vi.trim().length < 3) {
            newErrors.nameVi = t('nameViMinLength'); // Thông báo lỗi nếu tên quá ngắn
        } else if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]*$/.test(editingLesson.name.vi.trim())) {
            newErrors.nameVi = t('nameViInvalid'); // Thông báo lỗi nếu chứa ký tự đặc biệt không hợp lệ
        }
        // Kiểm tra tên bài học tiếng Anh
        if (!editingLesson?.name?.en || editingLesson.name.en.trim() === '') {
            newErrors.nameEn = t('nameEnRequired'); // Thông báo lỗi nếu để trống
        } else if (editingLesson.name.en.trim().length < 3) {
            newErrors.nameEn = t('nameEnMinLength'); // Thông báo lỗi nếu tên quá ngắn
        } else if (!/^[a-zA-Z0-9\s]*$/.test(editingLesson.name.en.trim())) {
            newErrors.nameEn = t('nameEnInvalid'); // Thông báo lỗi nếu chứa ký tự đặc biệt không hợp lệ
        }
        // Kiểm tra lớp học
        if (!editingLesson?.grade || editingLesson.grade === '') {
            newErrors.grade = t('gradeRequired'); // Thông báo lỗi nếu không chọn lớp
        } else if (!['1', '2', '3'].includes(String(editingLesson.grade))) {
            newErrors.grade = t('gradeInvalid'); // Thông báo lỗi nếu lớp không hợp lệ
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

            return matchStatus && matchGrade;
        });
    const indexOfLastLesson = currentPage * lessonsPerPage;
    const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
    const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);
    const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="containers">
            <Navbar />
            <div className="container-content">
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
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        value={selectedGrade}
                                    >
                                        <option value="">{t('grade')}</option>
                                        <option value="1">{t('grade')} 1</option>
                                        <option value="2">{t('grade')} 2</option>
                                        <option value="3">{t('grade')} 3</option>
                                    </select>
                                    <select
                                        className="filter-dropdown"
                                        value={filterStatus}
                                        onChange={(e) => {
                                            setFilterStatus(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="all">{t('lessonStatus')}</option>
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
                    <div className="table-container-lesson">
                        <table className="w-full bg-white shadow-md rounded-lg">
                            <thead>
                                <tr className="bg-gray-200 text-left">
                                    <th className="p-3">{t('.no', { ns: 'common' })}</th>
                                    <th className="p-3">{t('lessonName')}</th>
                                    <th className="p-3 text-center">{t('type')}</th>
                                    <th className="p-3 text-center">{t('grade')}</th>
                                    <th className="p-3 text-center">{t('action', { ns: 'common' })}</th>
                                    <th className="p-3 text-center">{t('available', { ns: 'common' })}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLessons.map((lesson, index) => (
                                    <tr key={lesson.id} className="border-t">
                                        <td className="p-3">{indexOfFirstLesson + index + 1}</td>
                                        <td className="p-3">{lesson.name?.[i18n.language]}</td>
                                        <td className="p-3 text-center">
                                            <span style={{ color: lessonTypes.find(type => type.value === lesson.type)?.color, fontSize: '20px' }}>
                                                {lessonTypes.find(type => type.value === lesson.type)?.icon || lesson.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">{lesson.grade}</td>
                                        <td className="p-3">
                                            <div className='buttonaction'>
                                                <button
                                                    className="text-white px-3 py-1 buttonupdate"
                                                    onClick={() => openModal('update', lesson)}
                                                >
                                                    {/* <img className="iconupdate" src={Imgs.edit} alt="Edit" /> */}
                                                    <FaEdit className="iconupdate" />
                                                    {t('update', { ns: 'common' })}
                                                </button>
                                                <button
                                                    className="text-white px-3 py-1 buttondetail"
                                                    onClick={() => handleViewExercises(lesson.id)}
                                                >
                                                    <FaBook className="iconupdate" />
                                                    {t('exercises')}
                                                </button>
                                                <button
                                                    className="text-white px-3 py-1 buttonlessondetail"
                                                    onClick={() => handleLessonDetail(lesson.id)}
                                                >
                                                    <FaBookOpen className="iconupdate" />
                                                    {t('detail')}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={lesson.isDisabled}
                                                    onChange={() => handleToggleAvailable(lesson)}
                                                />
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
                                <label className="titleinput">{t('lessonName')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
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
                                <label className="titleinput">{t('lessonName')} (English) <span style={{ color: 'red' }}>*</span></label>
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
                                <label className="titleinput">{t('grade')} <span style={{ color: 'red' }}>*</span></label>
                                <Select
                                    style={{ width: '100%', height: '50px' }}
                                    placeholder={t('inputgrade')}
                                    value={editingLesson?.grade || undefined}
                                    onChange={(value) => setEditingLesson({ ...editingLesson, grade: value })}
                                >
                                    <Option value="1">{t('grade')} 1</Option>
                                    <Option value="2">{t('grade')} 2</Option>
                                    <Option value="3">{t('grade')} 3</Option>
                                </Select>
                                {errors.grade && <div className="error-text">{errors.grade}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">{t('type')} <span style={{ color: 'red' }}>*</span></label>
                                <Select
                                    style={{ width: '100%', height: '50px' }}
                                    placeholder={t('inputType')}
                                    value={editingLesson?.type || undefined}
                                    onChange={(value) => setEditingLesson({ ...editingLesson, type: value })}
                                >
                                    {lessonTypes.map(type => (
                                        <Option key={type.value} value={type.value}>
                                            {type.label}
                                        </Option>
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
        </div>

    );
};

export default Lesson;