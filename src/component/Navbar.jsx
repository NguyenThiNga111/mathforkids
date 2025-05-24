import { useState, useEffect } from 'react';
import './Navbar.css'; // tạo file css riêng nếu cần
import { Imgs } from '../assets/theme/images'
import { useTranslation } from 'react-i18next';
import api from '../assets/api/Api';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [userName, setUserName] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(
        i18n.language === 'en' ? 'English' : 'Việt Nam'
    );
    const flagLanguage = {
        English: Imgs.English,
        'Việt Nam': Imgs.VietNam
    };
    useEffect(() => {
        fetchUserData();
    }, []);
    const fetchUserData = async () => {
        const userID = localStorage.getItem('userID');
        if (!userID) return;
        try {
            const response = await api.get(`/user/${userID}`);
            if (response.data) {
                setUserName(response.data.fullName || 'Admin');
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };
    const handleLanguage = (event) => {
        const selected = event.target.value;
        const newLang = selected === 'English' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
        setSelectedLanguage(selected);
    };

    return (
        <div className="navbar">
            <div className="navbar-left">
                <input type="text" className="search-bar" placeholder="Search" />
            </div>
            <div className="navbar-right">
                <div className="navbar-icon language">
                    <img
                        src={flagLanguage[selectedLanguage]}
                        alt={selectedLanguage}
                        className="flag"
                    />
                    <select onChange={handleLanguage} value={selectedLanguage}>
                        <option>English</option>
                        <option>Việt Nam</option>
                    </select>
                </div>
                <div className="navbar-user">
                    <img
                        src="https://i.pravatar.cc/100" // Ảnh mặc định
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
