import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Modal, Select, Checkbox, Breadcrumb, Table, Pagination, Switch, Image } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { Imgs } from "../../assets/theme/images";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaBook, FaInfoCircle } from 'react-icons/fa';
import api from '../../assets/api/Api';
import './exercise.css';
import Navbar from "../../component/Navbar";

const Exercise = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [exercises, setExercises] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [optionFileList, setOptionFileList] = useState([]);
    const [answerFileList, setAnswerFileList] = useState([]);
    const [optionType, setOptionType] = useState('text');
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [levels, setLevels] = useState([]);
    const [errors, setErrors] = useState('');
    const [lesson, setLesson] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const exercisesPerPage = 16;
    const { Option } = Select;
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['exercise', 'common']);

    useEffect(() => {
        fetchExercises();
        fetchLevels();
        fetchLesson();
    }, [lessonId]);

    const fetchExercises = async () => {
        try {
            const response = await api.get(`/exercise/lessonId/${lessonId}`);
            const sortedExercises = response.data.sort((a, b) => {
                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);
                return dateB - dateA; // Latest first
            });
            setExercises(sortedExercises);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const fetchLevels = async () => {
        try {
            const response = await api.get(`/level/enabled`);
            setLevels(response.data);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const fetchLesson = async () => {
        try {
            const response = await api.get(`/lesson/${lessonId}`);
            setLesson(response.data);
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

    const handleSave = async () => {
        if (validate()) {
            try {
                const formData = new FormData();
                formData.append('levelId', editingExercise.levelId);
                formData.append('lessonId', lessonId);
                formData.append('question', JSON.stringify(editingExercise.question));
                if (fileList[0]?.originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }
                if (optionType === 'text') {
                    const validOptions = editingExercise.option.filter(opt => opt && opt.trim() !== '');
                    formData.append('option', JSON.stringify(validOptions));
                    formData.append('answer', editingExercise.answer);
                } else {
                    // Build full option array: image cũ (giữ nguyên URL), image mới (dùng file)
                    const fullOption = [];

                    for (let i = 0; i < optionFileList.length; i++) {
                        const fileEntry = optionFileList[i];
                        if (fileEntry[0]?.originFileObj) {
                            // Ảnh mới => push file
                            formData.append('option', fileEntry[0].originFileObj);
                        } else if (typeof editingExercise.option[i] === 'string') {
                            // Ảnh cũ => gửi lại URL để BE giữ nguyên
                            fullOption.push(editingExercise.option[i]);
                        }
                    }

                    // Gửi thêm mảng chuỗi URL ảnh cũ để server merge
                    if (fullOption.length > 0) {
                        formData.append('existingOptionUrls', JSON.stringify(fullOption));
                    }
                    if (answerFileList[0]?.originFileObj) {
                        formData.append('answer', answerFileList[0].originFileObj);
                    }
                }
                console.log('Form Data to be sent:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value instanceof File ? value.name : value);
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
                            'Content-Type': 'multipart/form-data',
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
            await api.put(`/exercise/${exercise.id}`, {
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

    const validate = () => {
        const newErrors = {};

        if (!editingExercise?.levelId || editingExercise.levelId.trim() === '') {
            newErrors.levelId = t('levelIdRequired');
        }
        if (!editingExercise?.question?.vi || editingExercise.question.vi.trim() === '') {
            newErrors.questionVi = t('questionViRequired');
        }
        if (!editingExercise?.question?.en || editingExercise.question.en.trim() === '') {
            newErrors.questionEn = t('questionEnRequired');
        }
        if (optionType === 'text') {
            const validOptions = editingExercise?.option?.filter(opt => opt && opt.trim() !== '');
            if (!validOptions || validOptions.length === 0) {
                newErrors.option = t('optionRequired');
            }
        } else if (optionType === 'image') {
            if (optionFileList.filter(list => list.length > 0).length === 0) {
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
                lessonId: lessonId,
                question: { en: '', vi: '' },
                option: [''],
                answer: '',
                image: '',
            });
            setOptionType('text');
            setImageUrl('');
            setFileList([]);
            setOptionFileList([[]]);
            setAnswerFileList([]);
        } else if (mode === 'update') {
            const isImageOption = exercise.option?.some(opt => opt.startsWith('http'));
            setEditingExercise({
                ...exercise,
                option: exercise.option || [''],
                answer: exercise.answer || '',
                image: exercise.image || '',
            });
            setOptionType(isImageOption ? 'image' : 'text');
            setImageUrl(exercise.image || '');
            setFileList(exercise.image ? [{ url: exercise.image }] : []);
            setOptionFileList(
                isImageOption && exercise.option
                    ? exercise.option.map(url => (url ? [{ url }] : []))
                    : [[]]
            );
            setAnswerFileList(
                isImageOption && exercise.answer ? [{ url: exercise.answer }] : []
            );
        }
        setIsModalOpen(true);
    };

    const openDetailModal = (exercise) => {
        setSelectedExercise(exercise);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedExercise(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExercise(null);
        setOptionType('text');
        setImageUrl('');
        setFileList([]);
        setOptionFileList([[]]);
        setAnswerFileList([]);
        setErrors({});
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

    const handleRemoveImage = () => {
        setFileList([]);
        setImageUrl('');
    };
    const addOption = () => {
        if (editingExercise.option.length >= 3) {
            toast.error(t('maxThreeOptions', { ns: 'common' })); // Notify user of the limit
            return;
        }
        setEditingExercise((prev) => ({
            ...prev,
            option: [...prev.option, ''], // Add a new empty option
        }));
        setOptionFileList((prev) => [...prev, []]); // Add a new empty file list
    };

    const removeOption = (index) => {
        if (editingExercise.option.length === 1) {
            toast.error(t('atLeastOneOption', { ns: 'common' })); // Add this translation to your i18n files
            return;
        }
        setEditingExercise((prev) => ({
            ...prev,
            option: prev.option.filter((_, i) => i !== index),
        }));
        setOptionFileList((prev) => prev.filter((_, i) => i !== index));
    };
    const handleRemoveOptionImage = (index) => {
        const newOptionFileList = [...optionFileList];
        newOptionFileList[index] = [];
        setOptionFileList(newOptionFileList);

        const newOptions = [...editingExercise.option];
        newOptions[index] = '';
        setEditingExercise((prev) => ({
            ...prev,
            option: newOptions,
        }));
    };

    const handleRemoveAnswerImage = () => {
        setAnswerFileList([]);
        setEditingExercise((prev) => ({
            ...prev,
            answer: '',
        }));
    };

    const parseDate = (dateString) => {
        const [time, date] = dateString.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const filteredExercises = exercises.filter(exercise => {
        const matchLevel = filterLevel === 'all' ? true : exercise.levelId === filterLevel;
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'no'
                    ? exercise.isDisabled === false
                    : exercise.isDisabled === true;
        const searchText = searchQuery.toLowerCase();
        const exerciseName = exercise.question?.[i18n.language]?.toLowerCase() || '';
        return matchStatus && matchLevel && exerciseName.includes(searchText);
    });

    // Ant Design Table columns
    const columns = [
        {
            title: t('.no', { ns: 'common' }),
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => (currentPage - 1) * exercisesPerPage + index + 1,
        },
        {
            title: t('question'),
            dataIndex: 'question',
            key: 'question',
            render: (question) => question?.[i18n.language] || '',
        },
        {
            title: t('image'),
            dataIndex: 'image',
            key: 'image',
            align: 'center',
            render: (image, record) => (
                image ? (
                    <Image
                        src={image}
                        alt={record.question?.[i18n.language]}
                        width={200}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '8px', border: '2px solid #ccc' }}
                    />
                ) : null
            ),
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
                        onClick={() => openDetailModal(record)}
                    >
                        <FaInfoCircle className="iconupdate" />
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

    const breadcrumbItems = [
        {
            title: t('lesson'),
            onClick: () => navigate('/lesson'),
        },
        {
            title: lesson?.name?.[i18n.language] || lessonId,
        },
    ];

    return (
        <div className="containers">
            <Navbar />
            <Breadcrumb items={breadcrumbItems} style={{ marginTop: 10, marginBottom: -20 }} />
            <div className="title-search">
                <h1 className="container-title">
                    {t('managementExercise')} - {lesson?.name?.[i18n.language] || lessonId}
                </h1>
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
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                    <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
                                </span>
                                <Select
                                    className="filter-dropdown"
                                    value={filterLevel}
                                    onChange={(value) => {
                                        setFilterLevel(value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder={t('level')}
                                >
                                    <Select.Option value="all">{t('level')}</Select.Option>
                                    {levels.map((level) => (
                                        <Select.Option key={level.id} value={level.id}>
                                            {level.name?.[i18n.language] || level.name || level.id}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(value) => {
                                        setFilterStatus(value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder={t('exerciseStatus')}
                                >
                                    <Select.Option value="all">{t('exerciseStatus')}</Select.Option>
                                    <Select.Option value="yes">{t('yes', { ns: 'common' })}</Select.Option>
                                    <Select.Option value="no">{t('no', { ns: 'common' })}</Select.Option>
                                </Select>
                            </div>
                        </div>
                        <Button className="rounded-add" onClick={() => openModal('add')}>
                            + {t('addNew', { ns: 'common' })}
                        </Button>
                    </div>
                </div>
                <div className="table-container-exercise">
                    <Table
                        columns={columns}
                        dataSource={filteredExercises.slice(
                            (currentPage - 1) * exercisesPerPage,
                            currentPage * exercisesPerPage
                        )}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                </div>

                <div className="paginations">
                    <Pagination
                        current={currentPage}
                        total={filteredExercises.length}
                        pageSize={exercisesPerPage}
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
                                            currentPage === Math.ceil(filteredExercises.length / exercisesPerPage)
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
                {/* Detail Modal */}
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                            {t('exercisedetail')}
                        </div>
                    }
                    open={isDetailModalOpen}
                    onCancel={closeDetailModal}
                    footer={null}
                    className="modal-content"
                >
                    {selectedExercise && (
                        <div className="form-content-assessment-detail">
                            <div className="detail-item">
                                <label className="detail-label">{t('question')} (Vietnamese)</label>
                                <div className="detail-content">{selectedExercise.question?.vi || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('question')} (English)</label>
                                <div className="detail-content">{selectedExercise.question?.en || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('level')}</label>
                                <div className="detail-content">{getLevelName(selectedExercise.levelId)}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('image')}</label>
                                <div className="detail-content">
                                    {selectedExercise.image ? (
                                        <Image
                                            src={selectedExercise.image}
                                            alt="Assessment"
                                            className="assessment-image"
                                        />
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('option')}</label>
                                <div className="detail-content option-grid">
                                    {selectedExercise.option?.map((opt, index) => (
                                        <div key={index} className="option-item">
                                            {opt && opt.startsWith("http") ? (
                                                <Image
                                                    src={opt}
                                                    alt={`Option ${index + 1}`}
                                                    className="option-image"
                                                />
                                            ) : (
                                                <span>{opt || '-'}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('answer')}</label>
                                <div className="detail-content">
                                    {selectedExercise.answer && selectedExercise.answer.startsWith("http") ? (
                                        <Image
                                            src={selectedExercise.answer}
                                            alt="Answer"
                                            className="answer-image"
                                        />
                                    ) : (
                                        <span>{selectedExercise.answer || '-'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
                {/* Edit/Add Modal */}
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
                    <div className="form-content-exercise">
                        <div className="inputtext">
                            <label className="titleinput">{t('question')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
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
                            <label className="titleinput">{t('question')} (English) <span style={{ color: 'red' }}>*</span></label>
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
                                    <Image src={imageUrl} alt="Preview" className="preview-image" />
                                    <DeleteOutlined
                                        onClick={handleRemoveImage}
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            fontSize: 20,
                                            color: '#ff4d4f',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            borderRadius: '50%',
                                            padding: 4,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('level')} <span style={{ color: 'red' }}>*</span></label>
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
                                        {level.name?.[i18n.language] || level.id}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.levelId && <div className="error-text">{errors.levelId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('answer')} <span style={{ color: 'red' }}>*</span></label>
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
                                            <Image
                                                src={editingExercise.answer}
                                                alt="Answer"
                                                className="preview-image-option"
                                            />
                                            <DeleteOutlined
                                                onClick={handleRemoveAnswerImage}
                                                style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    fontSize: 20,
                                                    color: '#ff4d4f',
                                                    cursor: 'pointer',
                                                    background: '#fff',
                                                    borderRadius: '50%',
                                                    padding: 4,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.answer && <div className="error-text">{errors.answer}</div>}
                        </div>
                        <div className="inputtexts">
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label className="titleinput">{t('textOption')}</label>
                                <Checkbox
                                    checked={optionType === 'text'}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setOptionType('text');
                                            setEditingExercise((prev) => ({
                                                ...prev,
                                                option: [''],
                                                answer: '',
                                            }));
                                            setOptionFileList([[]]);
                                            setAnswerFileList([]);
                                        }
                                    }}
                                />
                                <label className="titleinput">{t('imageOption')}</label>
                                <Checkbox
                                    checked={optionType === 'image'}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setOptionType('image');
                                            setEditingExercise((prev) => ({
                                                ...prev,
                                                option: [''],
                                                answer: '',
                                            }));
                                            setOptionFileList([[]]);
                                            setAnswerFileList([]);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('option')} <span style={{ color: 'red' }}>*</span></label>
                            {optionType === 'text' ? (
                                editingExercise?.option?.map((opt, index) => (
                                    <div key={index} className='option-text'>
                                        <Input
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
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            onClick={() => removeOption(index)}
                                            icon={<DeleteOutlined />}
                                            style={{
                                                position: 'absolute',
                                                top: 3,
                                                right: 8,
                                                fontSize: 20,
                                                color: '#ff4d4f',
                                                cursor: 'pointer',
                                                background: '#fff',
                                                borderRadius: '50%',
                                                padding: 4,
                                            }}
                                        />
                                    </div>
                                ))
                            ) : (
                                editingExercise?.option?.map((opt, index) => (
                                    <div key={index} style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
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
                                            <Button
                                                onClick={() => removeOption(index)}
                                                style={{ marginLeft: '10px', color: '#ff4d4f' }}
                                                icon={<DeleteOutlined />}
                                            />
                                        </div>
                                        {optionFileList[index].length > 0 && (
                                            <div className="image-preview-box-option">
                                                <Image
                                                    src={opt}
                                                    alt={`Option ${index + 1}`}
                                                    className="preview-image-option"
                                                />
                                                <DeleteOutlined
                                                    onClick={() => handleRemoveOptionImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        fontSize: 20,
                                                        color: '#ff4d4f',
                                                        cursor: 'pointer',
                                                        background: '#fff',
                                                        borderRadius: '50%',
                                                        padding: 4,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            <Button
                                onClick={addOption}
                                style={{ marginTop: '10px' }}
                                className="custom-upload-button"
                            >
                                + {t('addOption', { ns: 'common' })}
                            </Button>
                            {errors.option && <div className="error-text">{errors.option}</div>}
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

export default Exercise;