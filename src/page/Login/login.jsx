import React, { useState } from 'react';
import './login.css';
import { Input, Button } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';

const Login = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['assessment', 'common']);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post(`/auth/sendOtpByEmail/${email}`);
            toast.success('Login successful. OTP sent!', {
                position: 'top-right',
                autoClose: 2000,
            });
            console.log("OPT nè: ", response.data);
            const userID = response.data.userId;
            console.log(userID);
            localStorage.setItem("userID", userID);
            localStorage.setItem("userEmail", email);
            navigate(`/verify`);


        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message?.[i18n.language], {
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className='forgotlabel'>
                                <label className='labellogin'></label>
                                <a href="/forgotpassword" className='forgotpassword'>ForgotPassword?</a>
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

export default Login;