import { useState, useContext, useEffect } from 'react';
import { Input, Button, Modal } from 'antd';
import { FaEdit, FaBook } from 'react-icons/fa';
import { UploadOutlined } from '@ant-design/icons';
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
    const [filterAlphabet, setFilterAlphabet] = useState('alphabet'); // mặc định chưa chọn kiểu sắp xếp
    const [filterStatus, setFilterStatus] = useState('all'); // all / enabled / disabled
    const [errors, setErrors] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // New state for search query
    const rewardPage = 10;
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
                return dateB - dateA; // Mới nhất lên đầu
            });
            setRewards(sortedRewards);
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
                if (fileList[0]?.originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }
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

            // Cập nhật fileList để Upload hiển thị đúng ảnh
            setFileList([info.fileList[info.fileList.length - 1]]);

            // Cập nhật file vào state editingReward
            setEditingReward(prev => ({
                ...prev,
                image: fileObj
            }));
        }
    };

    const parseDate = (dateString) => {
        // Chuyển đổi định dạng "09:02:13 21/5/2025" thành Date object
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
        return matchStatus && (
            rewardName.includes(searchText)
        );
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
    const indexOfLastReward = currentPage * rewardPage;
    const indexOfFirtsReward = indexOfLastReward - rewardPage;
    const currentRewards = filteredRewards.slice(indexOfFirtsReward, indexOfLastReward);
    const totalPage = Math.ceil(filteredRewards.length / rewardPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="containers">
            <Navbar />
            <div className='title-search'>
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
                                        strokeLinejoin="round">
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                    <button className="filter-text">
                                        {t('filterBy', { ns: 'common' })}
                                    </button>
                                </span>

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
                <div className="table-container-reward">
                    <table className="w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="p-3">{t('.no', { ns: 'common' })}</th>
                                <th className="p-3">{t('name')}</th>
                                <th className="p-3">{t('description')}</th>
                                <th className="p-3 text-center">{t('image')}</th>
                                <th className="p-3 text-center">{t('action', { ns: 'common' })}</th>
                                <th className="p-3 text-center">{t('available', { ns: 'common' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRewards.map((reward, index) => (
                                <tr key={reward.id} className="border-t">
                                    <td className="p-3">{indexOfFirtsReward + index + 1}</td>
                                    <td className="p-3">{reward.name?.[i18n.language]}</td>
                                    <td className="p-3">{reward.description?.[i18n.language]}</td>
                                    <td className="p-3 text-center">
                                        <img src={reward.image} alt={reward.name?.[i18n.language]} width="150" height="150" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            className="text-white px-3 py-1 buttonupdate"
                                            onClick={() => openModal('update', reward)}>
                                            <FaEdit className='iconupdate' />
                                            {t('update', { ns: 'common' })}
                                        </button>
                                    </td>
                                    <td className="p-3 text-center">
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
                                <div className="image-preview-box">
                                    <img src={imageUrl} alt="Preview" className="preview-image" />
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
        </div >
    );
};

export default Rewards;