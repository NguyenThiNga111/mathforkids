import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Imgs } from '../../assets/theme/images';
import { useTranslation } from 'react-i18next';

import api from '../../assets/api/Api';

import './Verify.css';

const verify = () => {
    const [otp, setOtp] = useState(new Array(4).fill(''));
    const navigate = useNavigate(); // Khởi tạo useNavigate

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^[0-9]?$/.test(value)) { // Chỉ cho phép số, tối đa 1 ký tự
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Tự động focus ô tiếp theo nếu đã nhập số
            if (value && index < 3) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').trim();
        if (/^\d{4}$/.test(paste)) { // Kiểm tra nếu là 6 số
            setOtp(paste.split(''));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-input-${index - 1}`).focus();
        }
    };
    const handleBack = () => {
        navigate(-1); // Sử dụng navigate(-1) để quay lại trang trước
    };
    const handleVerify = async () => {
        const userId = localStorage.getItem("userId");
        const enteredOtp = otp.join('');

        if (enteredOtp.length < 4) {
            toast.warning("Please enter the full 4-digit OTP.", { autoClose: 2000 });
            return;
        }
        console.log("dhied", userId);
        try {
            const response = await api.post(`/auth/verify/${userId}`, { otp: enteredOtp });
            toast.success("OTP verified successfully!", { autoClose: 2000 });

            // Chuyển về dashboard nếu thành công
            navigate("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "OTP verification failed", {
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="login">
            <div className="wave"></div>
            <div className="back-button" onClick={handleBack}>
                ←
            </div>
            <div className="containtverify">
                <h2 className="titlelogin">Verification OTP</h2>
                <p className="subtitle">Please enter the 6-digit code sent to your email</p>

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

export default verify;