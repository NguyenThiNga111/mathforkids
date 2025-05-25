import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal } from 'antd';
import { Imgs } from '../../assets/theme/images';
import { toast } from 'react-toastify';
import api from '../../assets/api/Api';
import { useTranslation } from 'react-i18next';
import { injectColorsToRoot, lightColors, darkColors } from '../../assets/theme/colors';
import './setting.css';

const setting = () => {
    const [language, setLanguage] = useState('Vietnamese');
    const [notification, setNotification] = useState(false);
    const { t, i18n } = useTranslation(['setting', 'common']);
    const userID = localStorage.getItem('userID');
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });
    useEffect(() => {
        injectColorsToRoot(darkMode ? darkColors : lightColors);

        const fetchUserSettings = async () => {
            try {
                const response = await api.get(`/user/${userID}`);
                const user = response.data;

                // Đặt theme từ API
                const isDark = user?.mode === 'dark';
                setDarkMode(isDark);
                localStorage.setItem('darkMode', JSON.stringify(isDark));
                injectColorsToRoot(isDark ? darkColors : lightColors);
            } catch (error) {
                toast.error(t('fetchFailed', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        };
        fetchUserSettings();
    }, [userID, t]);
    
    const handleDarkModeToggle = async () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
        injectColorsToRoot(newDarkMode ? darkColors : lightColors);

        // Gửi lên server nếu cần
        try {
            await api.put(`/user/${userID}`, {
                mode: newDarkMode ? 'dark' : 'light'
            });
        } catch (error) {
            toast.error(t('updateFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };
    const handleRestoreDefaults = () => {
        setLanguage('Vietnamese');
        setDarkMode(false);
        setNotification(false);
    };
    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('managementsetting')}</h1>
                <div className="flex justify-between items-center mb-4">
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-icon globe" />
                            <div className="setting-content">
                                <label>{t('language')}</label>
                                <p>{t('sublanguage')}</p>
                            </div>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="Vietnamese">{t('vietnam')}</option>
                                <option value="English">{t('english')}</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-icon moon" />
                            <div className="setting-content">
                                <label>{t('darkmode')}</label>
                                <p>{t('subdark')}</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={handleDarkModeToggle}
                                />
                                <span className="slider" />
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-icon bell" />
                            <div className="setting-content">
                                <label>{t('notification')}</label>
                                <p>{t('subnotification')}</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={notification} onChange={() => setNotification(!notification)} />
                                <span className="slider" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
export default setting;