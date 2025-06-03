import { useState, useEffect } from 'react';
import { Input, Button, Modal, Select, Checkbox, Table, Pagination, Switch, Image, message } from 'antd';
import { FaEdit, FaInfoCircle } from 'react-icons/fa';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './assessment.css';
import Navbar from "../../component/Navbar";

const operationOptions = [
    { value: 'addition', label: { map: 'addition', en: 'Addition', vi: 'Cộng' } },
    { value: 'subtraction', label: { map: 'subtraction', en: 'Subtraction', vi: 'Trừ' } },
    { value: 'multiplication', label: { map: 'multiplication', en: 'Multiplication', vi: 'Nhân' } },
    { value: 'division', label: { map: 'division', en: 'Division', vi: 'Chia' } },
];

const Assessment = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [editingAssessment, setEditingAssessment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [assessments, setAssessments] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [optionFileList, setOptionFileList] = useState([[], [], []]);
    const [answerFileList, setAnswerFileList] = useState([]);
    const [optionType, setOptionType] = useState('text');
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterGrade, setFilterGrade] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [levels, setLevels] = useState([]);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const assessmentsPerPage = 16;
    const { t, i18n } = useTranslation(['assessment', 'common']);

    useEffect(() => {
        fetchAssessments();
        fetchLevels();
    }, []);

    const fetchAssessments = async () => {
        try {
            const response = await api.get(`/assessment`);
            const sortedAssessments = response.data.sort((a, b) => {
                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);
                return dateB - dateA; // Latest first
            });
            setAssessments(sortedAssessments);
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

    const getLevelName = (levelId) => {
        const level = levels.find((lvl) => lvl.id === levelId);
        if (level) {
            return level.name?.[i18n.language] || level.name || levelId;
        }
        return levelId;
    };

    const handleSave = async () => {
        if (validate()) {
            try {
                const formData = new FormData();
                formData.append('levelId', editingAssessment.levelId);
                formData.append('grade', editingAssessment.grade);
                formData.append('type', JSON.stringify(editingAssessment.type));
                formData.append('question', JSON.stringify(editingAssessment.question));

                if (fileList[0]?.originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }

                if (optionType === 'text') {
                    const validOptions = editingAssessment.option.filter(opt => opt.trim() !== '');
                    formData.append('option', JSON.stringify(validOptions));
                    formData.append('answer', editingAssessment.answer);
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
                if (editingAssessment.id) {
                    await api.put(`/assessment/${editingAssessment.id}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post(`/assessment`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchAssessments();
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

    const handleToggleAvailable = async (assessment) => {
        try {
            await api.put(`/assessment/${assessment.id}`, {
                isDisabled: !assessment.isDisabled,
            });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            setAssessments((prev) =>
                prev.map((a) =>
                    a.id === assessment.id ? { ...a, isDisabled: !assessment.isDisabled } : a
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
        if (!editingAssessment?.levelId || editingAssessment.levelId.trim() === '') {
            newErrors.levelId = t('levelIdRequired');
        }
        if (!editingAssessment?.grade || editingAssessment.grade < 1) {
            newErrors.grade = t('gradeRequired');
        }
        if (!editingAssessment?.type?.map || !editingAssessment?.type?.en || !editingAssessment?.type?.vi) {
            newErrors.type = t('typeRequired');
        }
        if (!editingAssessment?.question?.vi || editingAssessment.question.vi.trim() === '') {
            newErrors.questionVi = t('questionViRequired');
        }
        if (!editingAssessment?.question?.en || editingAssessment.question.en.trim() === '') {
            newErrors.questionEn = t('questionEnRequired');
        }
        if (optionType === 'text') {
            const validOptions = editingAssessment?.option?.filter(opt => opt && opt.trim() !== '');
            if (!validOptions || validOptions.length < 3) {
                newErrors.option = t('optionRequired');
            }
        } else if (optionType === 'image') {
            if (optionFileList.filter(list => list.length > 0).length < 3) {
                newErrors.option = t('optionImageRequired');
            }
        }
        if (optionType === 'text' && (!editingAssessment?.answer || editingAssessment.answer.trim() === '')) {
            newErrors.answer = t('answerRequired');
        }
        if (optionType === 'image' && answerFileList.length === 0) {
            newErrors.answer = t('answerImageRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openModal = (mode, assessment = null) => {
        if (mode === 'add') {
            setEditingAssessment({
                levelId: '',
                grade: '',
                type: { map: '', en: '', vi: '' },
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
            const isImageOption = assessment.option?.some(opt => opt.startsWith('http'));
            setEditingAssessment({
                ...assessment,
                option: assessment.option || ['', '', ''],
                answer: assessment.answer || '',
                image: assessment.image || '',
            });
            setOptionType(isImageOption ? 'image' : 'text');
            setImageUrl(assessment.image || '');
            setFileList(assessment.image ? [{ url: assessment.image }] : []);
            setOptionFileList(
                isImageOption && assessment.option
                    ? assessment.option.map(url => (url ? [{ url }] : []))
                    : [[], [], []]
            );
            setAnswerFileList(
                isImageOption && assessment.answer ? [{ url: assessment.answer }] : []
            );
        }
        setIsModalOpen(true);
    };

    const openDetailModal = (assessment) => {
        setSelectedAssessment(assessment);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedAssessment(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAssessment(null);
        setOptionType('text');
        setImageUrl('');
        setFileList([]);
        setOptionFileList([[], [], []]);
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
                const newOptions = [...editingAssessment.option];
                newOptions[index] = e.target.result;
                setEditingAssessment((prev) => ({
                    ...prev,
                    option: newOptions,
                }));
            };
            reader.readAsDataURL(fileObj);
        } else {
            const newOptions = [...editingAssessment.option];
            newOptions[index] = '';
            setEditingAssessment((prev) => ({
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
                setEditingAssessment((prev) => ({
                    ...prev,
                    answer: e.target.result,
                }));
            };
            reader.readAsDataURL(fileObj);
            setAnswerFileList([info.fileList[info.fileList.length - 1]]);
        } else {
            setEditingAssessment((prev) => ({
                ...prev,
                answer: '',
            }));
            setAnswerFileList([]);
        }
    };

    const handleRemoveImage = () => {
        setFileList([]);
        setImageUrl('');
        message.info('Ảnh đã được xóa.');
    };

    const handleRemoveOptionImage = (index) => {
        const newOptionFileList = [...optionFileList];
        newOptionFileList[index] = [];
        setOptionFileList(newOptionFileList);

        const newOptions = [...editingAssessment.option];
        newOptions[index] = '';
        setEditingAssessment((prev) => ({
            ...prev,
            option: newOptions,
        }));
        message.info(`Ảnh option ${index + 1} đã được xóa.`);
    };

    const handleRemoveAnswerImage = () => {
        setAnswerFileList([]);
        setEditingAssessment((prev) => ({
            ...prev,
            answer: '',
        }));
        message.info('Ảnh đáp án đã được xóa.');
    };

    const parseDate = (dateString) => {
        const [time, date] = dateString.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const filteredAssessments = assessments.filter(assessment => {
        const matchLevel = filterLevel === 'all' ? true : assessment.levelId === filterLevel;
        const matchType = filterType === 'all' ? true : assessment.type?.map === filterType;
        const matchGrade = filterGrade === 'all' ? true : assessment.grade === Number(filterGrade);
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'no'
                    ? assessment.isDisabled === false
                    : assessment.isDisabled === true;
        const searchText = searchQuery.toLowerCase();
        const questionName = assessment.question?.[i18n.language]?.toLowerCase() || '';
        return matchStatus && matchLevel && matchType && matchGrade && questionName.includes(searchText);
    });

    // Ant Design Table columns
    const columns = [
        {
            title: t('no', { ns: 'common' }),
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => (currentPage - 1) * assessmentsPerPage + index + 1,
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
            title: t('answer'),
            dataIndex: 'answer',
            key: 'answer',
            align: 'center',
            render: (answer) => (
                answer && answer.startsWith("http") ? (
                    <Image
                        src={answer}
                        alt="Answer"
                        width={90}
                        height={90}
                        style={{ objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc' }}
                    />
                ) : (
                    <span>{answer}</span>
                )
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

    return (
        <div className="containers">
            <Navbar />
            <div className="title-search">
                <h1 className="container-title">{t('managementAssessment')}</h1>
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
                            value={filterGrade}
                            onChange={(value) => {
                                setFilterGrade(value);
                                setCurrentPage(1);
                            }}
                            placeholder={t('grade')}
                        >
                            <Select.Option value="all">{t('grade')}</Select.Option>
                            <Select.Option value="1">{t('grade')} 1</Select.Option>
                            <Select.Option value="2">{t('grade')} 2</Select.Option>
                            <Select.Option value="3">{t('grade')} 3</Select.Option>
                        </Select>
                        <Select
                            className="filter-dropdown"
                            value={filterType}
                            onChange={(value) => {
                                setFilterType(value);
                                setCurrentPage(1);
                            }}
                            placeholder={t('allTypes')}
                        >
                            <Select.Option value="all">{t('allTypes')}</Select.Option>
                            {operationOptions.map((option) => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label[i18n.language]}
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
                            placeholder={t('assessmentStatus')}
                        >
                            <Select.Option value="all">{t('assessmentStatus')}</Select.Option>
                            <Select.Option value="yes">{t('yes', { ns: 'common' })}</Select.Option>
                            <Select.Option value="no">{t('no', { ns: 'common' })}</Select.Option>
                        </Select>
                    </div>
                    <Button className="rounded-add" onClick={() => openModal('add')}>
                        + {t('addNew', { ns: 'common' })}
                    </Button>
                </div>
                <div className="table-container-assessment">
                    <Table
                        columns={columns}
                        dataSource={filteredAssessments.slice(
                            (currentPage - 1) * assessmentsPerPage,
                            currentPage * assessmentsPerPage
                        )}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                    <div className="paginations">
                        <Pagination
                            current={currentPage}
                            total={filteredAssessments.length}
                            pageSize={assessmentsPerPage}
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
                                                currentPage === Math.ceil(filteredAssessments.length / assessmentsPerPage)
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
                </div>
                {/* Detail Modal */}
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                            {t('assessmentdetail')}
                        </div>
                    }
                    open={isDetailModalOpen}
                    onCancel={closeDetailModal}
                    footer={null}
                    className="modal-content"
                >
                    {selectedAssessment && (
                        <div className="form-content-assessment-detail">
                            <div className="detail-item">
                                <label className="detail-label">{t('question')} (Vietnamese)</label>
                                <div className="detail-content">{selectedAssessment.question?.vi || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('question')} (English)</label>
                                <div className="detail-content">{selectedAssessment.question?.en || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('level')}</label>
                                <div className="detail-content">{getLevelName(selectedAssessment.levelId)}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('grade')}</label>
                                <div className="detail-content">{selectedAssessment.grade || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('type')}</label>
                                <div className="detail-content">{selectedAssessment.type?.[i18n.language] || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">{t('image')}</label>
                                <div className="detail-content">
                                    {selectedAssessment.image ? (
                                        <Image
                                            src={selectedAssessment.image}
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
                                    {selectedAssessment.option?.map((opt, index) => (
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
                                    {selectedAssessment.answer && selectedAssessment.answer.startsWith("http") ? (
                                        <Image
                                            src={selectedAssessment.answer}
                                            alt="Answer"
                                            className="answer-image"
                                        />
                                    ) : (
                                        <span>{selectedAssessment.answer || '-'}</span>
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
                            {editingAssessment?.id ? t('updateAssessment') : t('addAssessment')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-assessment">
                        <div className="inputtext">
                            <label className="titleinput">{t('question')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputQuestionVi')}
                                value={editingAssessment?.question?.vi || ''}
                                onChange={(e) =>
                                    setEditingAssessment({
                                        ...editingAssessment,
                                        question: { ...editingAssessment.question, vi: e.target.value },
                                    })
                                }
                            />
                            {errors.questionVi && <div className="error-text">{errors.questionVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('question')} (English) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputQuestionEn')}
                                value={editingAssessment?.question?.en || ''}
                                onChange={(e) =>
                                    setEditingAssessment({
                                        ...editingAssessment,
                                        question: { ...editingAssessment.question, en: e.target.value },
                                    })
                                }
                            />
                            {errors.questionEn && <div className="error-text">{errors.questionEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('level')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectLevelId')}
                                value={editingAssessment?.levelId || null}
                                onChange={(value) =>
                                    setEditingAssessment({
                                        ...editingAssessment,
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
                            <label className="titleinput">{t('grade')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectGrade')}
                                value={editingAssessment?.grade || null}
                                onChange={(value) =>
                                    setEditingAssessment({
                                        ...editingAssessment,
                                        grade: parseInt(value),
                                    })
                                }
                            >
                                {[1, 2, 3].map((grade) => (
                                    <Select.Option key={grade} value={grade}>
                                        {t('grade')} {grade}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.grade && <div className="error-text">{errors.grade}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('type')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectType')}
                                value={editingAssessment?.type?.map || null}
                                onChange={(value) => {
                                    const selectedOption = operationOptions.find(opt => opt.value === value);
                                    setEditingAssessment({
                                        ...editingAssessment,
                                        type: {
                                            map: selectedOption.label.map,
                                            en: selectedOption.label.en,
                                            vi: selectedOption.label.vi,
                                        },
                                    });
                                }}
                            >
                                {operationOptions.map((option) => (
                                    <Select.Option key={option.value} value={option.value}>
                                        {option.label[i18n.language]}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.type && <div className="error-text">{errors.type}</div>}
                        </div>
                        <div className="inputtexts">
                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                <label className="titleinput">{t('textOption')}</label>
                                <Checkbox
                                    checked={optionType === 'text'}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setOptionType('text');
                                            setEditingAssessment((prev) => ({
                                                ...prev,
                                                option: ['', '', ''],
                                                answer: '',
                                            }));
                                            setOptionFileList([[], [], []]);
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
                                            setEditingAssessment((prev) => ({
                                                ...prev,
                                                option: ['', '', ''],
                                                answer: '',
                                            }));
                                            setOptionFileList([[], [], []]);
                                            setAnswerFileList([]);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('option')} <span style={{ color: 'red' }}>*</span></label>
                            {optionType === 'text' ? (
                                editingAssessment?.option?.map((opt, index) => (
                                    <Input
                                        key={index}
                                        placeholder={`${t('option')} ${index + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...editingAssessment.option];
                                            newOptions[index] = e.target.value;
                                            setEditingAssessment({
                                                ...editingAssessment,
                                                option: newOptions,
                                            });
                                        }}
                                        style={{ marginBottom: '10px' }}
                                    />
                                ))
                            ) : (
                                editingAssessment?.option?.map((opt, index) => (
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
                            {errors.option && <div className="error-text">{errors.option}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('answer')} <span style={{ color: 'red' }}>*</span></label>
                            {optionType === 'text' ? (
                                <Input
                                    placeholder={t('inputAnswer')}
                                    value={editingAssessment?.answer || ''}
                                    onChange={(e) =>
                                        setEditingAssessment({
                                            ...editingAssessment,
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
                                                src={editingAssessment.answer}
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

export default Assessment;