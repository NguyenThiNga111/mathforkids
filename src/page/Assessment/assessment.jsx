import { useState, useEffect } from 'react';
import './assessment.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Modal, Select, Checkbox } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { Imgs } from "../../assets/theme/images";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
const operationOptions = [
    { value: 'addition', label: { map: 'addition', en: 'Addition', vi: 'Cộng' } },
    { value: 'subtraction', label: { map: 'subtraction', en: 'Subtraction', vi: 'Trừ' } },
    { value: 'multiplication', label: { map: 'multiplication', en: 'Multiplication', vi: 'Nhân' } },
    { value: 'division', label: { map: 'division', en: 'Division', vi: 'Chia' } },
];

const Assessment = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [assessments, setAssessments] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [optionFileList, setOptionFileList] = useState([[], [], []]);
    const [answerFileList, setAnswerFileList] = useState([]);
    const [optionType, setOptionType] = useState('text');
    const [filterLevel, setFilterLevel] = useState('all'); // New state for level filter
    const [filterGrade, setFilterGrade] = useState('all'); // New state for grade filter
    const [filterType, setFilterType] = useState('all'); // New state for type filter
    const [filterStatus, setFilterStatus] = useState('all');
    const [levels, setLevels] = useState([]);
    const [errors, setErrors] = useState('');

    const assessmentPage = 3;
    const { t, i18n } = useTranslation(['assessment', 'common']);

    useEffect(() => {
        fetchAssessments();
        fetchLevels();
    }, []);

    const fetchAssessments = async () => {
        try {
            const response = await api.get(`/assessment`);
            setAssessments(response.data);
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
        if (Validation()) {
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
            await api.put(`/assessment/disable/${assessment.id}`, {
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

    const Validation = () => {
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
                type: { en: '', vi: '' },
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

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAssessment(null);
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
        newOptionFileList[index] = info.fileList.slice(-1); // Keep only the latest file
        setOptionFileList(newOptionFileList);
        if (info.fileList.length > 0) {
            const fileObj = info.fileList[info.fileList.length - 1].originFileObj;
            const reader = new FileReader();
            reader.onload = (e) => {
                const newOptions = [...editingAssessment.option];
                newOptions[index] = e.target.result; // Store base64 for preview
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
                    answer: e.target.result, // Store base64 for preview
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

    const filteredAssessments = assessments.filter((assessment) => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'yes'
                    ? !assessment.isDisabled
                    : assessment.isDisabled;

        const matchLevel =
            filterLevel === 'all' || assessment.levelId === filterLevel;

        const matchGrade =
            filterGrade === 'all' || assessment.grade.toString() === filterGrade;

        const matchType =
            filterType === 'all' || assessment.type?.map === filterType;

        return matchStatus && matchLevel && matchGrade && matchType;
    });

    const indexOfLastAssessment = currentPage * assessmentPage;
    const indexOfFirstAssessment = indexOfLastAssessment - assessmentPage;
    const currentAssessments = filteredAssessments.slice(indexOfFirstAssessment, indexOfLastAssessment);
    const totalPage = Math.ceil(filteredAssessments.length / assessmentPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('managementAssessment')}</h1>
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
                                    <option value="all">{t('level', { ns: 'common' })}</option>
                                    {levels.map((level) => (
                                        <option key={level.id} value={level.id}>
                                            {level.name?.[i18n.language] || level.name || level.id}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="filter-dropdown"
                                    value={filterGrade}
                                    onChange={(e) => {
                                        setFilterGrade(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">{t('grade')}</option>
                                    <option value="1">{t('grade')} 1</option>
                                    <option value="2">{t('grade')} 2</option>
                                    <option value="3">{t('grade')} 3</option>

                                </select>
                                <select
                                    className="filter-dropdown"
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('allTypes')}</option>
                                    {operationOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label[i18n.language]}
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
                                    <option value="all">{t('assessmentStatus')}</option>
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
                            <th className="p-3">{t('grade')}</th>
                            <th className="p-3">{t('type')}</th>
                            <th className="p-3">{t('action', { ns: 'common' })}</th>
                            <th className="p-3">{t('available', { ns: 'common' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAssessments.map((assessment) => (
                            <tr key={assessment.id} className="border-t">
                                <td className="p-3">{assessment.question?.[i18n.language]}</td>
                                <td className="p-3">
                                    {assessment.option.map((item, index) => (
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
                                    {assessment.answer && assessment.answer.startsWith("http") ? (
                                        <img
                                            src={assessment.answer}
                                            alt="Answer"
                                            width="90"
                                            height="90"
                                            style={{ objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc' }}
                                        />
                                    ) : (
                                        <span>
                                            {assessment.answer}
                                        </span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {assessment.image && (
                                        <img
                                            src={assessment.image}
                                            alt={assessment.question?.[i18n.language]}
                                            width="200"
                                            height="100"
                                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    )}
                                </td>
                                <td className="p-3">{getLevelName(assessment.levelId)}</td>
                                <td className="p-3">{assessment.grade}</td>
                                <td className="p-3">{assessment.type?.[i18n.language]}</td>
                                <td className="p-3">
                                    <button
                                        className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', assessment)}
                                    >
                                        <img className="iconupdate" src={Imgs.edit} />
                                        {t('update', { ns: 'common' })}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={assessment.isDisabled}
                                            onChange={() => handleToggleAvailable(assessment)}
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
                            &gt;
                        </button>
                    </div>
                </div>
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
                            <label className="titleinput">{t('question')} (Vietnamese)</label>
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
                            <label className="titleinput">{t('question')} (English)</label>
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
                            <label className="titleinput">{t('level')}</label>
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
                                        {level.name || level.id}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.levelId && <div className="error-text">{errors.levelId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('grade')}</label>
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
                            <label className="titleinput">{t('type')}</label>
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
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label className="titleinput"> {t('textOption')}</label>
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
                                >
                                </Checkbox>
                                <label className="titleinput"> {t('imageOption')}</label>
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
                                >
                                </Checkbox>
                            </div>
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('option')}</label>
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
                                            <img
                                                src={editingAssessment.answer}
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
                            {/* <div className="image-upload-container"> */}
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
                            {/* </div> */}
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

export default Assessment;