import React, { useState } from 'react'
import './login.css'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Input, Select, Button } from 'antd';
import api from '../../assets/api/Api';
import { toast } from 'react-toastify';

const login = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post(`/auth/sendOTPByEmail/${email}`);
            toast.success("OTP sent successfully!", { position: 'top-right', autoClose: 2000 });

            // Lưu userId để xác thực OTP sau này
            const userId = response.data.userId;
            console.log("dhiesssd", userId);

            localStorage.setItem("userId", userId);

            // Điều hướng sang trang nhập OTP
            navigate('/verify');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    return (
        <div className='login'>
            <div className='wave'></div>
            <div className='containtlogin'>
                <h2 className='titlelogin'>Login as Admin</h2>
                <p className='subtitle'>Please enter your email and password to continue</p>
                <form onSubmit={handleLogin}>
                    <div className='contentlogin'>
                        <div>
                            <label className='labellogin'>Email address:</label>
                            <Input
                                className='inputlogin'
                                type='email'
                                placeholder='admin@gmail.com'
                                onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <div className='fotgotlabel'>
                                <label className='labellogin'></label>
                                <Link to="/forgotpassword" className='forgotpassword'>ForgotPassword?</Link>
                            </div>
                        </div>
                        <div className='buttonlogins'>
                            <Button className='buttonlogin' htmlType='submit'>
                                Login
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default login;