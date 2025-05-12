import { React } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Imgs } from '../assets/theme/images'
import './Sidebar.css';

const Dashboard = () => {
    const location = useLocation();
    const activeItem = location.pathname;

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="sidebar-header">DashStack</div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`sidebar-item ${activeItem === '/dashboard' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/dashboard' ? Imgs.dashboardBlue : Imgs.dashboardWhite}
                            alt="Dashboard"
                            className="sidebar-icon"
                        /> Dashboard
                    </Link>
                    <Link to="/account-user" className={`sidebar-item ${activeItem === '/account-user' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/account-user' ? Imgs.accountUserBlue : Imgs.accountUserWhite}
                            alt="accountuser"
                            className="sidebar-icon"
                        /> Account User
                    </Link>
                    <Link to="/testsystem" className={`sidebar-item ${activeItem === '/test-system' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/test-system' ? Imgs.testSystemblue : Imgs.testSystemwhite}
                            alt="testsystem"
                            className="sidebar-icon"
                        /> Test System
                    </Link>
                    <Link to="/system-tasks" className={`sidebar-item ${activeItem === '/system-tasks' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/system-tasks' ? Imgs.systemTaskBlue : Imgs.systemTaskWhite}
                            alt="system-tasks"
                            className="sidebar-icon"
                        /> System Tasks
                    </Link>

                    <Link to="/notification" className={`sidebar-item ${activeItem === '/notification' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/notification' ? Imgs.notificationBlue : Imgs.notificationWhite}
                            alt="notification"
                            className="sidebar-icon"
                        /> Notification
                    </Link>
                    <Link to="/profile" className={`sidebar-item ${activeItem === '/profile' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/profile' ? Imgs.profileBlue : Imgs.profileWhite}
                            alt="profile"
                            className="sidebar-icon"
                        /> Profile
                    </Link>

                    <div className="sidebar-divider"></div>
                    <a className="sidebar-a">page</a>

                    <Link to="/lesson" className={`sidebar-item ${activeItem === '/lesson' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/lesson' ? Imgs.lessonBlue : Imgs.lessonWhite}
                            alt="lesson"
                            className="sidebar-icon"
                        /> Lesson
                    </Link>
                    <Link to="/exercise" className={`sidebar-item ${activeItem === '/exercise' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/exercise' ? Imgs.exerciseBlue : Imgs.exerciseWhite}
                            alt="exercise"
                            className="sidebar-icon"
                        /> Exercise
                    </Link>
                    <Link to="/question" className={`sidebar-item ${activeItem === '/question' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/question' ? Imgs.questionBlue : Imgs.questionWhite}
                            alt="question"
                            className="sidebar-icon"
                        /> Question
                    </Link>
                    <Link to="/question-test" className={`sidebar-item ${activeItem === '/question-test' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/question-test' ? Imgs.questionTestBlue : Imgs.questionTestWhite}
                            alt="question-test"
                            className="sidebar-icon"
                        /> Question Test
                    </Link>

                    <Link to="/rewards" className={`sidebar-item ${activeItem === '/rewards' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/rewards' ? Imgs.rewardBlue : Imgs.rewardWhite}
                            alt="rewards"
                            className="sidebar-icon"
                        /> Rewards
                    </Link>
                    <Link to="/contact" className={`sidebar-item ${activeItem === '/contact' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/contact' ? Imgs.contactBlue : Imgs.contactWhite}
                            alt="contact"
                            className="sidebar-icon"
                        /> Contact
                    </Link>

                    <div className="sidebar-divider"></div>

                    <Link to="/setting" className={`sidebar-item ${activeItem === '/setting' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/setting' ? Imgs.settingBlue : Imgs.settingWhite}
                            alt="setting"
                            className="sidebar-icon"
                        /> Setting
                    </Link>
                    <Link to="/logout" className={`sidebar-item ${activeItem === '/logout' ? 'active' : ''}`}>
                        <img
                            src={activeItem === '/logout' ? Imgs.logoutWhite : Imgs.logoutWhite}
                            alt="logout"
                            className="sidebar-icon"
                        /> Logout
                    </Link>
                </nav>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;