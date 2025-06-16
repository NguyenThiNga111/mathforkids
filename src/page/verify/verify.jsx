import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import './Verify.css';
import { toast } from 'react-toastify';
import api from '../../assets/api/Api';

const Verify = () => {
    const [otp, setOtp] = useState(new Array(4).fill(''));
    const navigate = useNavigate();
    const userID = localStorage.getItem("userID");
    console.log(userID);
    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 3) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').trim();
        if (/^\d{4}$/.test(paste)) {
            setOtp(paste.split(''));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-input-${index - 1}`).focus();
        }
    };

    const handleVerify = async () => {
        const enteredOTP = otp.join('');
        if (enteredOTP.length !== 4) {
            toast.error('Please enter all 4 digits');
            return;
        }

        try {
            const response = await api.post(`/auth/verifyAndAuthentication/${userID}`, {
                otpCode: enteredOTP
            });

            if (response.data) {
                const { role, token } = response.data;

                if (role === 'admin') {
                    localStorage.setItem('token', token);
                    toast.success('OTP verified successfully!');
                    navigate('/');
                } else if (role === 'user') {
                    toast.error('Access denied: Only admins can proceed.');
                    // Stay on the verify page, no navigation
                } else {
                    toast.error('Invalid role. Please contact support.');
                }
            } else {
                toast.error('Invalid OTP. Please try again.');
            }
        } catch (error) {
            toast.error('Verification failed. Please try again.');
        }
    };

    return (
        <div className="login">
            <div className="wave"></div>
            {/* <div className="back-button" onClick={handleBack}>←</div> */}
            <div className="containtverify">
                <h2 className="titlelogin">Verification OTP</h2>
                <p className="subtitle">Please enter the 4-digit code sent to your email</p>

                <div className="contentverify">
                    <div className="otp-container">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                id={`otp-input-${index}`}
                                className="otp-input"
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onPaste={handlePaste}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                    </div>
                    <div className='buttonverifys'>
                        <Button className="buttonverify" onClick={handleVerify}>Verify</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verify;