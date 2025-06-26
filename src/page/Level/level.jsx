import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Select, Modal, Table, Switch } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaPlus, FaArrowsAlt } from 'react-icons/fa';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './level.css';

const { Option } = Select;

const Level = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);
    const [levelsData, setLevelsData] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [countAll, setCountAll] = useState(0);
    const [visibleLevels, setVisibleLevels] = useState([]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isDragEnabled, setIsDragEnabled] = useState(false);
    const { t, i18n } = useTranslation(['level', 'common']);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const levelsPerPage = 10;
    const levelColors = useMemo(() => [
        '#00FF00', // Green
        '#FFFF00', // Yellow
        '#FFA500', // Orange
        '#FF0000', // Red
        '#8B0000', // Dark Red
        '#0000FF', // Blue
        '#00FFFF', // Cyan
        '#FF00FF', // Magenta
        '#FFA07A', // Light Salmon
        '#20B2AA', // Light Sea Green
    ], []);

    const fetchLevels = useCallback(
        async (token = null, isDisabled = null) => {
            try {
                let url = `/level?pageSize=${levelsPerPage}`;
                if (token) url += `&startAfterId=${token}`;
                const response = await api.get(url);
                const newLevels = response.data.data || [];
                const countResponse = await api.get(`/level/countAll`);
                setCountAll(Number(countResponse.data.count));
                setLevelsData((prev) => {
                    const existingIds = new Set(prev.map((level) => level.id));
                    const uniqueNewLevels = newLevels.filter((level) => !existingIds.has(level.id));
                    return [...prev, ...uniqueNewLevels];
                });
                setVisibleLevels((prev) => {
                    const existingIds = new Set(prev.map((level) => level.id));
                    const uniqueNewLevels = newLevels.filter((level) => !existingIds.has(level.id));
                    return [...prev, ...uniqueNewLevels];
                });
                setNextPageToken(response.data.nextPageToken || null);
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language] || 'Error fetching levels', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        },
        [i18n.language]
    );

    const fetchLevelsByDisabled = useCallback(
        async (token = null, isDisabled = null) => {
            try {
                let url = `/level/filterByDisabledStatus?pageSize=${levelsPerPage}&isDisabled=${isDisabled}`;
                if (token) url += `&startAfterId=${token}`;
                const response = await api.get(url);
                const newLevels = response.data.data || [];
                const countResponse = await api.get(`/level/countByDisabledStatus`);
                setCountAll(Number(countResponse.data.count));
                setLevelsData((prev) => {
                    const existingIds = new Set(prev.map((level) => level.id));
                    const uniqueNewLevels = newLevels.filter((level) => !existingIds.has(level.id));
                    return [...prev, ...uniqueNewLevels];
                });
                setVisibleLevels((prev) => {
                    const existingIds = new Set(prev.map((level) => level.id));
                    const uniqueNewLevels = newLevels.filter((level) => !existingIds.has(level.id));
                    return [...prev, ...uniqueNewLevels];
                });
                setNextPageToken(response.data.nextPageToken || null);
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language] || 'Error fetching levels', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        },
        [i18n.language]
    );

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setVisibleLevels(levelsData);
        } else {
            const filtered = levelsData.filter((level) =>
                level.name?.[i18n.language]?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setVisibleLevels(filtered);
        }
    }, [searchQuery, levelsData, i18n.language]);

    useEffect(() => {
        const fetchData = async () => {
            setVisibleLevels([]);
            setLevelsData([]);
            setNextPageToken(null);
            if (filterStatus !== 'all') {
                await fetchLevelsByDisabled(null, filterStatus);
            } else {
                await fetchLevels(null);
            }
        };
        fetchData();
    }, [filterStatus, fetchLevels, fetchLevelsByDisabled]);

    const loadMore = useCallback(async () => {
        if (!nextPageToken) return;
        if (filterStatus !== 'all') {
            await fetchLevelsByDisabled(nextPageToken, filterStatus);
        } else {
            await fetchLevels(nextPageToken);
        }
    }, [nextPageToken, filterStatus, fetchLevels]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!editingLevel?.name?.vi || editingLevel.name.vi.trim() === '') {
            newErrors.nameVi = t('nameViRequired');
        }
        if (!editingLevel?.name?.en || editingLevel.name.en.trim() === '') {
            newErrors.nameEn = t('nameEnRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [editingLevel, t]);

    const handleSave = useCallback(
        async () => {
            if (validateForm()) {
                try {
                    const { id, ...payload } = editingLevel;
                    payload.name = {
                        vi: editingLevel.name?.vi || '',
                        en: editingLevel.name?.en || '',
                    };
                    payload.isDisabled = editingLevel.isDisabled || false;

                    if (editingLevel?.id) {
                        await api.patch(`/level/${editingLevel.id}`, payload);
                        toast.success(t('updateSuccess', { ns: 'common' }), {
                            position: 'top-right',
                            autoClose: 2000,
                        });
                    } else {
                        const response = await api.get(`/level?pageSize=${levelsPerPage}`);
                        const levels = response.data.data || [];
                        const maxLevel = levels.length > 0 ? Math.max(...levels.map((l) => l.level || 0)) : 0;
                        payload.level = maxLevel + 1;
                        await api.post(`/level`, payload);
                        toast.success(t('addSuccess', { ns: 'common' }), {
                            position: 'top-right',
                            autoClose: 2000,
                        });
                    }
                    setLevelsData([]);
                    setVisibleLevels([]);
                    setNextPageToken(null);
                    await fetchLevels(null, filterStatus === 'all' ? null : filterStatus === 'true');
                    closeModal();
                } catch (error) {
                    toast.error(error.response?.data?.message?.[i18n.language] || 'Error saving level', {
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
        },
        [editingLevel, filterStatus, fetchLevels, i18n.language, t, validateForm]
    );

    const handleToggleAvailable = useCallback(
        async (level) => {
            try {
                const updatedLevel = { ...level, isDisabled: !level.isDisabled };
                await api.patch(`/level/${level.id}`, { isDisabled: updatedLevel.isDisabled });
                toast.success(t('updateSuccess', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
                setLevelsData((prev) =>
                    prev.map((e) => (e.id === level.id ? { ...e, isDisabled: !level.isDisabled } : e))
                );
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language] || 'Error updating status', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        },
        [i18n.language, t]
    );

    const openModal = useCallback(async (mode, level = null) => {
        if (mode === 'add') {
            try {
                const response = await api.get(`/level?pageSize=${levelsPerPage}`);
                const levels = response.data.data || [];
                const maxLevel = levels.length > 0 ? Math.max(...levels.map((l) => l.level || 0)) : 0;
                setEditingLevel({
                    name: { en: '', vi: '' },
                    level: maxLevel + 1,
                    isDisabled: false,
                });
            } catch (error) {
                toast.error(t('fetchLevelsFailed', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } else if (mode === 'update') {
            setEditingLevel(level);
        }
        setIsModalOpen(true);
    }, [t, levelsPerPage]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setErrors({});
    }, []);

    const handleDragEnd = useCallback(
        async (result) => {
            if (!result.destination) return;

            const reorderedLevels = Array.from(visibleLevels);
            const [movedLevel] = reorderedLevels.splice(result.source.index, 1);
            reorderedLevels.splice(result.destination.index, 0, movedLevel);

            const updatedLevels = reorderedLevels.map((level, index) => ({
                ...level,
                level: index + 1,
            }));

            setVisibleLevels(updatedLevels);
            setLevelsData(updatedLevels);

            try {
                const updatePromises = updatedLevels.map((level) =>
                    api.patch(`/level/${level.id}`, { level: level.level })
                );
                await Promise.all(updatePromises);
                toast.success(t('updateOrderSuccess'), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } catch (error) {
                toast.error(t('updateOrderFailed'), {
                    position: 'top-right',
                    autoClose: 3000,
                });
                setVisibleLevels(levelsData);
            }
        },
        [visibleLevels, levelsData, t]
    );

    const toggleDrag = useCallback(() => {
        setIsDragEnabled((prev) => !prev);
    }, []);

    const columns = useMemo(
        () => [
            {
                title: t('level'),
                dataIndex: 'level',
                key: 'level',
                width: 100,
            },
            {
                title: t('levelName'),
                dataIndex: 'name',
                key: 'name',
                render: (name) => name?.[i18n.language] || '',
            },
            {
                title: t('likertScale'),
                key: 'likertScale',
                align: 'center',
                render: (_, record) => {
                    const maxLevels = Math.max(...levelsData.map((level) => level.level || 1), 1);
                    return (
                        <div style={{
                            display: 'flex',
                            width: '200px',
                            height: '20px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            margin: '0 auto' // Căn giữa thanh
                        }}>
                            {Array.from({ length: maxLevels }).map((_, index) => {
                                const colorIndex = Math.min(index, levelColors.length - 1); // Đảm bảo không vượt quá 10 màu
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            flex: 1,
                                            backgroundColor: index < (record.level || 1) ? levelColors[colorIndex] : '#E0E0E0',
                                        }}
                                    />
                                );
                            })}
                        </div>
                    );
                },
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
                        checked={!isDisabled}
                        onChange={() => handleToggleAvailable(record)}
                        className="custom-switch"
                    />
                ),
            },
        ],
        [t, i18n.language, openModal, handleToggleAvailable, levelsData]
    );

    return (
        <div className="containers">
            <Navbar />
            <div className="title-search">
                <h1 className="container-title">{t('managementLevels')}</h1>
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
                            placeholder={t('status', { ns: 'common' })}
                        >
                            <Option value="all">{t('status', { ns: 'common' })}</Option>
                            <Option value="false">{t('no', { ns: 'common' })}</Option>
                            <Option value="true">{t('yes', { ns: 'common' })}</Option>
                        </Select>
                    </div>
                    <div className="button-group">
                        <Button
                            className={`rounded-toggle-drag ${isDragEnabled ? 'active' : ''}`}
                            onClick={toggleDrag}
                        >
                            <FaArrowsAlt className="inline mr-2" />
                            {isDragEnabled ? t('disableDrag') : t('enableDrag')}
                        </Button>
                        <Button className="rounded-add" onClick={() => openModal('add')}>
                            <FaPlus className="inline mr-2" />
                            {t('addNew', { ns: 'common' })}
                        </Button>
                    </div>
                </div>

                <div className="table-container-level">
                    {isDragEnabled ? (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="levels">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={snapshot.isDraggingOver ? 'dragging-over' : ''}
                                    >
                                        <Table
                                            columns={columns}
                                            dataSource={visibleLevels}
                                            pagination={false}
                                            rowKey="id"
                                            className="custom-table"
                                            components={{
                                                body: {
                                                    row: ({ children, ...props }) => {
                                                        const index = visibleLevels.findIndex(
                                                            (level) => level.id === props['data-row-key']
                                                        );
                                                        return (
                                                            <Draggable draggableId={props['data-row-key']} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <tr
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        {...props}
                                                                        className={snapshot.isDragging ? 'dragging' : ''}
                                                                        style={{
                                                                            ...provided.draggableProps.style,
                                                                            ...(snapshot.isDragging
                                                                                ? { backgroundColor: '#f0f0f0', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }
                                                                                : {}),
                                                                        }}
                                                                    >
                                                                        {children}
                                                                    </tr>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    },
                                                },
                                            }}
                                        />
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={visibleLevels}
                            pagination={false}
                            rowKey="id"
                            className="custom-table-level"
                        />
                    )}
                    <div className="paginations">
                        {nextPageToken && visibleLevels.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Modal
                    title={
                        <div className="text-center text-2xl">
                            {editingLevel?.id ? t('updateLevel') : t('addLevel')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-level">
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('levelName')} (Vietnamese)  <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputLevelNameVi')}
                                value={editingLevel?.name?.vi || ''}
                                onChange={(e) =>
                                    setEditingLevel({
                                        ...editingLevel,
                                        name: { ...editingLevel?.name, vi: e.target.value },
                                    })
                                }
                            />
                            {errors.nameVi && <div className="error-text">{errors.nameVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('levelName')} (English)  <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputLevelNameEn')}
                                value={editingLevel?.name?.en || ''}
                                onChange={(e) =>
                                    setEditingLevel({
                                        ...editingLevel,
                                        name: { ...editingLevel?.name, en: e.target.value },
                                    })
                                }
                            />
                            {errors.nameEn && <div className="error-text">{errors.nameEn}</div>}
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

export default Level;