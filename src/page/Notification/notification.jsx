import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal, Table, Pagination } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Imgs } from '../../assets/theme/images';
import api from '../../assets/api/Api';
import './notification.css';

const { Option } = Select;

const Notification = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [notificationsData, setNotificationsData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all / read / unread
    const { t, i18n } = useTranslation(['notification', 'common']);
    const [searchQuery, setSearchQuery] = useState('');
    const notificationsPerPage = 16;
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchNotifications();
        fetchUsers();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`/generalnotification`);
            const sortedNotifications = response.data.sort((a, b) => {
                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);
                return dateB - dateA; // Latest first
            });
            setNotificationsData(sortedNotifications);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get(`/user`);
            setUsersData(response.data);
        } catch (error) {
            toast.error(t('errorFetchUsers', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                const payload = {
                    senderId: editingNotification.senderId,
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
                fetchNotifications();
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
        if (!editingNotification?.senderId) {
            newErrors.senderId = t('senderRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openModal = (mode, notification = null) => {
        if (mode === 'add') {
            setEditingNotification({
                title: { vi: '', en: '' },
                content: { vi: '', en: '' },
                senderId: null,
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
        setSearchUser('');
    };

    const parseDate = (dateString) => {
        const [time, date] = dateString.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const filteredNotifications = notificationsData.filter(notification => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'read'
                    ? notification.isRead === true
                    : notification.isRead === false;
        const searchText = searchQuery.toLowerCase();
        const notificationName = notification.title?.[i18n.language]?.toLowerCase() || '';
        return matchStatus && notificationName.includes(searchText);
    });
    const filteredUsers = usersData.filter(user =>
        user.fullName.toLowerCase().includes(searchUser.toLowerCase())
    );
    // Ant Design Table columns
    const columns = [
        {
            title: t('.no', { ns: 'common' }),
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => (currentPage - 1) * notificationsPerPage + index + 1,
        },
        {
            title: t('title'),
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => record.title?.[i18n.language] || '',
        },
        {
            title: t('sender'),
            dataIndex: 'senderId',
            key: 'senderId',
            render: (text, record) => usersData.find(user => user.id === record.senderId)?.fullName || 'Unknown',
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
        {
            title: t('status'),
            dataIndex: 'isRead',
            key: 'isRead',
            render: (isRead) => (isRead ? t('read') : t('unread')),
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
                            value={filterStatus}
                            onChange={(value) => {
                                setFilterStatus(value);
                                setCurrentPage(1);
                            }}
                            placeholder={t('status')}
                        >
                            <Select.Option value="all">{t('status')}</Select.Option>
                            <Select.Option value="read">{t('read')}</Select.Option>
                            <Select.Option value="unread">{t('unread')}</Select.Option>
                        </Select>
                    </div>
                    <Button className="rounded-add" onClick={() => openModal('add')}>
                        + {t('addNew', { ns: 'common' })}
                    </Button>
                </div>
                <div className="table-container-notification">
                    <Table
                        columns={columns}
                        dataSource={filteredNotifications.slice(
                            (currentPage - 1) * notificationsPerPage,
                            currentPage * notificationsPerPage
                        )}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                </div>

                <div className="paginations">
                    <Pagination
                        current={currentPage}
                        total={filteredNotifications.length}
                        pageSize={notificationsPerPage}
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
                                            currentPage ===
                                            Math.ceil(filteredNotifications.length / notificationsPerPage)
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
                                {t('sender')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Select
                                showSearch
                                placeholder={t('selectSender')}
                                value={editingNotification?.senderId || undefined}
                                onChange={(value) =>
                                    setEditingNotification({ ...editingNotification, senderId: value })
                                }
                                onSearch={(value) => setSearchUser(value)}
                                filterOption={false}
                                style={{ width: '100%', height: '50px' }}
                            >
                                {filteredUsers.map((user) => (
                                    <Select.Option key={user.id} value={user.id}>
                                        {user.fullName}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.senderId && <div className="error-text">{errors.senderId}</div>}
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