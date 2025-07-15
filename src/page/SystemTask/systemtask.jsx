import { useEffect, useState } from 'react';
import { Input, Button, Select, Modal, Table, Pagination, Switch } from 'antd';
import { toast } from 'react-toastify';
import { Imgs } from '../../assets/theme/images';
import { useTranslation } from 'react-i18next';
import { FaEdit } from 'react-icons/fa';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './systemtask.css';

const SystemTask = () => {

    const [tasks, setTasks] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [countAll, setCountAll] = useState('');
    const [visibleDailyTask, setVisibleDailyTask] = useState([]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [errors, setErrors] = useState({});
    const tasksPerPage = 20;
    const { Option } = Select;
    const { t, i18n } = useTranslation(['systemtask', 'common']);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setVisibleDailyTask(tasks); // Reset to all when search is empty
        } else {
            const filtered = tasks.filter(
                (dailytask) =>
                    dailytask.title?.[i18n.language]?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setVisibleDailyTask(filtered);
        }
    }, [searchQuery, tasks, i18n.language]);
    useEffect(() => {
        const fetchTasks = async () => {
            setVisibleDailyTask([]);
            setTasks([]);
            setNextPageToken(null);
            if (filterStatus !== 'all') {
                await fetchTasksByDisabled(null, filterStatus);
            } else {
                await fetchAllTasks(null);
            }
            fetchRewards();
        };
        fetchTasks();
    }, [filterStatus]);

    const fetchAllTasks = async (token = null) => {
        try {
            let url = `/dailytask?pageSize=${tasksPerPage}`;
            if (token) {
                url += `&startAfterId=${token}`; // Use startAfterId as per your backend
            }
            const response = await api.get(url);
            const newDailytask = response.data.data || [];
            const responses = await api.get(`/dailytask/countAll`);
            setCountAll(Number(responses.data.count));
            setTasks((prev) => {
                const existingIds = new Set(prev.map((dailytask) => dailytask.id));
                const uniqueNewExercises = newDailytask.filter((dailytask) => !existingIds.has(dailytask.id));
                return [...prev, ...uniqueNewExercises];
            });
            setVisibleDailyTask((prev) => {
                const existingIds = new Set(prev.map((dailytask) => dailytask.id));
                const uniqueNewExercises = newDailytask.filter((dailytask) => !existingIds.has(dailytask.id));
                return [...prev, ...uniqueNewExercises];
            });
            setNextPageToken(response.data.nextPageToken || null);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };
    const fetchTasksByDisabled = async (token = null, isDisabled) => {
        try {
            let url = `/dailytask/filterByDisabledStatus?pageSize=${tasksPerPage}&isDisabled=${isDisabled}`;
            if (token) {
                url += `&startAfterId=${token}`; // Use startAfterId as per your backend
            }
            const response = await api.get(url);
            const newDailytask = response.data.data || [];
            const responses = await api.get(`/dailytask/countByDisabledStatus?isDisabled=${isDisabled}`);
            setCountAll(Number(responses.data.count));
            setTasks((prev) => {
                const existingIds = new Set(prev.map((dailytask) => dailytask.id));
                const uniqueNewExercises = newDailytask.filter((dailytask) => !existingIds.has(dailytask.id));
                return [...prev, ...uniqueNewExercises];
            });
            setVisibleDailyTask((prev) => {
                const existingIds = new Set(prev.map((dailytask) => dailytask.id));
                const uniqueNewExercises = newDailytask.filter((dailytask) => !existingIds.has(dailytask.id));
                return [...prev, ...uniqueNewExercises];
            });
            setNextPageToken(response.data.nextPageToken || null);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };
    const fetchRewards = async () => {
        const res = await api.get('/reward/getEnabledRewards');
        setRewards(res.data);
    };
    const loadMore = async () => {
        if (!nextPageToken) return;
        try {
            if (filterStatus !== 'all') {
                await fetchTasksByDisabled(nextPageToken, filterStatus);
            } else {
                await fetchAllTasks(nextPageToken);
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            return;
        }
        try {
            const { id, ...payload } = editingTask;
            if (id) {
                await api.patch(`/dailytask/${id}`, payload);
                toast.success(t('updateSuccess', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } else {
                await api.post('/dailytask', payload);
                toast.success(t('addSuccess', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
            setVisibleDailyTask([]);
            setTasks([]);
            setNextPageToken(null);
            if (filterStatus !== 'all') {
                await fetchTasksByDisabled(null, filterStatus);
            } else {
                await fetchAllTasks(null);
            }
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleToggleDisabled = async (task) => {
        try {
            await api.patch(`/dailytask/${task.id}`, { isDisabled: !task.isDisabled });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            setTasks((prev) =>
                prev.map((e) =>
                    e.id === task.id ? { ...e, isDisabled: !task.isDisabled } : e
                )
            );
        } catch {
            toast.error(t('errorSavingData', { ns: 'common' }));
        }
    };

    const validateForm = () => {
        const err = {};
        if (!editingTask.title?.vi) err.titleVi = t('titleViRequired');
        if (!editingTask.title?.en) err.titleEn = t('titleEnRequired');
        if (!editingTask.description?.vi) err.descriptionVi = t('descriptionViRequired');
        if (!editingTask.description?.en) err.descriptionEn = t('descriptionEnRequired');
        if (!editingTask.rewardId) err.rewardId = t('rewardRequired');
        if (!editingTask.quantityReward || editingTask.quantityReward < 1) err.quantityReward = t('quantityRequired');
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const openModal = (mode, task = null) => {
        setEditingTask(task || {
            title: { vi: '', en: '' },
            description: { vi: '', en: '' },
            rewardId: '',
            quantityReward: 1,
            isDisabled: false,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setErrors({});
    };


    // Ant Design Table columns
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
            render: (title) => title?.[i18n.language] || '',
        },
        {
            title: t('reward'),
            dataIndex: 'rewardId',
            key: 'reward',
            render: (rewardId) => rewards.find(r => r.id === rewardId)?.name?.[i18n.language] || '',
        },
        {
            title: t('quantity'),
            dataIndex: 'quantityReward',
            key: 'quantity',
            align: 'center',
        },
        {
            title: t('description'),
            dataIndex: 'description',
            key: 'description',
            render: (description) => description?.[i18n.language] || '',
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
                    checked={!isDisabled}
                    onChange={() => handleToggleDisabled(record)}
                    className="custom-switch"
                />
            ),
        },
    ];

    return (
        <div className="containers">
            {/* <Navbar /> */}
            <div className="title-search">
                <h1 className="container-title">{t('taskManagement')}</h1>
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
                            onChange={(value) => { setFilterStatus(value); }}
                        >
                            <Select.Option value="all">{t('status', { ns: 'common' })}</Select.Option>
                            <Select.Option value="false">{t('no', { ns: 'common' })}</Select.Option>
                            <Select.Option value="true">{t('yes', { ns: 'common' })}</Select.Option>
                        </Select>
                    </div>
                    <Button className="rounded-add" onClick={() => openModal('add')}>
                        + {t('addNew', { ns: 'common' })}
                    </Button>
                </div>
                <div className="table-container-systemtask">
                    <Table
                        columns={columns}
                        dataSource={visibleDailyTask}
                        pagination={false}
                        rowKey="id"
                        className="custom-table"
                    />
                    <div className="paginations">
                        {nextPageToken && visibleDailyTask.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div>
                </div>



                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingTask?.id ? t('updateTask') : t('addTask')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-task">
                        <div className="inputtext">
                            <label className="titleinput">{t('title')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('titleNameVi')}
                                value={editingTask?.title?.vi || ''}
                                onChange={e => setEditingTask({ ...editingTask, title: { ...editingTask.title, vi: e.target.value } })}
                            />
                            {errors.titleVi && <div className="error-text">{errors.titleVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('title')} (English) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('titleNameEn')}
                                value={editingTask?.title?.en || ''}
                                onChange={e => setEditingTask({ ...editingTask, title: { ...editingTask.title, en: e.target.value } })}
                            />
                            {errors.titleEn && <div className="error-text">{errors.titleEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (Vietnamese) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('descriptionVi')}
                                value={editingTask?.description?.vi || ''}
                                onChange={e => setEditingTask({ ...editingTask, description: { ...editingTask.description, vi: e.target.value } })}
                            />
                            {errors.descriptionVi && <div className="error-text">{errors.descriptionVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (English) <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('descriptionEn')}
                                value={editingTask?.description?.en || ''}
                                onChange={e => setEditingTask({ ...editingTask, description: { ...editingTask.description, en: e.target.value } })}
                            />
                            {errors.descriptionEn && <div className="error-text">{errors.descriptionEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('reward')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectionreward')}
                                value={editingTask?.rewardId || undefined}
                                onChange={value => setEditingTask({ ...editingTask, rewardId: value })}
                            >
                                {rewards.map(r => (
                                    <Select.Option key={r.id} value={r.id}>
                                        {r.name?.[i18n.language]}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.rewardId && <div className="error-text">{errors.rewardId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('quantity')} <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputquantityReward')}
                                value={editingTask?.quantityReward || ''}
                                onChange={e => setEditingTask({ ...editingTask, quantityReward: Number(e.target.value) })}
                            />
                            {errors.quantityReward && <div className="error-text">{errors.quantityReward}</div>}
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

export default SystemTask;