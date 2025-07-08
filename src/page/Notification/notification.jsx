import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Modal, Table } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './notification.css';

const Notification = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [notificationsData, setNotificationsData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [countAll, setCountAll] = useState('');
    const [visibleNotification, setVisibleNotification] = useState([]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const notificationsPerPage = 20;
    const [errors, setErrors] = useState({});
    const { t, i18n } = useTranslation(['notification', 'common']);

    useEffect(() => {
        const fetchNotifications = async () => {
            setVisibleNotification([]);
            setNotificationsData([]);
            setNextPageToken(null);
            await fetchAllNotifications(null);
        };
        fetchNotifications();
    }, []);

    const fetchAllNotifications = async (token = null) => {
        try {
            let url = `/generalnotification/getAll?pageSize=${notificationsPerPage}`;
            if (token) {
                url += `&startAfterId=${token}`;
            }
            const response = await api.get(url);
            const newNotifications = response.data.data || [];
            const responses = await api.get(`/generalnotification/countAll`);
            setCountAll(Number(responses.data.count));
            setNotificationsData((prev) => {
                const existingIds = new Set(prev.map((n) => n.id));
                const uniqueNewNotifications = newNotifications.filter((n) => !existingIds.has(n.id));
                return [...prev, ...uniqueNewNotifications];
            });
            setVisibleNotification((prev) => {
                const existingIds = new Set(prev.map((n) => n.id));
                const uniqueNewNotifications = newNotifications.filter((n) => !existingIds.has(n.id));
                return [...prev, ...uniqueNewNotifications];
            });
            setNextPageToken(response.data.nextPageToken || null);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const loadMore = async () => {
        if (!nextPageToken) return;
        try {
            await fetchAllNotifications(nextPageToken);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                const payload = {
                    title: {
                        vi: editingNotification.title.vi || '',
                        en: editingNotification.title.en || '',
                    },
                    content: {
                        vi: editingNotification.content.vi || '',
                        en: editingNotification.content.en || '',
                    },
                    isRead: editingNotification.isRead || false,
                };
                if (editingNotification?.id) {
                    await api.put(`/generalnotification/${editingNotification.id}`, payload);
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post(`/generalnotification`, payload);
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                setVisibleNotification([]);
                setNotificationsData([]);
                setNextPageToken(null);
                await fetchAllNotifications(null);
                closeModal();
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language], {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } else {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!editingNotification?.title?.vi || editingNotification.title.vi.trim() === '') {
            newErrors.titleVi = t('titleViRequired');
        }
        if (!editingNotification?.title?.en || editingNotification.title.en.trim() === '') {
            newErrors.titleEn = t('titleEnRequired');
        }
        if (!editingNotification?.content?.vi || editingNotification.content.vi.trim() === '') {
            newErrors.contentVi = t('contentViRequired');
        }
        if (!editingNotification?.content?.en || editingNotification.content.en.trim() === '') {
            newErrors.contentEn = t('contentEnRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openModal = (mode, notification = null) => {
        if (mode === 'add') {
            setEditingNotification({
                title: { vi: '', en: '' },
                content: { vi: '', en: '' },
                isRead: false,
            });
        } else if (mode === 'update') {
            setEditingNotification({
                ...notification,
                title: {
                    vi: notification.title?.vi || '',
                    en: notification.title?.en || '',
                },
                content: {
                    vi: notification.content?.vi || '',
                    en: notification.content?.en || '',
                },
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const columns = [
        {
            title: t('.no', { ns: 'common' }),
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => index + 1,
        },
        {
            title: t('title'),
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => record.title?.[i18n.language] || '',
        },
        {
            title: t('content'),
            dataIndex: 'content',
            key: 'content',
            render: (text, record) => record.content?.[i18n.language] || '',
        },
        {
            title: t('createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
    ];

    return (
        <div className="containers">
            <Navbar />
            <div className="title-search">
                <h1 className="container-title">{t('managementNotifications')}</h1>
                <div className="search">
                    <Input
                        type="text"
                        className="inputsearch"
                        placeholder={t('searchPlaceholder', { ns: 'common' })}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
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
                    </div>
                    <Button className="rounded-add" onClick={() => openModal('add')}>
                        + {t('addNew', { ns: 'common' })}
                    </Button>
                </div>
                <div className="table-container-notification">
                    <Table
                        columns={columns}
                        dataSource={visibleNotification}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                    <div className="paginations">
                        {nextPageToken && visibleNotification.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div>
                </div>
                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingNotification?.id ? t('updateNotification') : t('addNotification')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-notification">
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('title')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputTitleVi')}
                                value={editingNotification?.title?.vi || ''}
                                onChange={(e) =>
                                    setEditingNotification({
                                        ...editingNotification,
                                        title: { ...editingNotification.title, vi: e.target.value },
                                    })
                                }
                            />
                            {errors.titleVi && <div className="error-text">{errors.titleVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('title')} (English) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputTitleEn')}
                                value={editingNotification?.title?.en || ''}
                                onChange={(e) =>
                                    setEditingNotification({
                                        ...editingNotification,
                                        title: { ...editingNotification.title, en: e.target.value },
                                    })
                                }
                            />
                            {errors.titleEn && <div className="error-text">{errors.titleEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('content')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input.TextArea
                                placeholder={t('inputContentVi')}
                                value={editingNotification?.content?.vi || ''}
                                onChange={(e) =>
                                    setEditingNotification({
                                        ...editingNotification,
                                        content: { ...editingNotification.content, vi: e.target.value },
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
                                value={editingNotification?.content?.en || ''}
                                onChange={(e) =>
                                    setEditingNotification({
                                        ...editingNotification,
                                        content: { ...editingNotification.content, en: e.target.value },
                                    })
                                }
                                rows={4}
                            />
                            {errors.contentEn && <div className="error-text">{errors.contentEn}</div>}
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

export default Notification;