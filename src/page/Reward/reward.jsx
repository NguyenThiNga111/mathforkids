import { useState, useContext, useEffect } from 'react';
import './reward.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Modal } from 'antd';
import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { Imgs } from "../../assets/theme/images";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';

const Rewards = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [rewards, setRewards] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [filterAlphabet, setFilterAlphabet] = useState('alphabet'); // mặc định chưa chọn kiểu sắp xếp
    const [filterStatus, setFilterStatus] = useState('all'); // all / enabled / disabled
    const [errors, setErrors] = useState('');

    const rewardPage = 3;
    const { t, i18n } = useTranslation(['reward', 'common']);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const reponse = await api.get(`/reward`);
            setRewards(reponse.data);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    }

    const handleSave = async () => {
        if (Validation()) {
            try {
                const formData = new FormData();
                formData.append('name', JSON.stringify(editingReward.name));
                formData.append('description', JSON.stringify(editingReward.description));
                formData.append("image", editingReward.image); // This is File

                if (editingReward.id) {
                    await api.put(`/reward/${editingReward.id}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post(`/reward`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
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
            const updatedReward = {
                ...reward,
                isDisabled: !reward.isDisabled,
            };
            await api.put(`/reward/disable/${reward.id}`, {
                ...updatedReward,
                isDisabled: updatedReward.isDisabled,
            });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            setRewards((prev) =>
                prev.map((r) => (r.id === reward.id ? { ...r, isDisabled: updatedReward.isDisabled } : r))
            );
        } catch (error) {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const Validation = () => {
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
        if (!imageUrl && fileList.length === 0) {
            newErrors.image = t('imageRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const openModal = (mode, reward = null) => {
        if (mode === 'add') {
            setEditingReward({ name: { en: '', vi: '' }, description: { en: '', vi: '' }, image: '' });
            setImageUrl('');
        } else if (mode === 'update') {
            setEditingReward(reward);
            setImageUrl(reward.image);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingReward(null);
        setImageUrl('');
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
            setEditingReward(prev => ({
                ...prev,
                image: fileObj // Gán object thực tế, không phải file.name
            }));
        }
    };

    const filteredRewards = rewards.filter(reward => {
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'yes'
                    ? reward.isDisabled === false
                    : reward.isDisabled === true;

        return matchStatus;
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
    const indexOfLastUser = currentPage * rewardPage;
    const indexOfFirtsUser = indexOfLastUser - rewardPage;
    const currentRewards = filteredRewards.slice(indexOfFirtsUser, indexOfLastUser);
    const totalPage = Math.ceil(filteredRewards.length / rewardPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('managementReward')}</h1>
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
                                <button className="filter-text">
                                    {t('filterBy', { ns: 'common' })}
                                </button>
                                <select
                                    className="filter-dropdown"
                                    value={filterAlphabet}
                                    onChange={(e) => {
                                        setFilterAlphabet(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="alphabet">{t('alphabet')}</option>
                                    <option value="A-Z">A-Z</option>
                                    <option value="Z-A">Z-A</option>
                                </select>
                                <select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('rewardStatus')}</option>
                                    <option value="yes">{t('yes', { ns: 'common' })}</option>
                                    <option value="no">{t('no', { ns: 'common' })}</option>
                                </select>
                                <button className="export-button">
                                    {t('exportFile', { ns: 'common' })}
                                </button>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 text-white px-8 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + {t('addNew', { ns: 'common' })}
                        </button>
                    </div>
                </div>
                <table className="w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">{t('name')}</th>
                            <th className="p-3">{t('description')}</th>
                            <th className="p-3">{t('image')}</th>
                            <th className="p-3">{t('action', { ns: 'common' })}</th>
                            <th className="p-3">{t('available', { ns: 'common' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRewards.map((reward) => (
                            <tr key={reward.id} className="border-t">
                                <td className="p-3">{reward.name?.[i18n.language]}</td>
                                <td className="p-3">{reward.description?.[i18n.language]}</td>
                                <td className="p-3">
                                    <img src={reward.image} alt={reward.name?.[i18n.language]} width="200" height="100" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                </td>
                                <td className="p-3">
                                    <button
                                        className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', reward)}>
                                        <img className='iconupdate' src={Imgs.edit} />
                                        {t('update', { ns: 'common' })}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={reward.isDisabled}
                                            onChange={() => handleToggleAvailable(reward)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
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
                        {Array.from({ length: totalPage }, (_, index) => (
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
                            onClick={() => currentPage < totalPage && paginate(currentPage + 1)}
                            disabled={currentPage === totalPage}
                        >
                            &gt;
                        </button>
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
                            <label className="titleinput">{t('name')} (Vietnamese)</label>
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
                            <label className="titleinput">{t('name')} (English)</label>
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
                            <label className="titleinput">{t('image')}</label>
                            <div className="image-upload-container">
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
                                        <img src={imageUrl} alt="Preview" className="preview-image" />
                                    </div>
                                )}
                            </div>
                            {errors.image && <div className="error-text">{errors.image}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (Vietnamese)</label>
                            <Input.TextArea
                                placeholder={t('inputDescriptonVi')}
                                value={editingReward?.description?.vi || ''}
                                onChange={(e) =>
                                    setEditingReward({
                                        ...editingReward,
                                        description: { ...editingReward.description, vi: e.target.value },
                                    })
                                }
                                rows={2}
                            />
                            {errors.descriptionVi && <div className="error-text">{errors.descriptionVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">{t('description')} (English)</label>
                            <Input.TextArea
                                placeholder={t('inputDescriptonEn')}
                                value={editingReward?.description?.en || ''}
                                onChange={(e) =>
                                    setEditingReward({
                                        ...editingReward,
                                        description: { ...editingReward.description, en: e.target.value },
                                    })
                                }
                                rows={2}
                            />
                            {errors.descriptionEn && <div className="error-text">{errors.descriptionEn}</div>}
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
        </div >
    );
};

export default Rewards;