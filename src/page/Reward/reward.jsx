import { useState, useEffect } from 'react';
import { Input, Button, Modal, Table, Pagination, Switch, Image, message, Select } from 'antd';
import { FaEdit } from 'react-icons/fa';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { Imgs } from "../../assets/theme/images";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './reward.css';
import Navbar from "../../component/Navbar";

const Rewards = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [rewards, setRewards] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [filterAlphabet, setFilterAlphabet] = useState('alphabet');
    const [filterStatus, setFilterStatus] = useState('all');
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const rewardsPerPage = 10;
    const { t, i18n } = useTranslation(['reward', 'common']);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const response = await api.get(`/reward`);
            const sortedRewards = response.data.sort((a, b) => {
                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);
                return dateB - dateA; // Latest first
            });
            setRewards(sortedRewards);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleSave = async () => {
        if (validate()) {
            try {
                const formData = new FormData();
                formData.append('name', JSON.stringify(editingReward.name));
                formData.append('description', JSON.stringify(editingReward.description));
                if (fileList[0]?.originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }
                if (editingReward.id) {
                    await api.put(`/reward/${editingReward.id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post(`/reward`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchRewards();
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

    const handleToggleAvailable = async (reward) => {
        try {
            await api.put(`/reward/${reward.id}`, { isDisabled: !reward.isDisabled });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            fetchRewards();
        } catch (error) {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!editingReward?.name?.vi || editingReward.name.vi.trim() === '') {
            newErrors.nameVi = t('nameViRequired');
        }
        if (!editingReward?.name?.en || editingReward.name.en.trim() === '') {
            newErrors.nameEn = t('nameEnRequired');
        }
        if (!editingReward?.description?.vi || editingReward.description.vi.trim() === '') {
            newErrors.descriptionVi = t('descriptionViRequired');
        }
        if (!editingReward?.description?.en || editingReward.description.en.trim() === '') {
            newErrors.descriptionEn = t('descriptionEnRequired');
        }
        if (!imageUrl && !editingReward?.image) {
            newErrors.image = t('imageRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openModal = (mode, reward = null) => {
        if (mode === 'add') {
            setEditingReward({ name: { en: '', vi: '' }, description: { en: '', vi: '' }, image: '' });
            setImageUrl('');
            setFileList([]);
        } else if (mode === 'update') {
            setEditingReward(reward);
            setImageUrl(reward.image);
            setFileList(reward.image ? [{ url: reward.image }] : []);
        }
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingReward(null);
        setImageUrl('');
        setFileList([]);
        setErrors({});
    };

    const handleImageChange = (info) => {
        const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
        if (fileObj) {
            const reader = new FileReader();
            reader.onload = e => {
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(fileObj);
            setFileList([info.fileList[info.fileList.length - 1]]);
            setEditingReward(prev => ({ ...prev, image: e.target.result }));
        } else {
            setFileList([]);
            setImageUrl('');
            setEditingReward(prev => ({ ...prev, image: '' }));
        }
    };

    const handleRemoveImage = () => {
        setFileList([]);
        setImageUrl('');
        setEditingReward(prev => ({ ...prev, image: '' }));
        message.info('Ảnh đã được xóa.');
    };

    const parseDate = (dateString) => {
        const [time, date] = dateString.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const filteredRewards = rewards.filter(reward => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'no'
                    ? reward.isDisabled === false
                    : reward.isDisabled === true;

        const searchText = searchQuery.toLowerCase();
        const rewardName = reward.name?.[i18n.language]?.toLowerCase() || '';
        return matchStatus && rewardName.includes(searchText);
    });

    if (filterAlphabet === 'A-Z') {
        filteredRewards.sort((a, b) =>
            (a.name[i18n.language] || '').localeCompare(b.name[i18n.language] || '')
        );
    } else if (filterAlphabet === 'Z-A') {
        filteredRewards.sort((a, b) =>
            (b.name[i18n.language] || '').localeCompare(a.name[i18n.language] || '')
        );
    }

    // Ant Design Table columns
    const columns = [
        {
            title: t('no', { ns: 'common' }),
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => (currentPage - 1) * rewardsPerPage + index + 1,
        },
        {
            title: t('name'),
            dataIndex: 'name',
            key: 'name',
            render: (name) => name?.[i18n.language] || '',
        },
        {
            title: t('description'),
            dataIndex: 'description',
            key: 'description',
            render: (description) => description?.[i18n.language] || '',
        },
        {
            title: t('image'),
            dataIndex: 'image',
            key: 'image',
            align: 'center',
            render: (image, record) => (
                <Image
                    src={image}
                    alt={record.name?.[i18n.language]}
                    width={150}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
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
            <div className="title-search">
                <h1 className="container-title">{t('managementReward')}</h1>
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
                                    value={filterAlphabet}
                                    onChange={(value) => {
                                        setFilterAlphabet(value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <Select.Option value="alphabet">{t('alphabet')}</Select.Option>
                                    <Select.Option value="A-Z">A-Z</Select.Option>
                                    <Select.Option value="Z-A">Z-A</Select.Option>
                                </Select>
                                <Select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(value) => {
                                        setFilterStatus(value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <Select.Option value="all">{t('rewardStatus')}</Select.Option>
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
                <div className="table-container-reward">
                    <Table
                        columns={columns}
                        dataSource={filteredRewards.slice((currentPage - 1) * rewardsPerPage, currentPage * rewardsPerPage)}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                    <div className="paginations">
                        <Pagination
                            current={currentPage}
                            total={filteredRewards.length}
                            pageSize={rewardsPerPage}
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
                                            disabled={currentPage === Math.ceil(filteredRewards.length / rewardsPerPage)}
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
                </div>
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingReward?.id ? t('updateReward') : t('addReward')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-lesson">
                        <div className="inputtext">
                            <label className="titleinput">{t('name')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputNameVi')}
                                value={editingReward?.name?.vi || ''}
                                onChange={(e) =>
                                    setEditingReward({
                                        ...editingReward,
                                        name: { ...editingReward.name, vi: e.target.value },
                                    })
                                }
                            />
                            {errors.nameVi && <div className="error-text">{errors.nameVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('name')} (English) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputNameEn')}
                                value={editingReward?.name?.en || ''}
                                onChange={(e) =>
                                    setEditingReward({
                                        ...editingReward,
                                        name: { ...editingReward.name, en: e.target.value },
                                    })
                                }
                            />
                            {errors.nameEn && <div className="error-text">{errors.nameEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('image')} <span style={{ color: 'red' }}>*</span></label>
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
                                <div className="image-preview-box-option">
                                    <Image src={imageUrl} alt="Preview" className="preview-image-option" />
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
                            {errors.image && <div className="error-text">{errors.image}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
                            <Input.TextArea
                                placeholder={t('inputDescriptonVi')}
                                value={editingReward?.description?.vi || ''}
                                onChange={(e) =>
                                    setEditingReward({
                                        ...editingReward,
                                        description: { ...editingReward.description, vi: e.target.value },
                                    })
                                }
                                rows={4}
                            />
                            {errors.descriptionVi && <div className="error-text">{errors.descriptionVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (English) <span style={{ color: 'red' }}>*</span></label>
                            <Input.TextArea
                                placeholder={t('inputDescriptonEn')}
                                value={editingReward?.description?.en || ''}
                                onChange={(e) =>
                                    setEditingReward({
                                        ...editingReward,
                                        description: { ...editingReward.description, en: e.target.value },
                                    })
                                }
                                rows={4}
                            />
                            {errors.descriptionEn && <div className="error-text">{errors.descriptionEn}</div>}
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

export default Rewards;