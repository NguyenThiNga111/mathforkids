import { useState, useEffect } from 'react';
import './Navbar.css'; // tạo file css riêng nếu cần
import { Imgs } from '../assets/theme/images'
import { useTranslation } from 'react-i18next';
import api from '../assets/api/Api';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [userName, setUserName] = useState('');
    const [image, setImage] = useState('');

    const [userId, setUserID] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(
        i18n.language === 'en' ? 'English' : 'Tiếng Việt'
    );
    const flagLanguage = {
        English: Imgs.English,
        'Tiếng Việt': Imgs.VietNam
    };

    useEffect(() => {
        const storedUserId = localStorage.getItem('userID');
        setUserID(storedUserId);
        if (storedUserId) {
            fetchUserData(storedUserId);
        }
    }, []);

    const fetchUserData = async (id) => {
        try {
            const response = await api.get(`/user/${id}`);
            if (response.data) {
                setImage(response.data.image || "https://i.pravatar.cc/100")
                setUserName(response.data.fullName || 'Admin');
                const langCode = response.data.language || 'vi';
                i18n.changeLanguage(langCode);
                setSelectedLanguage(langCode === 'en' ? 'English' : 'Tiếng Việt');
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };
    const handleLanguage = async (event) => {
        const selected = event.target.value;
        const newLang = selected === 'English' ? 'en' : 'vi';

        i18n.changeLanguage(newLang);
        setSelectedLanguage(selected);
        if (userId) {
            try {
                await api.patch(`/user/updateProfile/${userId}`, { language: newLang });
                fetchUserData();
            } catch (error) {
                console.error('Failed to update language:', error);
            }
        }
    };

    return (
        <div className="navbar">

            <div className="navbar-right">
                <div className="navbar-icon language">
                    <img
                        src={flagLanguage[selectedLanguage]}
                        alt={selectedLanguage}
                        className="flag"
                    />
                    <select onChange={handleLanguage} value={selectedLanguage}>
                        <option>English</option>
                        <option>Tiếng Việt</option>
                    </select>
                </div>
                <div className="navbar-user">
                    <img
                        src={image}
                        alt="Avatar"
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;