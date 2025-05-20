import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal } from 'antd';
import { Imgs } from '../../assets/theme/images';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './lesson.css';

const Lesson = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lessonsData, setLessonsData] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedAvailable, setSelectedAvailable] = useState('');
    const [errors, setErrors] = useState({});

    const { t, i18n } = useTranslation(['lesson', 'common']);
    const { Option } = Select;

    const lessonsPerPage = 6;
    const indexOfLastLesson = currentPage * lessonsPerPage;
    const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
    const currentLessons = lessonsData.slice(indexOfFirstLesson, indexOfLastLesson);
    const totalPages = Math.ceil(lessonsData.length / lessonsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        fetchLessons();
    }, []);

    const openModal = (mode, lesson = null) => {
        if (mode === 'add') {
            setEditingLesson({ name: { en: '', vi: '' }, grade: '' });
        } else if (mode === 'update') {
            setEditingLesson(lesson);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const fetchLessons = async () => {
        try {
            const response = await api.get(`/lesson`);
            const formattedData = response.data
                .filter(lesson => typeof lesson.name === 'object')
                .map((lesson) => ({
                    ...lesson,
                    grade: Number(lesson.grade),
                }));

            setLessonsData(formattedData);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!editingLesson?.name?.vi || editingLesson.name.vi.trim() === '') {
            newErrors.nameVi = t('nameViRequired');
        }
        if (!editingLesson?.name?.en || editingLesson.name.en.trim() === '') {
            newErrors.nameEn = t('nameEnRequired');
        }
        if (!editingLesson?.grade || editingLesson.grade === '') {
            newErrors.grade = t('gradeRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const filteredLessons = currentLessons.filter(lesson => {
        const matchGrade = selectedGrade ? lesson.grade === Number(selectedGrade) : true;
        const matchAvailable = selectedAvailable === ''
            ? true
            : selectedAvailable === 'yes'
                ? lesson.available === true
                : lesson.available === false;
        return matchGrade && matchAvailable;
    });

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('managementLessons')}</h1>
                <div className="flex justify-between items-center mb-4">
                    <div className="filter-bar">
                        <div className="filter-container">
                            <div className="filter-containers">
                                <span className="filter-icon">
                                    <svg
                                        className="iconfilter"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                </span>
                                <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
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
                                    onChange={(e) => setSelectedAvailable(e.target.value)}
                                    value={selectedAvailable}
                                >
                                    <option value="">{t('lessonStatus')}</option>
                                    <option value="yes">{t('yes', { ns: 'common' })}</option>
                                    <option value="no">{t('no', { ns: 'common' })}</option>
                                </select>
                                <button className="export-button">{t('exportFile', { ns: 'common' })}</button>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + {t('addNew', { ns: 'common' })}
                        </button>
                    </div>
                </div>

                <table className="w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">{t('lessonName')}</th>
                            <th className="p-3">{t('grade')}</th>
                            <th className="p-3">{t('action', { ns: 'common' })}</th>
                            <th className="p-3">{t('available', { ns: 'common' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLessons.map((lesson) => (
                            <tr key={lesson.id} className="border-t">
                                <td className="p-3">{lesson.name?.[i18n.language]}</td>
                                <td className="p-3">{lesson.grade}</td>
                                <td className="p-3">
                                    <button
                                        className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', lesson)}
                                    >
                                        <img className="iconupdate" src={Imgs.edit} alt="Edit" />
                                        {t('update', { ns: 'common' })}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <label className="switch">
                                        <input type="checkbox" checked={lesson.available} readOnly />
                                        <span className="slider round"></span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end items-center mt-4 ml-auto">
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
                                className={`around ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
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
                            <label className="titleinput">{t('lessonName')} (Vietnamese)</label>
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
                            <label className="titleinput">{t('lessonName')} (English)</label>
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
                            <label className="titleinput">{t('grade')}</label>
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
                    </div>
                    <div className="button-row">
                        <Button type="primary" onClick={handleSave} block>
                            {t('save', { ns: 'common' })}
                        </Button>
                        <Button type="primary" onClick={closeModal} block>
                            {t('cancel', { ns: 'common' })}
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Lesson;