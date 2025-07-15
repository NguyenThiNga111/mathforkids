import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Table, Switch, Button, Select } from 'antd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './completelesson.css';

const CompletedLesson = () => {
    const [pupils, setPupils] = useState([]);
    const [selectedPupilId, setSelectedPupilId] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [nextPageTokenPupils, setNextPageTokenPupils] = useState(null);
    const [nextPageTokenLessons, setNextPageTokenLessons] = useState(null);
    const [countAllPupils, setCountAllPupils] = useState(0);
    const [countAllLessons, setCountAllLessons] = useState(0);
    const pageSize = 100;
    const { t, i18n } = useTranslation(['completedLesson', 'common']);
    const navigate = useNavigate();

    // Fetch pupils
    useEffect(() => {
        const fetchPupils = async () => {
            setPupils([]);
            setNextPageTokenPupils(null);
            try {
                await fetchAllPupils(null);
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language] || t('fetchError', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        };

        fetchPupils();
    }, [i18n.language]);

    const fetchAllPupils = async (token = null) => {
        try {
            let url = `/pupil/filterByDisabledStatus?pageSize=${pageSize}&isDisabled=false`;
            if (token) {
                url += `&startAfterId=${token}`;
            }
            const countResponse = await api.get(`/pupil/countByDisabledStatus?isDisabled=false`);
            setCountAllPupils(Number(countResponse.data.count));
            const response = await api.get(url);
            const newPupils = response.data.data || [];
            setPupils((prev) => {
                const existingIds = new Set(prev.map((pupil) => pupil.id));
                const uniqueNewPupils = newPupils.filter((pupil) => !existingIds.has(pupil.id));
                return [...prev, ...uniqueNewPupils];
            });
            setNextPageTokenPupils(response.data.nextPageToken || null);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language] || t('fetchError', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    // Fetch completed lessons when a pupil is selected
    useEffect(() => {
        if (!selectedPupilId) {
            setCompletedLessons([]);
            setNextPageTokenLessons(null);
            setCountAllLessons(0);
            return;
        }

        const fetchCompletedLessons = async () => {
            setCompletedLessons([]);
            setNextPageTokenLessons(null);
            try {
                await fetchAllCompletedLessons(null);
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language] || t('fetchError', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        };

        fetchCompletedLessons();
    }, [selectedPupilId, i18n.language]);

    const fetchAllCompletedLessons = async (token = null) => {
        try {
            let url = `/completedlesson/getByPupil/${selectedPupilId}`;
            if (token) {
                url += `&startAfterId=${token}`;
            }
            // const countResponse = await api.get(`/completedlesson/countByPupil/${selectedPupilId}`);
            // setCountAllLessons(Number(countResponse.data.count));
            const response = await api.get(url);
            const newCompletedLessons = response.data || [];
            setCompletedLessons((prev) => {
                const existingIds = new Set(prev.map((cl) => cl.id));
                const uniqueNewLessons = newCompletedLessons.filter((cl) => !existingIds.has(cl.id));
                return [...prev, ...uniqueNewLessons];
            });
            setNextPageTokenLessons(response.data.nextPageToken || null);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language] || t('fetchError', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const loadMorePupils = async () => {
        if (!nextPageTokenPupils) return;
        try {
            await fetchAllPupils(nextPageTokenPupils);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language] || t('fetchError', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const loadMoreLessons = async () => {
        if (!nextPageTokenLessons) return;
        try {
            await fetchAllCompletedLessons(nextPageTokenLessons);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language] || t('fetchError', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleToggleStatus = async (completedLesson, field) => {
        try {
            const updatedData = {
                [field]: !completedLesson[field],
            };
            await api.patch(`/completedlesson/${completedLesson.id}`, updatedData);
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            setCompletedLessons((prev) =>
                prev.map((cl) =>
                    cl.id === completedLesson.id ? { ...cl, [field]: !completedLesson[field] } : cl
                )
            );
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language] || t('updateError', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const breadcrumbItems = [
        {
            title: t('pupil', { ns: 'common' }),
            onClick: () => navigate('/pupil'),
            className: 'current-breadcrumb-title',
        },
        {
            title: t('managementCompletedLesson'),
            className: 'current-breadcrumb',
        },
    ];

    const columns = [
        {
            title: t('lessonId'),
            dataIndex: 'lessonId',
            key: 'lessonId',
            width: 150,
        },
        {
            title: t('isCompleted'),
            dataIndex: 'isCompleted',
            key: 'isCompleted',
            align: 'center',
            render: (isCompleted, record) => (
                <Switch
                    checked={isCompleted}
                    onChange={() => handleToggleStatus(record, 'isCompleted')}
                    className="custom-switch"
                />
            ),
        },
        {
            title: t('isBlock'),
            dataIndex: 'isBlock',
            key: 'isBlock',
            align: 'center',
            render: (isBlock, record) => (
                <Switch
                    checked={isBlock}
                    onChange={() => handleToggleStatus(record, 'isBlock')}
                    className="custom-switch"
                />
            ),
        },
        {
            title: t('isDisabled'),
            dataIndex: 'isDisabled',
            key: 'isDisabled',
            align: 'center',
            render: (isDisabled) => (
                <span>{isDisabled ? t('yes', { ns: 'common' }) : t('no', { ns: 'common' })}</span>
            ),
        },
    ];

    return (
        <div className="containers">
            {/* <Navbar /> */}
            <Breadcrumb items={breadcrumbItems} style={{ marginTop: 10, marginBottom: -20 }} />
            <div className="title-search">
                <h1 className="container-title">{t('managementCompletedLesson')}</h1>
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
                            <button className="filter-text">{t('selectPupil', { ns: 'common' })}</button>
                        </span>
                        <Select
                            className="filter-dropdown"
                            value={selectedPupilId}
                            onChange={(value) => setSelectedPupilId(value)}
                            placeholder={t('selectPupil')}
                            style={{ width: 200 }}
                            allowClear
                        >
                            {pupils.map((pupil) => (
                                <Select.Option key={pupil.id} value={pupil.id}>
                                    {pupil.name?.[i18n.language] || pupil.id}
                                </Select.Option>
                            ))}
                        </Select>
                        {nextPageTokenPupils && pupils.length < countAllPupils && (
                            <Button className="load-more-btn" onClick={loadMorePupils}>
                                {t('MorePupils', { ns: 'common' })}
                            </Button>
                        )}
                    </div>
                </div>
                {selectedPupilId && (
                    <div className="table-container-completedlesson">
                        <Table
                            columns={columns}
                            dataSource={completedLessons}
                            pagination={false}
                            rowKey="id"
                            className="custom-table"
                        />
                        <div className="paginations">
                            {nextPageTokenLessons && completedLessons.length < countAllLessons ? (
                                <Button className="load-more-btn" onClick={loadMoreLessons}>
                                    {t('More', { ns: 'common' })}
                                </Button>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedLesson;