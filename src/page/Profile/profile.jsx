import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal } from 'antd';
import { Imgs } from '../../assets/theme/images';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './profile.css';

const profile = () => {
    const { t, i18n } = useTranslation(['profile', 'common']);

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('profile')}</h1>
                <div className="flex justify-between items-center mb-4">
                    <div className="profile-card">
                        <div className="avatar-section">
                            <img
                                src="https://i.pravatar.cc/100" // Ảnh mặc định
                                alt="Avatar"
                                className="avatar-img"
                            />
                            <p className="upload-text">Upload Photo</p>
                        </div>
                        <div className="form-wrapper">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{t('fullName')}</label>
                                    <Input type="text" className='inputprofile' placeholder="Enter your first name" />
                                </div>
                                <div className="form-group">
                                    <label>{t('birthday')}</label>
                                    <Input type="text" className='inputprofile' placeholder="Choose birthday" />
                                </div>
                                <div className="form-group">
                                    <label>{t('email')}</label>
                                    <Input type="email" className='inputprofile' placeholder="Enter your email" />
                                </div>
                                <div className="form-group">
                                    <label>{t('phoneNumber')}</label>
                                    <Input type="tel" className='inputprofile' placeholder="Enter your phone number" />
                                </div>
                                <div className="form-group">
                                    <label>{t('address')}</label>
                                    <Input type="text" className='inputprofile' placeholder="Enter your address" />
                                </div>
                                <div className="form-group">
                                    <label>{t('gender')}</label>
                                    <select>
                                        <option value="male">{t('male')}</option>
                                        <option value="female">{t('female')}</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="btn-wrapper">
                            <button className="update-btn">{t('update', { ns: 'common' })}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default profile;