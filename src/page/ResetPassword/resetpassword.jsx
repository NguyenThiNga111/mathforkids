import React, { useState } from 'react'
import { Input, Button } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import './resetpassword.css';

const resetpassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setCongirmPassword] = useState('');
    const navigate = useNavigate();

    const handlePasswordReset = (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        toast.success('Password reset successfully');
        navigate('/verify');
    }

    return (
        <div className='login'>
            <div className='wave'></div>
            <div className='containtreset'>
                <h2 className='titlelogin'>New Password</h2>
                <p className='subtitle'>Please enter new password and confirm password to continue</p>
                <form onSubmit={handlePasswordReset}>
                    <div className='contentreset'>
                        <div>
                            <label className='labellogin'>New password:</label>
                            <Input
                                className='inputreset'
                                type='password'
                                placeholder='••••••••'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className='labellogin'>Confirm password:</label>
                            <Input
                                className='inputreset'
                                type='password'
                                placeholder='••••••••'
                                onChange={(e) => setCongirmPassword(e.target.value)}
                            />
                        </div>
                        <div className='buttonresets'>
                            <Button className='buttonreset' htmlType='submit'>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default resetpassword;