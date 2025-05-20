import React, { useState } from 'react'
import './login.css'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Input, Select, Button } from 'antd';
import { toast } from 'react-toastify';

const login = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'admin123@gmail.com') {
            toast.success('Login successful', {
                position: 'top-right',
                autoClose: 2000,
            });
            navigate('/verify');
        } else {
            toast.error('Login Fail', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    }

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