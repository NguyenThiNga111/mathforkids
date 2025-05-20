import React, { useState } from 'react';
import './accountuser.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Select, Modal, DatePicker, message } from 'antd';
import moment from 'moment';
import { Imgs } from "../../assets/theme/images";
import { toast } from 'react-toastify';
const usersData = [
    { id: "00001", username: "Anguyen", email: "php3002@gmail.com", address: "Ca mau", numberPhone: "0382247620", birthday: "14/05/1985", gender: "Male", role: "user" },
    { id: "00002", username: "Bnguyen", email: "php3002@gmail.com", address: "Can tho", numberPhone: "0382247620", birthday: "12/03/1999", gender: "Male", role: "user" },
    { id: "00003", username: "Cnguyen", email: "php3002@gmail.com", address: "Vinh long", numberPhone: "0382247620", birthday: "12/02/1990", gender: "Male", role: "user" },
    { id: "00004", username: "Dnguyen", email: "php3002@gmail.com", address: "Hau giang", numberPhone: "0382247620", birthday: "14/10/1987", gender: "Male", role: "user" },
    { id: "00005", username: "Bhoang", email: "php3002@gmail.com", address: "Bac lieu", numberPhone: "0382247620", birthday: "14/09/1989", gender: "Male", role: "user" },
    { id: "00006", username: "Ahoang", email: "php3002@gmail.com", address: "Ca mau", numberPhone: "0382247620", birthday: "14/08/1999", gender: "Male", role: "admin" },
    { id: "00004", username: "Dnguyen", email: "php3002@gmail.com", address: "Hau giang", numberPhone: "0382247620", birthday: "14/10/1987", gender: "Male", role: "user" },
    { id: "00005", username: "Bhoang", email: "php3002@gmail.com", address: "Bac lieu", numberPhone: "0382247620", birthday: "14/09/1989", gender: "Male", role: "user" },
    { id: "00006", username: "Ahoang", email: "php3002@gmail.com", address: "Ca mau", numberPhone: "0382247620", birthday: "14/08/1999", gender: "Male", role: "admin" },

];

const AccountUser = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [edittingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [errors, setErrors] = useState({});
    const { Option } = Select;

    const userPerPage = 6;
    const indexOfLastUser = currentPage * userPerPage;
    const indexOfFirtsUser = indexOfLastUser - userPerPage;
    const currentUsers = usersData.slice(indexOfFirtsUser, indexOfLastUser);
    const totalPage = Math.ceil(usersData.length / userPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openModal = (mode, user = null) => {
        if (mode === 'add') {
            setEditingUser(null);
        } else if (mode === 'update') {
            setEditingUser(user);
        }
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    const validateForm = () => {
        const newErrors = {};
        if (!edittingUser?.numberPhone || !/^\d{10}$/.test(edittingUser.numberPhone)) {
            newErrors.numberPhone = 'Invalid phone number 10 digits';
        }
        if (!edittingUser?.email || !/\S+@\S+.\S+/.test(edittingUser.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!edittingUser?.birthday || edittingUser.birthday === '') {
            newErrors.birthday = 'Invalid birthday';
        }
        if (!edittingUser?.gender || edittingUser.gender === '') {
            newErrors.gender = 'Invalid gender';
        }
        if (!edittingUser?.role || edittingUser.role === '') {
            newErrors.role = 'Invalid role'
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSave = () => {
        if (validateForm()) {
            if (edittingUser?.id) {
                toast.success('Update Successful', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } else {
                toast.success('Add Successful', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }

            closeModal();
        } else {
            toast.error('Validation failed', {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    }
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
                                    <svg
                                        className="iconfilter"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                </span>
                                <button className="filter-text">
                                    Filter By
                                </button>
                                <select className="filter-dropdown">
                                    <option>Role User</option>
                                    <option>User</option>
                                    <option>Admin</option>
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
                            className="bg-blue-500 text-white px-4 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + Add new
                        </button>
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
                        {currentUsers.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3">{user.username}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.address}</td>
                                <td className="p-3">{user.numberPhone}</td>
                                <td className="p-3">{user.birthday}</td>
                                <td className="p-3">{user.gender}</td>
                                <td className="p-3">{user.role}</td>
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
                            {edittingUser ? 'Update Account User' : 'Add Account User'}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className='form-content'>
                        <div className="inputtext">
                            <label className='titleinput'>Number Phone</label>
                            <Input
                                placeholder="Enter phone number"
                                value={edittingUser?.numberPhone || ''}
                                onChange={(e) => setEditingUser({ ...edittingUser, numberPhone: e.target.value })}
                            />
                            {errors.numberPhone && <div className="error-text">{errors.numberPhone}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>Email</label>
                            <Input
                                type="email"
                                placeholder="Enter email"
                                value={edittingUser?.email || ''}
                                onChange={(e) => setEditingUser({ ...edittingUser, email: e.target.value })}
                            />
                            {errors.email && <div className="error-text">{errors.email}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>Birthday</label>
                            <DatePicker
                                style={{ width: '100%', height: '50px' }}
                                defaultValue={moment()}
                                value={edittingUser?.birthday ? moment(edittingUser.birthday, 'DD/MM/YYYY') : null}
                                onChange={(date) => setEditingUser({ ...edittingUser, birthday: date.format('DD/MM/YYYY') })}
                            />
                            {errors.birthday && <div className="error-text">{errors.birthday}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>Gender</label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder="Select gender"
                                value={edittingUser?.gender || undefined}
                                onChange={(value) => setEditingUser({ ...edittingUser, gender: value })}
                            >
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                            </Select>
                            {errors.gender && <div className="error-text">{errors.gender}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>Role</label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder="Select role"
                                value={edittingUser?.role || undefined}
                                onChange={(value) => setEditingUser({ ...edittingUser, role: value })}
                            >
                                <Option value="user">User</Option>
                                <Option value="admin">Admin</Option>
                            </Select>
                            {errors.role && <div className="error-text">{errors.role}</div>}
                        </div>
                    </div>
                    <div className="button-row">
                        <Button
                            type="primary"
                            onClick={handleSave}
                            block>
                            Save
                        </Button>
                        <Button
                            type="primary"
                            onClick={closeModal}
                            block>
                            Cancel
                        </Button>
                    </div>
                </Modal>
            </div>
        </div >
    );
};

export default AccountUser;