import { useEffect, useState } from 'react';
import { Input, Button, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import { Imgs } from '../../assets/theme/images';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './systemtask.css';

const SystemTask = () => {
    const { t, i18n } = useTranslation(['systemtask', 'common']);
    const { Option } = Select;
    const [tasks, setTasks] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchTasks();
        fetchRewards();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/dailytask');
            setTasks(res.data);
        } catch {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const fetchRewards = async () => {
        const res = await api.get('/reward');
        setRewards(res.data);
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
                await api.put(`/dailytask/${id}`, payload);
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
            fetchTasks();
            closeModal();
        } catch {
            toast.error(t('errorSavingData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleToggleDisabled = async (task) => {
        try {
            const updatedTask = { ...task, isDisabled: !task.isDisabled };
            await api.put(`/dailytask/${task.id}`, updatedTask);
            fetchTasks();
            toast.success(t('updateSuccess', { ns: 'common' }));
        } catch {
            toast.error(t('errorSavingData', { ns: 'common' }));
        }
    };
    const filteredTasks = tasks.filter(task => {
        const matchStatus = filterStatus === ''
            ? true
            : filterStatus === 'yes'
                ? task.isDisabled === true
                : task.isDisabled === false;
        return matchStatus;
    });

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('taskManagement')}</h1>
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
                                     onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="">{t('systemtaskStatus')}</option>
                                    <option value="yes">{t('yes', { ns: 'common' })}</option>
                                    <option value="no">{t('no', { ns: 'common' })}</option>
                                </select>
                                <button className="export-button">{t('exportFile', { ns: 'common' })}</button>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + {t('addNew', { ns: 'common' })}
                        </button>
                    </div>
                </div>

                <table className="w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2">{t('title')}</th>
                            <th className="p-2">{t('reward')}</th>
                            <th className="p-2">{t('quantityReward')}</th>
                            <th className="p-2">{t('description')}</th>
                            <th className="p-2">{t('action', { ns: 'common' })}</th>
                            <th className="p-2">{t('available', { ns: 'common' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map(task => (
                            <tr key={task.id} className="border-t">
                                <td className="p-2">{task.title?.[i18n.language]}</td>
                                <td className="p-2">{rewards.find(r => r.id === task.rewardId)?.name?.[i18n.language]}</td>
                                <td className="p-2">{task.quantityReward}</td>
                                <td className="p-2">{task.description?.[i18n.language]}</td>
                                <td className="p-3">
                                    <button
                                        className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', task)}
                                    >
                                        <img className="iconupdate" src={Imgs.edit} alt="Edit" />
                                        {t('update', { ns: 'common' })}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <label className="switch">
                                        <input type="checkbox" checked={task.isDisabled} onChange={() => handleToggleDisabled(task)} />
                                        <span className="slider round"></span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

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
                    <div className="form-content-lesson">
                        <div className="inputtext">
                            <label className="titleinput">{t('title')} (Vietnamese)</label>
                            <Input
                                placeholder={t('titleNameVi')}
                                value={editingTask?.title?.vi || ''}
                                onChange={e => setEditingTask({ ...editingTask, title: { ...editingTask.title, vi: e.target.value } })}
                            />
                            {errors.titleVi && <div className="error-text">{errors.titleVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('title')} (English)</label>
                            <Input
                                placeholder={t('titleNameEn')}
                                value={editingTask?.title?.en || ''}
                                onChange={e => setEditingTask({ ...editingTask, title: { ...editingTask.title, en: e.target.value } })}
                            />
                            {errors.titleEn && <div className="error-text">{errors.titleEn}</div>}
                        </div>

                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (Vietnamese)</label>
                            <Input
                                placeholder={t('descriptionVi')}
                                value={editingTask?.description?.vi || ''}
                                onChange={e => setEditingTask({ ...editingTask, description: { ...editingTask.description, vi: e.target.value } })}
                            />
                            {errors.descriptionVi && <div className="error-text">{errors.descriptionVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (English)</label>
                            <Input
                                placeholder={t('descriptionEn')}
                                value={editingTask?.description?.en || ''}
                                onChange={e => setEditingTask({ ...editingTask, description: { ...editingTask.description, en: e.target.value } })}
                            />
                            {errors.descriptionEn && <div className="error-text">{errors.descriptionEn}</div>}
                        </div>

                        <div className="inputtext">
                            <label className="titleinput">{t('reward')}</label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectionreward')}
                                value={editingTask?.rewardId || undefined}
                                onChange={value => setEditingTask({ ...editingTask, rewardId: value })}
                            >
                                {rewards.map(r => (
                                    <Option key={r.id} value={r.id}>
                                        {r.name?.[i18n.language]}
                                    </Option>
                                ))}
                            </Select>
                            {errors.rewardId && <div className="error-text">{errors.rewardId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('quantityReward')}</label>
                            <Input
                                placeholder={t('inputquantityReward')}
                                value={editingTask?.quantityReward || ''}
                                onChange={e => setEditingTask({ ...editingTask, quantityReward: Number(e.target.value) })}
                            />
                            {errors.quantityReward && <div className="error-text">{errors.quantityReward}</div>}
                        </div>
                    </div>
                    <div className="button-row">
                        <Button type="primary" onClick={handleSave} block>
                            Save
                        </Button>
                        <Button type="primary" onClick={closeModal} block>
                            Cancel
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default SystemTask;
