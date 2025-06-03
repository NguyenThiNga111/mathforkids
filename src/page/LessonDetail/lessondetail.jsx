import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Modal, Select, Image, Breadcrumb, Table, Switch } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { FaEdit } from 'react-icons/fa';
import { Upload } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './lessonDetail.css';
import Navbar from '../../component/Navbar';

const LessonDetail = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLessonDetail, setEditingLessonDetail] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [lessonDetails, setLessonDetails] = useState([]);
    const [lesson, setLesson] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [errors, setErrors] = useState({});
    const [creationMode, setCreationMode] = useState('single'); // 'single' or 'full'
    const [searchQuery, setSearchQuery] = useState('');

    const { t, i18n } = useTranslation(['lessondetail', 'common']);
    const navigate = useNavigate();
    const { lessonId } = useParams();

    useEffect(() => {
        fetchLessonDetails();
        fetchLesson();
    }, [lessonId]);

    const fetchLessonDetails = async () => {
        try {
            const response = await api.get(`/lessondetail/lesson/${lessonId}`);
            const sortedLessonDetails = response.data.sort((a, b) => {
                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);
                return dateB - dateA; // Latest first
            });
            setLessonDetails(sortedLessonDetails);
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

    const Validation = (data) => {
        const newErrors = {};
        if (!data?.order || isNaN(data.order) || data.order < 1) {
            newErrors.order = t('orderRequired');
        }
        if (!data?.title?.vi || data.title.vi.trim() === '') {
            newErrors.title = t('titleRequired');
        }
        if (!data?.content?.vi || data.content.vi.trim() === '') {
            newErrors.contentVi = t('contentViRequired');
        }
        if (!data?.content?.en || data.content.en.trim() === '') {
            newErrors.contentEn = t('contentEnRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const ValidationFullLesson = (data) => {
        const newErrors = {};
        if (!data?.contents?.define?.vi || data.contents.define.vi.trim() === '') {
            newErrors.defineVi = t('contentViRequired');
        }
        if (!data?.contents?.define?.en || data.contents.define.en.trim() === '') {
            newErrors.defineEn = t('contentEnRequired');
        }
        if (!data?.contents?.example?.vi || data.contents.example.vi.trim() === '') {
            newErrors.exampleVi = t('contentViRequired');
        }
        if (!data?.contents?.example?.en || data.contents.example.en.trim() === '') {
            newErrors.exampleEn = t('contentEnRequired');
        }
        if (!data?.contents?.remember?.vi || data.contents.remember.vi.trim() === '') {
            newErrors.rememberVi = t('contentViRequired');
        }
        if (!data?.contents?.remember?.en || data.contents.remember.en.trim() === '') {
            newErrors.rememberEn = t('contentEnRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (creationMode === 'single') {
            if (Validation(editingLessonDetail)) {
                try {
                    const formData = new FormData();
                    formData.append('lessonId', editingLessonDetail.lessonId);
                    formData.append('order', editingLessonDetail.order);
                    formData.append('title', JSON.stringify(editingLessonDetail.title));
                    formData.append('content', JSON.stringify(editingLessonDetail.content));
                    if (fileList[0]?.originFileObj) {
                        formData.append('image', fileList[0].originFileObj);
                    }

                    if (editingLessonDetail.id) {
                        await api.put(`/lessondetail/${editingLessonDetail.id}`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        toast.success(t('updateSuccess', { ns: 'common' }));
                    } else {
                        await api.post(`/lessondetail`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        toast.success(t('addSuccess', { ns: 'common' }));
                    }
                    fetchLessonDetails();
                    closeModal();
                } catch (error) {
                    toast.error(t('errorSavingData', { ns: 'common' }));
                }
            } else {
                toast.error(t('validationFailed', { ns: 'common' }));
            }
        } else if (creationMode === 'full') {
            if (ValidationFullLesson(editingLessonDetail)) {
                try {
                    const formData = new FormData();
                    formData.append('lessonId', editingLessonDetail.lessonId);
                    formData.append('contents', JSON.stringify(editingLessonDetail.contents));
                    if (fileList.define?.[0]?.originFileObj) {
                        formData.append('define', fileList.define[0].originFileObj);
                    }
                    if (fileList.example?.[0]?.originFileObj) {
                        formData.append('example', fileList.example[0].originFileObj);
                    }
                    if (fileList.remember?.[0]?.originFileObj) {
                        formData.append('remember', fileList.remember[0].originFileObj);
                    }
                    for (let [key, value] of formData.entries()) {
                        console.log(`FormData ${key}:`, value);
                    }
                    await api.post(`/lessondetail/full`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.success(t('addFullLessonSuccess', { ns: 'common' }));
                    fetchLessonDetails();
                    closeModal();
                } catch (error) {
                    toast.error(t('errorSavingData', { ns: 'common' }));
                }
            } else {
                toast.error(t('validationFailed', { ns: 'common' }));
            }
        }
    };

    const openModal = (mode, lessonDetail = null) => {
        if (mode === 'add') {
            setCreationMode('single');
            const maxOrder = lessonDetails.length > 0
                ? Math.max(...lessonDetails.map(ld => ld.order))
                : 0;
            setEditingLessonDetail({
                lessonId: lessonId || '',
                order: maxOrder + 1,
                title: { en: '', vi: '' },
                content: { en: '', vi: '' },
                image: null,
            });
            setImageUrl('');
            setFileList([]);
        } else if (mode === 'addFull') {
            setCreationMode('full');
            setEditingLessonDetail({
                lessonId: lessonId || '',
                contents: {
                    define: { vi: '', en: '' },
                    example: { vi: '', en: '' },
                    remember: { vi: '', en: '' },
                },
                images: { define: null, example: null, remember: null },
            });
            setImageUrl('');
            setFileList({ define: [], example: [], remember: [] });
        } else if (mode === 'update') {
            setCreationMode('single');
            setEditingLessonDetail(lessonDetail);
            setImageUrl(lessonDetail.image || '');
            setFileList(lessonDetail.image ? [{ uid: '-1', name: 'image', status: 'done', url: lessonDetail.image }] : []);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLessonDetail(null);
        setImageUrl('');
        setFileList([]);
        setErrors({});
        setCreationMode('single');
    };

    const handleTitleChange = (value) => {
        setEditingLessonDetail({
            ...editingLessonDetail,
            title: { en: value, vi: value },
        });
    };

    const handleImageChange = (info, section = null) => {
        const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
        if (fileObj) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (creationMode === 'single') {
                    setImageUrl(e.target.result);
                    setFileList([{ ...info.fileList[info.fileList.length - 1], url: e.target.result }]);
                } else if (creationMode === 'full') {
                    setFileList((prev) => ({
                        ...prev,
                        [section]: [{ ...info.fileList[info.fileList.length - 1], url: e.target.result }],
                    }));
                }
            };
            reader.readAsDataURL(fileObj);
        }
    };

    const handleToggleAvailable = async (lessonDetail) => {
        try {
            await api.put(`/lessondetail/${lessonDetail.id}`, {
                isDisabled: !lessonDetail.isDisabled,
            });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            setLessonDetails((prev) =>
                prev.map((e) =>
                    e.id === lessonDetail.id ? { ...e, isDisabled: !lessonDetail.isDisabled } : e
                )
            );
        } catch (error) {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleRemoveImage = () => {
        setFileList([]);
        setImageUrl(null);
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl); // Free memory
        }
    };

    const parseDate = (dateString) => {
        const [time, date] = dateString.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const filteredLessonDetails = lessonDetails.filter((lessonDetail) => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'no'
                    ? lessonDetail.isDisabled === false
                    : lessonDetail.isDisabled === true;
        const searchText = searchQuery.toLowerCase();
        const lessonDetailName = lessonDetail.title?.[i18n.language]?.toLowerCase() || '';
        return matchStatus && lessonDetailName.includes(searchText);
    });

    const breadcrumbItems = [
        {
            title: t('lesson'),
            onClick: () => navigate('/lesson'),
        },
        {
            title: lesson?.name?.[i18n.language] || lessonId,
        },
    ];

    // Ant Design Table columns
    const columns = [
        {
            title: t('order'),
            dataIndex: 'order',
            key: 'order',
            width: 100,
        },
        {
            title: t('title'),
            dataIndex: 'title',
            key: 'title',
            render: (title) => title?.[i18n.language] || '',
        },
        {
            title: t('content'),
            dataIndex: 'content',
            key: 'content',
            render: (content) => content?.[i18n.language] || '',
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
                        alt={record.title?.[i18n.language]}
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover', borderRadius: '8px', border: '2px solid #ccc' }}
                    />
                ) : (
                    <span>{t('image')}</span>
                )
            ),
        },
        {
            title: t('action', { ns: 'common' }),
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <button
                    className="text-white px-3 py-1 buttonupdate"
                    onClick={() => openModal('update', record)}
                >
                    <FaEdit className="iconupdate" />
                    {t('update', { ns: 'common' })}
                </button>
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
            <Breadcrumb items={breadcrumbItems} style={{ marginTop: 10, marginBottom: -20 }} />
            <div className="title-search">
                <h1 className="container-title">
                    {t('managementLessonDetail')} - {lesson?.name?.[i18n.language] || lessonId}
                </h1>
                <div className="search">
                    <Input
                        type="text"
                        className="inputsearch"
                        placeholder={t('searchPlaceholder', { ns: 'common' })}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            onChange={(value) => setFilterStatus(value)}
                            placeholder={t('status')}
                        >
                            <Select.Option value="all">{t('status')}</Select.Option>
                            <Select.Option value="no">{t('no', { ns: 'common' })}</Select.Option>
                            <Select.Option value="yes">{t('yes', { ns: 'common' })}</Select.Option>
                        </Select>
                    </div>
                    <div>
                        <Button
                            className="rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + {t('addNew', { ns: 'common' })}
                        </Button>
                        <Button
                            className="rounded-add button-margin-left"
                            onClick={() => openModal('addFull')}
                        >
                            + {t('addFullLesson')}
                        </Button>
                    </div>
                </div>
                <div className="table-container-lessondetail">
                    <Table
                        columns={columns}
                        dataSource={filteredLessonDetails}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                </div>
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingLessonDetail?.id
                                ? t('updateLessonDetail')
                                : creationMode === 'single'
                                    ? t('addLessonDetail')
                                    : t('addFullLesson')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    {creationMode === 'single' ? (
                        <div className="form-content-lesson">
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('order')} <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder={t('inputOrder')}
                                    value={editingLessonDetail?.order || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            order: parseInt(e.target.value) || 1,
                                        })
                                    }
                                />
                                {errors.order && <div className="error-text">{errors.order}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('title')} <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Select
                                    placeholder={t('selectTitle')}
                                    value={editingLessonDetail?.title?.en || null}
                                    onChange={handleTitleChange}
                                    style={{ width: '100%', height: '50px' }}
                                >
                                    <Select.Option value="Define">{t('defineSection')}</Select.Option>
                                    <Select.Option value="Example">{t('exampleSection')}</Select.Option>
                                    <Select.Option value="Remember">{t('rememberSection')}</Select.Option>
                                </Select>
                                {errors.title && <div className="error-text">{errors.title}</div>}
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
                                <label className="titleinput">
                                    {t('content')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentVi')}
                                    value={editingLessonDetail?.content?.vi || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            content: { ...editingLessonDetail.content, vi: e.target.value },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.contentVi && <div className="error-text">{errors.contentVi}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('content')} (English) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentEn')}
                                    value={editingLessonDetail?.content?.en || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            content: { ...editingLessonDetail.content, en: e.target.value },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.contentEn && <div className="error-text">{errors.contentEn}</div>}
                            </div>
                        </div>
                    ) : (
                        <div className="form-content-lesson">
                            {/* Define Section */}
                            <h4 style={{ marginTop: '15px', textAlign: 'center' }}>{t('defineSection')}</h4>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('content')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentVi')}
                                    value={editingLessonDetail?.contents?.define?.vi || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            contents: {
                                                ...editingLessonDetail.contents,
                                                define: { ...editingLessonDetail.contents.define, vi: e.target.value },
                                            },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.defineVi && <div className="error-text">{errors.defineVi}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('content')} (English) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentEn')}
                                    value={editingLessonDetail?.contents?.define?.en || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            contents: {
                                                ...editingLessonDetail.contents,
                                                define: { ...editingLessonDetail.contents.define, en: e.target.value },
                                            },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.defineEn && <div className="error-text">{errors.defineEn}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">{t('image')}</label>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={(info) => handleImageChange(info, 'define')}
                                    fileList={fileList.define}
                                >
                                    <Button icon={<UploadOutlined />} className="custom-upload-button">
                                        {t('inputImage')}
                                    </Button>
                                </Upload>
                                {fileList.define?.[0]?.url && (
                                    <div className="image-preview-box">
                                        <Image src={fileList.define[0].url} alt="Define Preview" className="preview-image" />
                                    </div>
                                )}
                            </div>
                            {/* Example Section */}
                            <h4 style={{ marginTop: '15px', textAlign: 'center' }}>{t('exampleSection')}</h4>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('content')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentVi')}
                                    value={editingLessonDetail?.contents?.example?.vi || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            contents: {
                                                ...editingLessonDetail.contents,
                                                example: { ...editingLessonDetail.contents.example, vi: e.target.value },
                                            },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.exampleVi && <div className="error-text">{errors.exampleVi}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('content')} (English) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentEn')}
                                    value={editingLessonDetail?.contents?.example?.en || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            contents: {
                                                ...editingLessonDetail.contents,
                                                example: { ...editingLessonDetail.contents.example, en: e.target.value },
                                            },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.exampleEn && <div className="error-text">{errors.exampleEn}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">{t('image')}</label>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={(info) => handleImageChange(info, 'example')}
                                    fileList={fileList.example}
                                >
                                    <Button icon={<UploadOutlined />} className="custom-upload-button">
                                        {t('inputImage')}
                                    </Button>
                                </Upload>
                                {fileList.example?.[0]?.url && (
                                    <div className="image-preview-box">
                                        <Image src={fileList.example[0].url} alt="Example Preview" className="preview-image" />
                                    </div>
                                )}
                            </div>
                            {/* Remember Section */}
                            <h4 style={{ marginTop: '15px', textAlign: 'center' }}>{t('rememberSection')}</h4>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('content')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentVi')}
                                    value={editingLessonDetail?.contents?.remember?.vi || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            contents: {
                                                ...editingLessonDetail.contents,
                                                remember: { ...editingLessonDetail.contents.remember, vi: e.target.value },
                                            },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.rememberVi && <div className="error-text">{errors.rememberVi}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">
                                    {t('content')} (English) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input.TextArea
                                    placeholder={t('inputContentEn')}
                                    value={editingLessonDetail?.contents?.remember?.en || ''}
                                    onChange={(e) =>
                                        setEditingLessonDetail({
                                            ...editingLessonDetail,
                                            contents: {
                                                ...editingLessonDetail.contents,
                                                remember: { ...editingLessonDetail.contents.remember, en: e.target.value },
                                            },
                                        })
                                    }
                                    rows={4}
                                />
                                {errors.rememberEn && <div className="error-text">{errors.rememberEn}</div>}
                            </div>
                            <div className="inputtext">
                                <label className="titleinput">{t('image')}</label>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={(info) => handleImageChange(info, 'remember')}
                                    fileList={fileList.remember}
                                >
                                    <Button icon={<UploadOutlined />} className="custom-upload-button">
                                        {t('inputImage')}
                                    </Button>
                                </Upload>
                                {fileList.remember?.[0]?.url && (
                                    <div className="image-preview-box">
                                        <Image src={fileList.remember[0].url} alt="Remember Preview" className="preview-image" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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

export default LessonDetail;