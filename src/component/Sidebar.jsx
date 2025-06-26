import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FaTachometerAlt, FaUser, FaFlask, FaBell, FaBookOpen,
    FaUserCircle, FaBook, FaDumbbell, FaQuestionCircle,
    FaTasks, FaAward, FaUsers, FaCog, FaSignOutAlt, FaSitemap,
} from 'react-icons/fa';
import './Sidebar.css';

const Dashboard = () => {
    const location = useLocation();
    const activeItem = location.pathname;
    const { t } = useTranslation(['sidebar', 'common']);
    const darkMode = localStorage.getItem('darkMode') === 'true';

    const getIconClass = (path) => {
        return `sidebar-icon ${activeItem === path ? 'text-blue-600' : darkMode ? 'text-white' : 'text-black'}`;
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="sidebar-header">DashStack</div>
                <div className="sidebar-divider">
                    <a className="sidebar-a">Admin Pages</a>
                    <nav className="sidebar-nav">
                        <Link to="/dashboard" className={`sidebar-item ${activeItem === '/dashboard' ? 'active' : ''}`}>
                            <FaTachometerAlt className={getIconClass('/dashboard')} />
                            {t('dashboard')}
                        </Link>
                        <Link to="/account-user" className={`sidebar-item ${activeItem === '/account-user' ? 'active' : ''}`}>
                            <FaUser className={getIconClass('/account-user')} />
                            {t('accountUser')}
                        </Link>
                        <Link to="/testsystem" className={`sidebar-item ${activeItem === '/testsystem' ? 'active' : ''}`}>
                            <FaFlask className={getIconClass('/testsystem')} />
                            {t('testSystem')}
                        </Link>
                        <Link to="/notification" className={`sidebar-item ${activeItem === '/notification' ? 'active' : ''}`}>
                            <FaBell className={getIconClass('/notification')} />
                            {t('notification')}
                        </Link>
                        {/* <Link to="/completetask" className={`sidebar-item ${activeItem === '/completetask' ? 'active' : ''}`}>
                            <FaCheckCircle className={getIconClass('/completetask')} />
                            {t('completetask')}
                        </Link> */}
                        {/* <Link to="/completelesson" className={`sidebar-item ${activeItem === '/completelesson' ? 'active' : ''}`}>
                            <FaCheckCircle className={getIconClass('/completelesson')} />
                            {t('completelesson')}
                        </Link> */}
                        <Link to="/profile" className={`sidebar-item ${activeItem === '/profile' ? 'active' : ''}`}>
                            <FaUserCircle className={getIconClass('/profile')} />
                            {t('profile')}
                        </Link>

                        <div className="sidebar-divider"></div>
                        <a className="sidebar-a">User Pages</a>

                        <Link to="/lesson" className={`sidebar-item ${activeItem === '/lesson' ? 'active' : ''}`}>
                            <FaBook className={getIconClass('/lesson')} />
                            {t('lesson')}
                        </Link>
                        <Link to="/systemtask" className={`sidebar-item ${activeItem === '/systemtask' ? 'active' : ''}`}>
                            <FaTasks className={getIconClass('/systemtask')} />
                            {t('systemTasks')}
                        </Link>
                        <Link to="/rewards" className={`sidebar-item ${activeItem === '/rewards' ? 'active' : ''}`}>
                            <FaAward className={getIconClass('/rewards')} />
                            {t('reward')}
                        </Link>
                        <Link to="/pupil" className={`sidebar-item ${activeItem === '/pupil' ? 'active' : ''}`}>
                            <FaUsers className={getIconClass('/pupil')} />
                            {t('pupil')}
                        </Link>
                        <Link to="/level" className={`sidebar-item ${activeItem === '/level' ? 'active' : ''}`}>
                            <FaSitemap className={getIconClass('/level')} />
                            {t('level')}
                        </Link>
                        <div className="sidebar-divider"></div>
                        <a className="sidebar-a">Settings & Logout</a>

                        <Link to="/setting" className={`sidebar-item ${activeItem === '/setting' ? 'active' : ''}`}>
                            <FaCog className={getIconClass('/setting')} />
                            {t('setting')}
                        </Link>
                        <Link to="/logout" className={`sidebar-item ${activeItem === '/logout' ? 'active' : ''}`}>
                            <FaSignOutAlt className={getIconClass('/logout')} />
                            {t('logout')}
                        </Link>
                    </nav>
                </div>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;