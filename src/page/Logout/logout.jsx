import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../assets/api/Api';
import { toast } from 'react-toastify';

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.get('/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('userID');
            toast.success('Logged out successfully!');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed. Please try again.');
        }
    };

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Logout;