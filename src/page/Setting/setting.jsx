import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal } from 'antd';
import { Imgs } from '../../assets/theme/images';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import { injectColorsToRoot, lightColors, darkColors } from '../../assets/theme/colors';

import './setting.css';

const setting = () => {
    const [language, setLanguage] = useState('Vietnamese');
    const [darkMode, setDarkMode] = useState(false);
    const [notification, setNotification] = useState(false);

    const handleRestoreDefaults = () => {
        setLanguage('Vietnamese');
        setDarkMode(false);
        setNotification(false);
    };
    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">adas</h1>
                <div className="flex justify-between items-center mb-4">
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-icon globe" />
                            <div className="setting-content">
                                <label>Language</label>
                                <p>Select Vietnamese/English</p>
                            </div>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="Vietnamese">Vietnamese</option>
                                <option value="English">English</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-icon moon" />
                            <div className="setting-content">
                                <label>Dark Mod</label>
                                <p>Turn on light/dark mode</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={() => {
                                        const newDarkMode = !darkMode;
                                        setDarkMode(newDarkMode);
                                        localStorage.setItem('darkMode', newDarkMode);
                                        if (newDarkMode) {
                                            injectColorsToRoot(darkColors);
                                        } else {
                                            injectColorsToRoot(lightColors);
                                        }
                                    }} />
                                <span className="slider" />
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-icon bell" />
                            <div className="setting-content">
                                <label>Notification</label>
                                <p>Turn on/off notification mode</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={notification} onChange={() => setNotification(!notification)} />
                                <span className="slider" />
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-icon lock" />
                            <div className="setting-content">
                                <label>Security</label>
                                <p>Change account protection password</p>
                            </div>
                            <button className="edit-btn">✎</button>
                        </div>

                        <div className="button-group">
                            <button className="save-btn">Save</button>
                            <button className="restore-btn" onClick={handleRestoreDefaults}>Restore defaults</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
export default setting;