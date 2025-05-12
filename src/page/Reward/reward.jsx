import React, { useState } from 'react';
import './reward.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Select, Modal, DatePicker } from 'antd';
import moment from 'moment';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';

import { Imgs } from "../../assets/theme/images";
const rewardsData = [
    { id: "r001", name: "Gold Star", description: "Awarded for excellent performance", image: "https://i.imgur.com/xpXEte1.jpeg" },
    { id: "r002", name: "Diamond Medal", description: "Top rank achiever reward", image: "https://i.imgur.com/xpXEte1.jpeg" },
    { id: "r003", name: "Silver Badge", description: "Great effort recognition", image: "https://cdn.britannica.com/77/191677-050-3CBF2834/Capybara.jpg" }
];

const Rewards = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [edittingReward, setEditingReward] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [rewards, setRewards] = useState(rewardsData);

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
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingReward(null);
        setImageUrl('');
    };

    const handleSave = () => {
        if (edittingReward.id) {
            // Update
            const updated = rewards.map(r => r.id === edittingReward.id ? edittingReward : r);
            setRewards(updated);
        } else {
            // Add new
            const newReward = {
                ...edittingReward,
                id: 'r' + (rewards.length + 1),
                image: imageUrl,
            };
            setRewards([...rewards, newReward]);
        }
        closeModal();
    };

    const handleImageChange = (info) => {
        const file = info.file.originFileObj;
        const reader = new FileReader();
        reader.onload = e => {
            setImageUrl(e.target.result);
            setEditingReward(prev => ({ ...prev, image: e.target.result }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">Management Account User</h1>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex justify-between items-center mb-4 filter-bar">
                        <div className="flex space-x-4 items-center">
                            <span className="filter-icon">
                                <img className='iconfilter' src={Imgs.filter} /> {/* Biểu tượng phễu từ Font Awesome */}
                            </span>
                            <button className="filter">
                                Filter By
                            </button>
                            <select className="border p-2 rounded filter-dropdown">
                                <option>alphabet</option>
                                <option>A-Z</option>
                                <option>Z-A</option>
                            </select>
                            <select className="border p-2 rounded filter-dropdown">
                                <option>Account Available</option>
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                            <button className="reset-button">
                                Export File
                            </button>

                        </div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => openModal('add')}>+ Add new</button>
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
                        {rewards.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.description}</td>
                                <td className="p-3">
                                    <img src={user.image} alt={user.name} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                </td>

                                <td className="p-3">
                                    <button className="text-white px-3 py-1 buttonupdate"
                                        onClick={() => openModal('update', user)}>
                                        <img className='iconupdate' src={Imgs.edit} />Update</button>
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
                <div className="flex justify-end items-center mt-4">
                    <div className="flex space-x-3">
                        <button className="bg-gray-300 px-2 py-1 rounded">&lt;</button>
                        <button className="bg-blue-500 text-white px-2 py-1 rounded">1</button>
                        <button className="bg-gray-300 px-2 py-1 rounded">2</button>
                        <button className="bg-gray-300 px-2 py-1 rounded">3</button>
                        <button className="bg-gray-300 px-2 py-1 rounded">...</button>
                        <button className="bg-gray-300 px-2 py-1 rounded">67</button>
                        <button className="bg-gray-300 px-2 py-1 rounded">68</button>
                        <button className="bg-gray-300 px-2 py-1 rounded">&gt;</button>
                    </div>
                </div>

                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {edittingReward ? 'Update Reward' : 'Add Reward'}
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
                            value={edittingReward?.name}
                            onChange={(e) => setEditingReward({ ...edittingReward, name: e.target.value })}
                            placeholder="Enter Name"
                        />
                    </div>
                    <div className="inputtext">
                        <label className="titleinput">Image</label>
                        <Upload
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleImageChange}
                        >
                            <Button icon={<UploadOutlined />}>Choose Image</Button>
                        </Upload>
                        {imageUrl && (
                            <img src={imageUrl} alt="Preview" style={{ width: 200, height: 200, marginTop: 10, borderRadius: '8px' }} />
                        )}
                    </div>
                    <div className="inputtext">
                        <label className="titleinput">Description</label>
                        <Input.TextArea
                            value={edittingReward?.description}
                            onChange={(e) => setEditingReward({ ...edittingReward, description: e.target.value })}
                            placeholder="Enter description"
                            rows={4}
                        />
                    </div>
                    <div className="button-row">
                        <Button type="primary" block onClick={handleSave}>
                            Save
                        </Button>
                        <Button type="primary" onClick={closeModal} block>Cancel</Button>
                    </div>
                </Modal>
            </div>
        </div >
    );
};

export default Rewards;