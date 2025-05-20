import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Verify.css';

const verify = () => {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const navigate = useNavigate(); // Khởi tạo useNavigate

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^[0-9]?$/.test(value)) { // Chỉ cho phép số, tối đa 1 ký tự
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Tự động focus ô tiếp theo nếu đã nhập số
            if (value && index < 5) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(paste)) { // Kiểm tra nếu là 6 số
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
                        <Button className="buttonverify">Verify</Button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default verify;