import React, { useState } from 'react';
import './Navbar.css'; // tạo file css riêng nếu cần
import { Imgs } from '../assets/theme/images'

const Navbar = () => {
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const flagLanguage = {
        English: Imgs.English,
        'Việt Nam': Imgs.VietNam
    };
    const handleLanguage = (event) => {
        setSelectedLanguage(event.target.value);
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
                    <img src={Imgs.avatar} alt="User" className="user-avatar" />
                    <div className="user-info">
                        <span className="user-name">Phuc Hoang</span>
                        <span className="user-role">Admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
