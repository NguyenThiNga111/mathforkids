import { useState, useEffect } from 'react';
import './exercise.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Modal, Select, Checkbox } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { Imgs } from "../../assets/theme/images";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';

const exercise = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [exercises, setExercises] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [optionFileList, setOptionFileList] = useState([[], [], []]);
    const [answerFileList, setAnswerFileList] = useState([]);
    const [optionType, setOptionType] = useState('text');
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterLesson, setFilterLesson] = useState('all'); // Replaced filterGrade with filterLesson
    const [filterStatus, setFilterStatus] = useState('all');
    const [levels, setLevels] = useState([]);
    const [lessons, setLessons] = useState([]); // New state for lessons
    const [errors, setErrors] = useState('');

    const exercisePage = 3;
    const { t, i18n } = useTranslation(['exercise', 'common']);

    useEffect(() => {
        fetchExercises();
        fetchLevels();
        fetchLessons(); // Added fetchLessons
    }, []);

    const fetchExercises = async () => {
        try {
            const response = await api.get(`/exercise`);
            setExercises(response.data);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const fetchLevels = async () => {
        try {
            const response = await api.get(`/level`);
            setLevels(response.data);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const fetchLessons = async () => {
        try {
            const response = await api.get(`/lesson`);
            setLessons(response.data);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const getLevelName = (levelId) => {
        const level = levels.find((lvl) => lvl.id === levelId);
        return level ? (level.name?.[i18n.language] || level.name || levelId) : levelId;
    };

    const getLessonName = (lessonId) => {
        const lesson = lessons.find((lsn) => lsn.id === lessonId);
        return lesson ? (lesson.name?.[i18n.language] || lesson.name || lessonId) : lessonId;
    };

    const handleSave = async () => {
        if (Validation()) {
            try {
                const formData = new FormData();
                formData.append('levelId', editingExercise.levelId);
                formData.append('lessonId', editingExercise.lessonId); // Replaced grade with lessonId
                formData.append('question', JSON.stringify(editingExercise.question));

                if (fileList[0]?.originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }

                if (optionType === 'text') {
                    const validOptions = editingExercise.option.filter(opt => opt.trim() !== '');
                    formData.append('option', JSON.stringify(validOptions));
                    formData.append('answer', editingExercise.answer);
                } else {
                    optionFileList.forEach((fileList, index) => {
                        if (fileList[0]?.originFileObj) {
                            formData.append('option', fileList[0].originFileObj);
                        }
                    });
                    if (answerFileList[0]?.originFileObj) {
                        formData.append('answer', answerFileList[0].originFileObj);
                    }
                }
                if (editingExercise.id) {
                    await api.put(`/exercise/${editingExercise.id}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post(`/exercise`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchExercises();
                closeModal();
            } catch (error) {
                toast.error(t('validationFailed', { ns: 'common' }), {
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

    const handleToggleAvailable = async (exercise) => {
        try {
            await api.put(`/exercise/disable/${exercise.id}`, {
                isDisabled: !exercise.isDisabled,
            });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            setExercises((prev) =>
                prev.map((e) =>
                    e.id === exercise.id ? { ...e, isDisabled: !exercise.isDisabled } : e
                )
            );
        } catch (error) {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const Validation = () => {
        const newErrors = {};

        if (!editingExercise?.levelId || editingExercise.levelId.trim() === '') {
            newErrors.levelId = t('levelIdRequired');
        }
        if (!editingExercise?.lessonId || editingExercise.lessonId.trim() === '') {
            newErrors.lessonId = t('lessonIdRequired');
        }
        if (!editingExercise?.question?.vi || editingExercise.question.vi.trim() === '') {
            newErrors.questionVi = t('questionViRequired');
        }
        if (!editingExercise?.question?.en || editingExercise.question.en.trim() === '') {
            newErrors.questionEn = t('questionEnRequired');
        }
        if (optionType === 'text') {
            const validOptions = editingExercise?.option?.filter(opt => opt && opt.trim() !== '');
            if (!validOptions || validOptions.length < 3) {
                newErrors.option = t('optionRequired');
            }
        } else if (optionType === 'image') {
            if (optionFileList.filter(list => list.length > 0).length < 3) {
                newErrors.option = t('optionImageRequired');
            }
        }
        if (optionType === 'text' && (!editingExercise?.answer || editingExercise.answer.trim() === '')) {
            newErrors.answer = t('answerRequired');
        }
        if (optionType === 'image' && answerFileList.length === 0) {
            newErrors.answer = t('answerImageRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openModal = (mode, exercise = null) => {
        if (mode === 'add') {
            setEditingExercise({
                levelId: '',
                lessonId: '', // Replaced grade with lessonId
                question: { en: '', vi: '' },
                option: ['', '', ''],
                answer: '',
                image: '',
            });
            setOptionType('text');
            setImageUrl('');
            setFileList([]);
            setOptionFileList([[], [], []]);
            setAnswerFileList([]);
        } else if (mode === 'update') {
            const isImageOption = exercise.option?.some(opt => opt.startsWith('http'));
            setEditingExercise({
                ...exercise,
                option: exercise.option || ['', '', ''],
                answer: exercise.answer || '',
                image: exercise.image || '',
            });
            setOptionType(isImageOption ? 'image' : 'text');
            setImageUrl(exercise.image || '');
            setFileList(exercise.image ? [{ url: exercise.image }] : []);
            setOptionFileList(
                isImageOption && exercise.option
                    ? exercise.option.map(url => (url ? [{ url }] : []))
                    : [[], [], []]
            );
            setAnswerFileList(
                isImageOption && exercise.answer ? [{ url: exercise.answer }] : []
            );
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExercise(null);
        setOptionType('text');
        setImageUrl('');
        setFileList([]);
        setOptionFileList([[], [], []]);
        setAnswerFileList([]);
        setErrors('');
    };

    const handleImageChange = (info) => {
        const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
        if (fileObj) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(fileObj);
            setFileList([info.fileList[info.fileList.length - 1]]);
        }
    };

    const handleOptionImageChange = (index, info) => {
        const newOptionFileList = [...optionFileList];
        newOptionFileList[index] = info.fileList.slice(-1);
        setOptionFileList(newOptionFileList);
        if (info.fileList.length > 0) {
            const fileObj = info.fileList[info.fileList.length - 1].originFileObj;
            const reader = new FileReader();
            reader.onload = (e) => {
                const newOptions = [...editingExercise.option];
                newOptions[index] = e.target.result;
                setEditingExercise((prev) => ({
                    ...prev,
                    option: newOptions,
                }));
            };
            reader.readAsDataURL(fileObj);
        } else {
            const newOptions = [...editingExercise.option];
            newOptions[index] = '';
            setEditingExercise((prev) => ({
                ...prev,
                option: newOptions,
            }));
        }
    };

    const handleAnswerImageChange = (info) => {
        const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
        if (fileObj) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEditingExercise((prev) => ({
                    ...prev,
                    answer: e.target.result,
                }));
            };
            reader.readAsDataURL(fileObj);
            setAnswerFileList([info.fileList[info.fileList.length - 1]]);
        } else {
            setEditingExercise((prev) => ({
                ...prev,
                answer: '',
            }));
            setAnswerFileList([]);
        }
    };

    const filteredExercises = exercises.filter((exercise) => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'yes'
                    ? !exercise.isDisabled
                    : exercise.isDisabled;

        const matchLevel =
            filterLevel === 'all' || exercise.levelId === filterLevel;

        const matchLesson =
            filterLesson === 'all' || exercise.lessonId === filterLesson;

        return matchStatus && matchLevel && matchLesson;
    });

    const indexOfLastExercise = currentPage * exercisePage;
    const indexOfFirstExercise = indexOfLastExercise - exercisePage;
    const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
    const totalPage = Math.ceil(filteredExercises.length / exercisePage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('managementExercise')}</h1>
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
                                    value={filterLevel}
                                    onChange={(e) => {
                                        setFilterLevel(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('level')}</option>
                                    {levels.map((level) => (
                                        <option key={level.id} value={level.id}>
                                            {level.name?.[i18n.language] || level.name || level.id}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="filter-dropdown"
                                    value={filterLesson}
                                    onChange={(e) => {
                                        setFilterLesson(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('lesson')}</option>
                                    {lessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {lesson.name?.[i18n.language] || lesson.name || lesson.id}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('exerciseStatus')}</option>
                                    <option value="yes">{t('yes', { ns: 'common' })}</option>
                                    <option value="no">{t('no', { ns: 'common' })}</option>
                                </select>
                                <button className="export-button">{t('exportFile', { ns: 'common' })}</button>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 text-white px-8 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + {t('addNew', { ns: 'common' })}
                        </button>
                    </div>
                </div>
                <table className="w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">{t('question')}</th>
                            <th className="p-3">{t('option')}</th>
                            <th className="p-3">{t('answer')}</th>
                            <th className="p-3">{t('image')}</th>
                            <th className="p-3">{t('level')}</th>
                            <th className="p-3">{t('lesson')}</th>
                            <th className="p-3">{t('action', { ns: 'common' })}</th>
                            <th className="p-3">{t('available', { ns: 'common' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentExercises.map((exercise) => (
                            <tr key={exercise.id} className="border-t">
                                <td className="p-3">{exercise.question?.[i18n.language]}</td>
                                <td className="p-3">
                                    {exercise.option.map((item, index) => (
                                        item && item.startsWith("http") ? (
                                            <img
                                                key={index}
                                                src={item}
                                                alt={`Option ${index + 1}`}
                                                width="90"
                                                height="90"
                                                style={{ objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc', marginRight: '10px' }}
                                            />
                                        ) : (
                                            <span key={index} style={{ marginRight: '45px' }}>
                                                {item}
                                            </span>
                                        )
                                    ))}
                                </td>
                                <td className="p-3">
                                    {exercise.answer && exercise.answer.startsWith("http") ? (
                                        <img
                                            src={exercise.answer}
                                            alt="Answer"
                                            width="90"
                                            height="90"
                                            style={{ objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc' }}
                                        />
                                    ) : (
                                        <span>
                                            {exercise.answer}
                                        </span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {exercise.image && (
                                        <img
                                            src={exercise.image}
                                            alt={exercise.question?.[i18n.language]}
                                            width="200"
                                            height="100"
                                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    )}
                                </td>
                                <td className="p-3">{getLevelName(exercise.levelId)}</td>
                                <td className="p-3">{getLessonName(exercise.lessonId)}</td>
                                <td className="p-3">
                                    <button
                                        className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', exercise)}
                                    >
                                        <img className="iconupdate" src={Imgs.edit} />
                                        {t('update', { ns: 'common' })}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={exercise.isDisabled}
                                            onChange={() => handleToggleAvailable(exercise)}
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
                        </button>
                        {Array.from({ length: totalPage }, (_, index) => (
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
                            onClick={() => currentPage < totalPage && paginate(currentPage + 1)}
                            disabled={currentPage === totalPage}
                        >
                        </button>
                    </div>
                </div>
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingExercise?.id ? t('updateExercise') : t('addExercise')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-assessment">
                        <div className="inputtext">
                            <label className="titleinput">{t('question')} (Vietnamese)</label>
                            <Input
                                placeholder={t('inputQuestionVi')}
                                value={editingExercise?.question?.vi || ''}
                                onChange={(e) =>
                                    setEditingExercise({
                                        ...editingExercise,
                                        question: { ...editingExercise.question, vi: e.target.value },
                                    })
                                }
                            />
                            {errors.questionVi && <div className="error-text">{errors.questionVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('question')} (English)</label>
                            <Input
                                placeholder={t('inputQuestionEn')}
                                value={editingExercise?.question?.en || ''}
                                onChange={(e) =>
                                    setEditingExercise({
                                        ...editingExercise,
                                        question: { ...editingExercise.question, en: e.target.value },
                                    })
                                }
                            />
                            {errors.questionEn && <div className="error-text">{errors.questionEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('level')}</label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectLevelId')}
                                value={editingExercise?.levelId || null}
                                onChange={(value) =>
                                    setEditingExercise({
                                        ...editingExercise,
                                        levelId: value,
                                    })
                                }
                            >
                                {levels.map((level) => (
                                    <Select.Option key={level.id} value={level.id}>
                                        {level.name || level.id}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.levelId && <div className="error-text">{errors.levelId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('lesson')}</label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectLesson')}
                                value={editingExercise?.lessonId || null}
                                onChange={(value) =>
                                    setEditingExercise({
                                        ...editingExercise,
                                        lessonId: value,
                                    })
                                }
                            >
                                {lessons.map((lesson) => (
                                    <Select.Option key={lesson.id} value={lesson.id}>
                                        {lesson.name?.[i18n.language] || lesson.id}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.lessonId && <div className="error-text">{errors.lessonId}</div>}
                        </div>
                        <div className="inputtexts">
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label className="titleinput"> {t('textOption')}</label>
                                <Checkbox
                                    checked={optionType === 'text'}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setOptionType('text');
                                            setEditingExercise((prev) => ({
                                                ...prev,
                                                option: ['', '', ''],
                                                answer: '',
                                            }));
                                            setOptionFileList([[], [], []]);
                                            setAnswerFileList([]);
                                        }
                                    }}
                                >
                                </Checkbox>
                                <label className="titleinput"> {t('imageOption')}</label>
                                <Checkbox
                                    checked={optionType === 'image'}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setOptionType('image');
                                            setEditingExercise((prev) => ({
                                                ...prev,
                                                option: ['', '', ''],
                                                answer: '',
                                            }));
                                            setOptionFileList([[], [], []]);
                                            setAnswerFileList([]);
                                        }
                                    }}
                                >
                                </Checkbox>
                            </div>
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('option')}</label>
                            {optionType === 'text' ? (
                                editingExercise?.option?.map((opt, index) => (
                                    <Input
                                        key={index}
                                        placeholder={`${t('option')} ${index + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...editingExercise.option];
                                            newOptions[index] = e.target.value;
                                            setEditingExercise({
                                                ...editingExercise,
                                                option: newOptions,
                                            });
                                        }}
                                        style={{ marginBottom: '10px' }}
                                    />
                                ))
                            ) : (
                                editingExercise?.option?.map((opt, index) => (
                                    <div key={index} style={{ marginBottom: '20px' }}>
                                        <Upload
                                            accept="image/*"
                                            showUploadList={false}
                                            beforeUpload={() => false}
                                            onChange={(info) => handleOptionImageChange(index, info)}
                                            fileList={optionFileList[index]}
                                        >
                                            <Button icon={<UploadOutlined />} className="custom-upload-button">
                                                {t('uploadOption', { number: index + 1 })}
                                            </Button>
                                        </Upload>
                                        {optionFileList[index].length > 0 && (
                                            <div className="image-preview-box-option">
                                                <img
                                                    src={opt}
                                                    alt={`Option ${index + 1}`}
                                                    className="preview-image-option" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {errors.option && <div className="error-text">{errors.option}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('answer')}</label>
                            {optionType === 'text' ? (
                                <Input
                                    placeholder={t('inputAnswer')}
                                    value={editingExercise?.answer || ''}
                                    onChange={(e) =>
                                        setEditingExercise({
                                            ...editingExercise,
                                            answer: e.target.value,
                                        })
                                    }
                                />
                            ) : (
                                <div>
                                    <Upload
                                        accept="image/*"
                                        showUploadList={false}
                                        beforeUpload={() => false}
                                        onChange={handleAnswerImageChange}
                                        fileList={answerFileList}
                                    >
                                        <Button icon={<UploadOutlined />} className="custom-upload-button">
                                            {t('uploadAnswer')}
                                        </Button>
                                    </Upload>
                                    {answerFileList.length > 0 && (
                                        <div className="image-preview-box-option">
                                            <img
                                                src={editingExercise.answer}
                                                alt="Answer"
                                                className="preview-image-option" />
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.answer && <div className="error-text">{errors.answer}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('image')}</label>
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleImageChange}
                                fileList={fileList}
                            >
                                <Button icon={<UploadOutlined />} className="custom-upload-button">
                                    {t('inputImage')}
                                </Button>
                            </Upload>
                            {imageUrl && (
                                <div className="image-preview-box">
                                    <img src={imageUrl} alt="Preview" className="preview-image" />
                                </div>
                            )}
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

export default exercise;