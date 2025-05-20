import { useState, useContext, useEffect } from 'react';
import './reward.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Modal } from 'antd';
import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { Imgs } from "../../assets/theme/images";
import { toast } from 'react-toastify';
import api from '../../assets/api/Api';

const rewardData = [
    {
        id: 1,
        name: "Reward 1",
        description: "This is the first reward",
        image: "https://i.imgur.com/xpXEte1.jpeg",
        available: true,
    },
    {
        id: 2,
        name: "Reward 2",
        description: "This is the second reward",
        image: "https://i.imgur.com/xpXEte1.jpeg",
        available: false,
    },
    {
        id: 3,
        name: "Reward 3",
        description: "This is the third reward",
        image: "https://i.imgur.com/xpXEte1.jpeg",
        available: true,
    },
    {
        id: 4,
        name: "Reward 4",
        description: "This is the third reward",
        image: "https://i.imgur.com/xpXEte1.jpeg",
        available: true,
    },
    {
        id: 5,
        name: "Reward 5",
        description: "This is the third reward",
        image: "https://i.imgur.com/xpXEte1.jpeg",
        available: true,
    },
];
const Rewards = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [rewards, setRewards] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [errors, setErrors] = useState('');

    const rewardPage = 3;
    const indexOfLastUser = currentPage * rewardPage;
    const indexOfFirtsUser = indexOfLastUser - rewardPage;
    const currentRewards = rewards.slice(indexOfFirtsUser, indexOfLastUser);
    const totalPage = Math.ceil(rewards.length / rewardPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setRewards(rewardData);
    }, []);
    // const fetchRewards = async () => {
    //     try {
    //         const reponse = await api.get(`/reward`);
    //         setRewards(reponse.data);
    //     } catch (error) {
    //         console.log("lỗi", error);
    //     }
    // }
    const openModal = (mode, reward = null) => {
        if (mode === 'add') {
            setEditingReward({ name: '', description: '', image: '' });
            setImageUrl('');
        } else if (mode === 'update') {
            setEditingReward(reward);
            setImageUrl(reward.image);
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (Validation()) {
            console.log('đá', editingReward);
            try {
                const formData = new FormData();
                formData.append('name', editingReward.name);
                formData.append('description', editingReward.description);

                if (fileList.length > 0) {
                    formData.append('image', fileList[0].originFileObj);
                }
                if (editingReward.id) {
                    await api.put(`/reward/${editingReward.id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    toast.success('Update Successful', {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    await api.post(`/reward`, formData);
                    toast.success('Add Successful', {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchRewards();
                closeModal();
            } catch (error) {
                console.error("Error saving reward:", error);
                toast.error('Validation failed', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        }
    };

    const Validation = () => {
        const newErrors = {};
        if (!editingReward?.name || editingReward.name.trim() === '') {
            newErrors.name = 'Invalid name';
        }
        if (!editingReward?.description || editingReward.description.trim() === '') {
            newErrors.description = 'Invalid description';
        }
        if (!imageUrl && fileList.length === 0) {
            newErrors.image = 'Please select an image';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingReward(null);
        setImageUrl('');
    };

    const handleImageChange = (info) => {
        const file = info.fileList[info.fileList.length - 1]?.originFileObj;
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(file);
            setFileList([info.fileList[info.fileList.length - 1]]);
            setEditingReward(prev => ({
                ...prev,
                image: file.name
            }));
        }
    };



    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">Management Account User</h1>
                <div className="flex justify-between items-center mb-4">
                    <div className="filter-bar">
                        <div className="filter-container">
                            <div className="filter-containers">
                                <span className="filter-icon">
                                    <svg className="iconfilter" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                </span>
                                <button className="filter-text">Filter By</button>
                                <select className="filter-dropdown">
                                    <option>alphabet</option>
                                    <option>A-Z</option>
                                    <option>Z-A</option>
                                </select>
                                <select className="filter-dropdown">
                                    <option>Account Available</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                </select>
                                <button className="export-button">
                                    Export File
                                </button>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 text-white px-8 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + Add new
                        </button>
                    </div>
                </div>
                <table className="w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">Name</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Image</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRewards.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.description}</td>
                                <td className="p-3">
                                    <img src={user.image} alt={user.name} width="200" height="100" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                </td>
                                <td className="p-3">
                                    <button
                                        className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', user)}>
                                        <img className='iconupdate' src={Imgs.edit} />
                                        Update
                                    </button>
                                </td>
                                <td className="p-3">
                                    <label className="switch">
                                        <input type="checkbox" checked={user.available} readOnly />
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
                            {editingReward ? 'Update Reward' : 'Add Reward'}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="inputtext">
                        <label className="titleinput">Name</label>
                        <Input
                            value={editingReward?.name}
                            onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                            placeholder="Enter Name"
                        />
                        {errors.name && <div className="error-text">{errors.name}</div>}
                    </div>
                    <div className="inputtext">
                        <label className="titleinput">Image</label>
                        <div className="image-upload-container">
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleImageChange}
                                fileList={fileList}
                            >
                                <Button icon={<UploadOutlined />} className="custom-upload-button">
                                    Choose image
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
                        <label className="titleinput">Description</label>
                        <Input.TextArea
                            value={editingReward?.description}
                            onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                            placeholder="Enter description"
                            rows={4}
                        />
                        {errors.description && <div className="error-text">{errors.description}</div>}
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
        </div >
    );
};

export default Rewards;