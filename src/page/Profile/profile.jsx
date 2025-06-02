import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../component/Navbar';
import { Input, Button, Select, Modal, DatePicker } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import './profile.css';

const Profile = () => {
    const { t } = useTranslation(['profile', 'common']);
    const { id } = useParams();
    const navigate = useNavigate();
    const userID = localStorage.getItem('userID');
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState(''); // Thêm ô xác nhận email
    const [userData, setUserData] = useState({});
    const { Option } = Select;

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/user/${userID}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (response.data) {
                    const { id, fullName, phoneNumber, email, gender, dateOfBirth, address, avatar } = response.data;
                    let formattedDOB = '';
                    if (dateOfBirth?.seconds) {
                        formattedDOB = moment(dateOfBirth.seconds * 1000).format('YYYY-MM-DD');
                    } else if (typeof dateOfBirth === 'string') {
                        formattedDOB = moment(dateOfBirth).isValid() ? moment(dateOfBirth).format('YYYY-MM-DD') : '';
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
                    toast.error(t('fetchFailed', { ns: 'common' }));
                }
            } catch (error) {
                toast.error(error.response?.data?.message || t('fetchFailed', { ns: 'common' }));
                if (error.response?.status === 401) navigate('/login');
            }
        };
        fetchUserData();
    }, [userID, id, navigate, t]);

    // Validate form fields
    // Validate form fields - trả về đối tượng lỗi chi tiết
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
                if (age < 20) {
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
        return newErrors;
    };

    // Handle profile update
    const handleUpdate = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            try {
                const payload = {
                    fullName: userData.fullName,
                    phoneNumber: userData.phoneNumber,
                    email: userData.email,
                    gender: userData.gender,
                    dateOfBirth: userData.dateOfBirth,
                    address: userData.address,
                };
                const response = await api.put(`/user/${userID}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (response.status === 200) {
                    toast.success(t('updateSuccess', { ns: 'common' }));
                    setUserData({ ...userData, ...response.data });
                } else {
                    toast.error(t('updateFailed', { ns: 'common' }));
                }
            } catch (error) {
                toast.error(error.response?.data?.message || t('updateFailed', { ns: 'common' }));
            }
        } else {
            Object.values(errors).forEach((errorMsg) => {
                toast.error(errorMsg);
            });
        }
    };

    // Handle send OTP
    const handleSendOTP = async () => {
        if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
            toast.error(t('emailInvalid'));
            return false;
        }
        if (newEmail !== confirmEmail) {
            toast.error(t('emailsDoNotMatch'));
            return false;
        }
        try {
            const res = await api.post(`/auth/sendOTPByEmailChange/${newEmail}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.status === 200) {
                toast.success(t('otpSent'));
                setIsEmailModalVisible(false);
                setOtpModalVisible(true);
                return true;
            }
            toast.error(res.data?.message || t('updateFailed', { ns: 'common' }));
            return false;
        } catch (err) {
            toast.error(err.response?.data?.message || t('updateFailed', { ns: 'common' }));
            return false;
        }
    };

    // Handle OTP verification
    const handleVerifyOTP = async () => {
        if (!otpCode) {
            toast.error(t('otpRequired'));
            return;
        }
        try {
            setIsVerifyingOTP(true);
            const res = await api.post(`/auth/verifyOTP`, { email: newEmail, otp: otpCode }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.data.success) {
                const updateRes = await api.put(`/user/${userID}`, { ...userData, email: newEmail }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (updateRes.status === 200) {
                    setUserData({ ...userData, email: newEmail });
                    toast.success(t('updateSuccess', { ns: 'common' }));
                    setOtpModalVisible(false);
                    setOtpCode('');
                } else {
                    toast.error(updateRes.data?.message || t('updateFailed', { ns: 'common' }));
                }
            } else {
                toast.error(res.data?.message || t('otpInvalid'));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t('otpInvalid'));
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    return (
        <div className="containers">
            <Navbar />
            <h1 className="container-title">{t('profile')}</h1>
            <div className="profile-container">
                <div className="flex justify-between items-center mb-4">
                    <div className="profile-card">
                        <div className="avatar-section">
                            <img src={userData.avatar} alt="Avatar" className="avatar-img" />
                            <p className="upload-text">Upload Photo</p>
                        </div>
                        <div className="form-wrapper">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{t('fullName')}</label>
                                    <Input
                                        type="text"
                                        className="inputprofile"
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
                                        value={userData.dateOfBirth ? moment(userData.dateOfBirth, 'YYYY-MM-DD') : null}
                                        onChange={(date) =>
                                            setUserData({
                                                ...userData,
                                                dateOfBirth: date ? date.format('YYYY-MM-DD') : '',
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('address')}</label>
                                    <Input
                                        type="text"
                                        className="inputprofile"
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
                                        style={{ height: '50px' }}
                                        placeholder={t('enterEmail')}
                                        value={userData.email}
                                        readOnly
                                        suffix={
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => {
                                                    setNewEmail(userData.email);
                                                    setConfirmEmail(userData.email);
                                                    setIsEmailModalVisible(true);
                                                }}
                                            >
                                                {t('change')}
                                            </Button>
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('phoneNumber')}</label>
                                    <Input
                                        type="tel"
                                        className="inputprofile"
                                        placeholder={t('enterPhoneNumber')}
                                        value={userData.phoneNumber}
                                        onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <Modal
                            title={
                                <div style={{ textAlign: 'center', fontSize: '24px' }}>
                                    {t('changeEmail')}
                                </div>
                            }
                            open={isEmailModalVisible}
                            onCancel={() => {
                                setIsEmailModalVisible(false);
                                setNewEmail('');
                                setConfirmEmail('');
                            }}
                            footer={null}
                            className='modal-content'
                        >
                            <Input
                                placeholder={t('enterNewEmail')}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            />
                            <Input
                                placeholder={t('confirmNewEmail')}
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                            />
                            <div className="button-row">
                                <Button className="save-button" onClick={handleSendOTP} block>
                                    {t('change')}
                                </Button>
                            </div>
                        </Modal>
                        <Modal
                            title={
                                <div style={{ textAlign: 'center', fontSize: '24px' }}>
                                    {t('verifyOTP')}
                                </div>
                            }
                            open={otpModalVisible}
                            footer={null}
                            onCancel={() => {
                                setOtpModalVisible(false);
                                setOtpCode('');
                            }}
                            className='modal-content'

                        >
                            <Input
                                placeholder={t('enterOTP')}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                            />
                            <div className="button-row">
                                <Button className="save-button" onClick={handleSendOTP} block>
                                    {t('resendOTP')}
                                </Button>
                                <Button className="save-button" onClick={handleVerifyOTP} block>
                                    {t('verify')}
                                </Button>
                            </div>
                        </Modal>

                        <div className="btn-wrapper">
                            <Button className="update-btn" onClick={handleUpdate}>
                                {t('update', { ns: 'common' })}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;