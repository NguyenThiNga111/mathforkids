import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './completeTask.css';

const CompleteTask = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [completeTasksData, setCompleteTasksData] = useState([]);
    const [pupils, setPupils] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all / completed / not completed

    const { t, i18n } = useTranslation(['completetask', 'common']);
    const { Option } = Select;
    const tasksPerPage = 20;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [completeTasksRes, pupilsRes, tasksRes, lessonsRes] = await Promise.all([
                api.get('/completetask'),
                api.get('/pupil'),
                api.get('/dailytask'),
                api.get('/lesson'),
            ]);

            setPupils(pupilsRes.data);
            setTasks(tasksRes.data);
            setLessons(lessonsRes.data);

            const completeTasks = await Promise.all(
                completeTasksRes.data.map(async (task) => {
                    const [pupilRes, taskRes, lessonRes] = await Promise.all([
                        api.get(`/pupil/${task.pupilId}`),
                        api.get(`/dailytask/${task.taskId}`),
                        api.get(`/lesson/${task.lessonId}`)
                    ]);

                    return {
                        ...task,
                        pupilName: pupilRes.data.fullName,
                        taskTitle: taskRes.data.title,
                        lessonName: lessonRes.data.name
                    };
                })
            );

            setCompleteTasksData(completeTasks);
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
                    pupilId: editingTask.pupilId,
                    taskId: editingTask.taskId,
                    lessonId: editingTask.lessonId,
                    isCompleted: editingTask.isCompleted,
                };

                if (editingTask?.id) {
                    await api.put(`/completetask/${editingTask.id}`, payload);
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post('/completetask', payload);
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchData();
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
        if (!editingTask?.pupilId) {
            newErrors.pupilId = t('pupilRequired');
        }
        if (!editingTask?.taskId) {
            newErrors.taskId = t('taskRequired');
        }
        if (!editingTask?.lessonId) {
            newErrors.lessonId = t('lessonRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openModal = (mode, task = null) => {
        if (mode === 'add') {
            setEditingTask({ pupilId: '', taskId: '', lessonId: '', isCompleted: false });
        } else if (mode === 'update') {
            setEditingTask(task);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const filteredTasks = completeTasksData.filter(task => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'completed'
                    ? task.isCompleted === true
                    : task.isCompleted === false;
        return matchStatus;
    });

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            {/* <Navbar /> */}
            <div className="container-content">
                <h1 className="container-title">{t('managementCompleteTasks')}</h1>
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
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('taskStatus')}</option>
                                    <option value="completed">{t('completed')}</option>
                                    <option value="notCompleted">{t('notCompleted')}</option>
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
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">{t('pupil')}</th>
                            <th className="p-3">{t('task')}</th>
                            <th className="p-3">{t('lesson')}</th>
                            <th className="p-3">{t('status')}</th>
                            <th className="p-3">{t('action', { ns: 'common' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTasks.map((task) => (
                            <tr key={task.id} className="border-t">
                                <td className="p-3">{task.pupilName || task.pupilId}</td>
                                <td className="p-3">{task.taskTitle?.[i18n.language] || task.taskId}</td>
                                <td className="p-3">{task.lessonName?.[i18n.language] || task.lessonId}</td>
                                <td className="p-3">
                                    {task.isCompleted ? t('completed') : t('notCompleted')}
                                </td>
                                <td className="p-3">
                                    <button
                                        className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', task)}
                                    >
                                        {t('update', { ns: 'common' })}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>

                <div className="flex justify-end items-center mt-4 ml-auto">
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
                                className={`around ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
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

                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingTask?.id ? t('updateCompleteTask') : t('addCompleteTask')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-task">
                        <div className="inputtext">
                            <label className="titleinput">{t('pupil')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectPupil')}
                                value={editingTask?.pupilId || undefined}
                                onChange={(value) => setEditingTask({ ...editingTask, pupilId: value })}
                            >
                                {pupils.map(pupil => (
                                    <Option key={pupil.id} value={pupil.id}>{pupil.fullName}</Option>
                                ))}
                            </Select>
                            {errors.pupilId && <div className="error-text">{errors.pupilId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('task')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectTask')}
                                value={editingTask?.taskId || undefined}
                                onChange={(value) => setEditingTask({ ...editingTask, taskId: value })}
                            >
                                {tasks.map(task => (
                                    <Option key={task.id} value={task.id}>{task.title?.[i18n.language]}</Option>
                                ))}
                            </Select>
                            {errors.taskId && <div className="error-text">{errors.taskId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('lesson')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectLesson')}
                                value={editingTask?.lessonId || undefined}
                                onChange={(value) => setEditingTask({ ...editingTask, lessonId: value })}
                            >
                                {lessons.map(lesson => (
                                    <Option key={lesson.id} value={lesson.id}>{lesson.name?.[i18n.language]}</Option>
                                ))}
                            </Select>
                            {errors.lessonId && <div className="error-text">{errors.lessonId}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('status')}</label>
                            <Input
                                style={{ height: '50px' }}
                                value={t('notCompleted')}
                                disabled
                            />
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

export default CompleteTask;