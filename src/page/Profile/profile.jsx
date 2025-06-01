import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal, DatePicker } from 'antd';
import moment from 'moment';
import { Imgs } from '../../assets/theme/images';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './profile.css';

const profile = () => {
    const { t, i18n } = useTranslation(['profile', 'common']);
    const { id } = useParams(); // Get userID from URL params
    const navigate = useNavigate();
    const userID = localStorage.getItem('userID'); // Get userID from localStorage
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);
    const { Option } = Select;
    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/user/${userID}`);
                console.log("đư", response.data);
                if (response.data) {
                    const { id, fullName, phoneNumber, email, gender, dateOfBirth, address, avatar } = response.data;
                    let formattedDOB = '';
                    if (dateOfBirth?.seconds) {
                        // Handle Firebase timestamp
                        formattedDOB = moment(dateOfBirth.seconds * 1000).format('YYYY/MM/DD');
                    } else if (typeof dateOfBirth === 'string') {
                        // Handle string date
                        formattedDOB = moment(dateOfBirth).isValid() ? moment(dateOfBirth).format('YYYY/MM/DD') : '';
                    }
                    setUserData({
                        id: id || '',
                        fullName: fullName || '',
                        phoneNumber: phoneNumber || '',
                        email: email || '',
                        gender: gender || '',
                        dateOfBirth: formattedDOB,
                        address: address || '',
                        avatar: avatar || 'https://i.pravatar.cc/100',
                    });
                } else {
                    toast.error(t('fetchFailed', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
            } catch (error) {
                toast.error(t('fetchFailed', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [userID, id, navigate, t]);

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!userData.phoneNumber || !/^\d{10}$/.test(userData.phoneNumber)) {
            newErrors.phoneNumber = t('numberPhoneRequired');
        }
        if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = t('emailRequired');
        }
        if (!userData.dateOfBirth || userData.dateOfBirth === '') {
            newErrors.dateOfBirth = t('dateOfBirthRequired');
        } else {
            const dob = new Date(userData.dateOfBirth);
            const now = new Date();
            if (dob > now) {
                newErrors.dateOfBirth = t('dateOfBirthdodRequired');
            } else {
                const ageDifMs = now - dob;
                const ageDate = new Date(ageDifMs);
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                if (age < 10) {
                    newErrors.dateOfBirth = t('dateOfBirtholdRequired');
                }
            }
        }
        if (!userData.address || userData.address === '') {
            newErrors.address = t('addressRequired');
        }
        if (!userData.fullName || userData.fullName === '') {
            newErrors.fullName = t('fullNameRequired');
        }
        if (!userData.gender || userData.gender === '') {
            newErrors.gender = t('genderRequired');
        }
        // setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle profile update
    const handleUpdate = async () => {
        if (validateForm()) {
            try {
                const payload = {
                    fullName: userData.fullName,
                    phoneNumber: userData.phoneNumber,
                    email: userData.email,
                    gender: userData.gender,
                    dateOfBirth: userData.dateOfBirth, // Ensure backend accepts YYYY-MM-DD
                    address: userData.address,
                    // Include avatar if your API supports it
                    // avatar: userData.avatar,
                };
                console.log('Update payload:', payload);
                const response = await api.put(`/user/${userID}`, payload);
                console.log('Update response:', response.data);

                // Adjust based on your API's response structure
                if (response.status === 200 || response.data) {
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                    // Optionally update local state with response data
                    setUserData({ ...userData, ...response.data });
                } else {
                    toast.error(t('updateFailed', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
            } catch (error) {
                toast.error(t('updateFailed', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        } else {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    // Handle avatar upload (placeholder)
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUserData({ ...userData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return <div>{t('loading', { ns: 'common' })}</div>;
    }
    return (
        <div className="containers">
            <Navbar />
            <h1 className="container-title">{t('profile')}</h1>
            <div className="profile-container">
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
                                    <Input
                                        type="text"
                                        className='inputprofile'
                                        placeholder={t('enterFullName')}
                                        value={userData.fullName}
                                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('birthday')}</label>
                                    <DatePicker
                                        placeholder={t('inputDateOfBirth')}
                                        style={{ width: '100%', height: '50px' }}
                                        value={userData.dateOfBirth ? moment(userData.dateOfBirth, 'YYYY/MM/DD') : null}
                                        onChange={(date) =>
                                            setUserData({
                                                ...userData,
                                                dateOfBirth: date.format('YYYY/MM/DD')
                                            })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('address')}</label>
                                    <Input
                                        type="text"
                                        className='inputprofile'
                                        placeholder={t('enterAddress')}
                                        value={userData.address}
                                        onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('gender')}</label>
                                    <Select
                                        style={{ width: '100%', height: '50px' }}
                                        placeholder={t('selectionGender')}
                                        value={userData.gender || undefined}
                                        onChange={(value) => setUserData({ ...userData, gender: value })}
                                    >
                                        <Option value="Male">{t('male')}</Option>
                                        <Option value="Female">{t('female')}</Option>
                                    </Select>
                                </div>
                                <div className="form-group">
                                    <label>{t('email')}</label>
                                    <Input
                                        type="email"
                                        className='inputprofile'
                                        placeholder={t('enterEmail')}
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('phoneNumber')}</label>
                                    <Input
                                        type="tel"
                                        className='inputprofile'
                                        placeholder={t('enterPhoneNumber')}
                                        value={userData.phoneNumber}
                                        onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="btn-wrapper">
                            <Button className="update-btn" onClick={handleUpdate}>
                                {t('update', { ns: 'common' })}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default profile;