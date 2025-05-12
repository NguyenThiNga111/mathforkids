import React, { useState } from 'react';
import './accountuser.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Select, Modal, DatePicker } from 'antd';
import moment from 'moment';
import { Imgs } from "../../assets/theme/images";
const usersData = [
    { id: "00001", username: "Anguyen", email: "php3002@gmail.com", address: "Ca mau", numberPhone: "0382247620", birthday: "14/05/1985", gender: "Male", role: "user", available: true },
    { id: "00002", username: "Bnguyen", email: "php3002@gmail.com", address: "Can tho", numberPhone: "0382247620", birthday: "12/03/1999", gender: "Male", role: "user", available: true },
    { id: "00003", username: "Cnguyen", email: "php3002@gmail.com", address: "Vinh long", numberPhone: "0382247620", birthday: "12/02/1990", gender: "Male", role: "user", available: false },
    { id: "00004", username: "Dnguyen", email: "php3002@gmail.com", address: "Hau giang", numberPhone: "0382247620", birthday: "14/10/1987", gender: "Male", role: "user", available: true },
    { id: "00005", username: "Bhoang", email: "php3002@gmail.com", address: "Bac lieu", numberPhone: "0382247620", birthday: "14/09/1989", gender: "Male", role: "user", available: true },
    { id: "00006", username: "Ahoang", email: "php3002@gmail.com", address: "Ca mau", numberPhone: "0382247620", birthday: "14/08/1999", gender: "Male", role: "admin", available: false },

];

const AccountUser = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [edittingUser, setEditingUser] = useState(null);
    const openModal = (mode, user = null) => {
        if (mode === 'add') {
            setEditingUser(null);
        } else if (mode === 'update') {
            setEditingUser(user);
        }
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);
    const { Option } = Select;

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
                                <option>User role</option>
                                <option>Role</option>
                                <option>User</option>
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
                            <th className="p-3">Username</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Address</th>
                            <th className="p-3">NumberPhone</th>
                            <th className="p-3">Birthday</th>
                            <th className="p-3">Gender</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3">{user.username}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.address}</td>
                                <td className="p-3">{user.numberPhone}</td>
                                <td className="p-3">{user.birthday}</td>
                                <td className="p-3">{user.gender}</td>
                                <td className="p-3">{user.role}</td>
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
                            {edittingUser ? 'Update Account User' : 'Add Account User'}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="inputtext">
                        <label className='titleinput'>Number Phone</label>
                        <Input placeholder="Enter phone number"
                            value={edittingUser?.numberPhone || ''}
                            onChange={(e) => setEditingUser({ ...edittingUser, numberPhone: e.target.value })}
                        />
                    </div>
                    <div className="inputtext">
                        <label className='titleinput'>Email</label>
                        <Input type="email" placeholder="Enter email"
                            value={edittingUser?.email || ''}
                            onChange={(e) => setEditingUser({ ...edittingUser, email: e.target.value })}
                        />
                    </div>
                    <div className="inputtext">
                        <label className='titleinput'>Birthday</label>
                        <DatePicker style={{ width: '100%' }} defaultValue={moment()}
                            value={edittingUser?.birthday ? moment(edittingUser.birthday, 'DD/MM/YYYY') : null}
                            onChange={(date) => setEditingUser({ ...edittingUser, birthday: date.format('DD/MM/YYYY') })}
                        />
                    </div>
                    <div className="inputtext">
                        <label className='titleinput'>Gender</label>
                        <Select style={{ width: '100%' }} placeholder="Select gender">
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                        </Select>
                    </div>
                    <div className="inputtext">
                        <label className='titleinput'>Role</label>
                        <Select style={{ width: '100%' }} placeholder="Select role">
                            <Option value="user">User</Option>
                            <Option value="admin">Admin</Option>
                        </Select>
                    </div>
                    <div className="button-row">
                        <Button type="primary" block
                            onClick={() => {
                                console.log('Update user:', edittingUser);
                                closeModal();
                            }}>
                            Save
                        </Button>
                        <Button type="primary" onClick={closeModal} block>Cancel</Button>
                    </div>
                </Modal>
            </div>
        </div >
    );
};

export default AccountUser;