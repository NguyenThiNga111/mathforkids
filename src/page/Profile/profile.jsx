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
    const { t, i18n } = useTranslation(['profile', 'common']);
    const { id } = useParams();
    const navigate = useNavigate();
    const userID = localStorage.getItem('userID');
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [userData, setUserData] = useState({});
    const [emailChanged, setEmailChanged] = useState(false);
    const { Option } = Select;

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/user/${userID}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (response.data) {
                    const { id, fullName, phoneNumber, email, gender, dateOfBirth, address, image } = response.data;
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
                        image: image || 'https://i.pravatar.cc/100',
                    });
                } else {
                    toast.error(t('fetchFailed', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language], {
                    position: 'top-right',
                    autoClose: 3000,
                });
                if (error.response?.status === 401) navigate('/login');
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
                const response = await api.patch(`/user/updateProfile/${userID}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (response.status === 200) {
                    toast.success(t('updateSuccess', { ns: 'common' }));
                    setUserData({ ...userData, ...response.data });
                } else {
                    toast.error(t('updateFailed', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language], {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } else {
            Object.values(errors).forEach((errorMsg) => {
                toast.error(errorMsg);
            });
        }
    };

    // Handle send OTP to old email
    const handleSendOTP = async () => {
        if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
            toast.error(t('emailInvalid'));
            return false;
        }
        try {
            const res = await api.post(`/auth/sendOtpByEmail/${userData.email}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.status === 200) {
                toast.success(t('otpSent'));
                setIsEmailModalVisible(false);
                setOtpModalVisible(true);
                return true;
            }
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
            return false;
        }
    };

    const handleVerifyOTP = async () => {
        console.log('handleVerifyOTP - userID:', userID);
        console.log('handleVerifyOTP - otpCode:', otpCode);
        console.log('handleVerifyOTP - newEmail:', newEmail);

        if (!otpCode) {
            toast.error(t('otpRequired'));
            return;
        }
        if (!userID) {
            toast.error(t('userIdRequired', { ns: 'common' }));
            return;
        }
        if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
            toast.error(t('emailInvalid'));
            return;
        }
        try {
            setIsVerifyingOTP(true);
            const res = await api.post(`/auth/verifyOTP/${userID}`, { otpCode }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            console.log('handleVerifyOTP - response:', res.data);
            if (res.data.message) {
                console.log("Sending update email request:", { newEmail, userID });
                const updateRes = await api.patch(`/user/updateEmail/${userID}`, { newEmail }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                console.log("Update email response:", updateRes.data);
                if (updateRes.status === 200) {
                    setUserData({ ...userData, email: newEmail });
                    setEmailChanged(true);
                    toast.success(updateRes.data.message[t('ns')] || t('updateSuccess', { ns: 'common' }));
                    setOtpModalVisible(false);
                    setOtpCode('');
                } else {
                    toast.error(updateRes.response?.data?.message?.[i18n.language], {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                }
            } else {
                toast.error(t('otpInvalid'));
            }
        } catch (err) {
            console.error('Verify OTP Error:', err.response?.data);
            toast.error(err.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
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
                            <img src={userData.image} alt="Avatar" className="avatar-img" />
                            <p className="upload-text">{t('uploadPhoto')}</p>
                        </div>
                        <div className="form-wrapper">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{t('fullName')}</label>
                                    <Input
                                        className="inputprofile"
                                        placeholder={t('enterFullName')}
                                        value={userData.fullName}
                                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('birthday')}</label>
                                    <DatePicker
                                        className="inputprofile"
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
                                        className="inputprofile"
                                        placeholder={t('enterAddress')}
                                        value={userData.address}
                                        onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('gender')}</label>
                                    <Select
                                        className="inputprofile"
                                        style={{ width: '100%', height: '50px' }}
                                        placeholder={t('selectionGender')}
                                        value={userData.gender || undefined}
                                        onChange={(value) => setUserData({ ...userData, gender: value })}
                                    >
                                        <Select.Option value="Male">{t('male')}</Select.Option>
                                        <Select.Option value="Female">{t('female')}</Select.Option>
                                    </Select>
                                </div>
                                <div className="form-group">
                                    <label>{t('email')}</label>
                                    <Input
                                        className="inputprofile"
                                        style={{
                                            height: '50px',
                                        }}
                                        placeholder={t('enterEmail')}
                                        value={userData.email}
                                        disabled
                                        suffix={
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => {
                                                    setNewEmail(userData.email);
                                                    setIsEmailModalVisible(true);
                                                }}
                                                disabled={emailChanged}
                                            >
                                                {t('change')}
                                            </Button>
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('phoneNumber')}</label>
                                    <Input
                                        className="inputprofile"
                                        placeholder={t('enterPhoneNumber')}
                                        value={userData.phoneNumber}
                                        disabled
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
                            }}
                            footer={null}
                            className="modal-content"
                        >
                            <Input
                                placeholder={t('enterNewEmail')}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                style={{ marginBottom: '10px' }}
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
                            className="modal-content"
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
                                <Button
                                    className="save-button"
                                    onClick={handleVerifyOTP}
                                    block
                                    loading={isVerifyingOTP}
                                >
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