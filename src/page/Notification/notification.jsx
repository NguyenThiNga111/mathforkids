import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Imgs } from '../../assets/theme/images';
import api from '../../assets/api/Api';
import './notification.css';

const Notification = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [notificationsData, setNotificationsData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all / read / unread
    const { t, i18n } = useTranslation(['notification', 'common']);
    const { Option } = Select;
    const notificationsPerPage = 16;
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchNotifications();
        fetchUsers();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`/generalnotification`);
            setNotificationsData(response.data);
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

    const filteredNotifications = notificationsData.filter(notification => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'read'
                    ? notification.isRead === true
                    : notification.isRead === false;
        return matchStatus;
    });

    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
    const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const filteredUsers = usersData.filter(user =>
        user.fullName.toLowerCase().includes(searchUser.toLowerCase())
    );

    return (
        <div className="containers">
            <Navbar />
            <h1 className="container-title">{t('managementNotifications')}</h1>
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
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('status')}</option>
                                    <option value="read">{t('read')}</option>
                                    <option value="unread">{t('unread')}</option>
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
                <div className="table-container-notification">
                    <table className="w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="p-3">{t('.no', { ns: 'common' })}</th> {/* New No column */}
                                <th className="p-3">{t('title')}</th>
                                <th className="p-3">{t('sender')}</th>
                                <th className="p-3">{t('content')}</th>
                                <th className="p-3">{t('createdAt')}</th>
                                <th className="p-3">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentNotifications.map((notification, index) => (
                                <tr key={notification.id} className="border-t">
                                    <td className="p-3">{indexOfFirstNotification + index + 1}</td> {/* Sequential number */}

                                    <td className="p-3">{notification.title?.[i18n.language]}</td>
                                    <td className="p-3">
                                        {usersData.find(user => user.id === notification.senderId)?.fullName || 'Unknown'}
                                    </td>
                                    <td className="p-3">{notification.content?.[i18n.language]}</td>
                                    <td className="p-3">{notification.createdAt}</td>
                                    <td className="p-3">
                                        {notification.isRead ? t('read') : t('unread')}
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
                            <label className="titleinput">{t('title')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
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
                            <label className="titleinput">{t('title')} (English) <span style={{ color: 'red' }}>*</span></label>
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
                            <label className="titleinput">{t('sender')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                showSearch
                                placeholder={t('selectSender')}
                                value={editingNotification?.senderId || undefined}
                                onChange={(value) => setEditingNotification({ ...editingNotification, senderId: value })}
                                onSearch={(value) => setSearchUser(value)}
                                filterOption={false}
                                style={{ width: '100%', height: '50px' }}
                            >
                                {filteredUsers.map(user => (
                                    <Option key={user.id} value={user.id}>
                                        {user.fullName}
                                    </Option>
                                ))}
                            </Select>
                            {errors.senderId && <div className="error-text">{errors.senderId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('content')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
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
                            <label className="titleinput">{t('content')} (English) <span style={{ color: 'red' }}>*</span></label>
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