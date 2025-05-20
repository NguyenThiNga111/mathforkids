import React, { useState } from 'react'
import { Input, Button } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './forgotpassword.css';

const forgotpassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleForgot = (e) => {
        e.preventDefault();
        if (email === 'admin123@gmail.com') {
            toast.success('Confirmed successfully', {
                position: 'top-right',
                autoClose: 1000,
            });
            navigate('/resetpassword');
        } else {
            toast.error('Confirmed Fail', {
                position: 'top-right',
                autoClose: 1000,
            });

        }
    }
    return (
        <div className='login'>
            <div className='wave'></div>
            <div className='containtforgot'>
                <h2 className='titlelogin'>Forgot Password</h2>
                <p className='subtitle'>Please enter email to password</p>
                <form onSubmit={handleForgot}>
                    <div className='contentforgot'>
                        <div>
                            <label className='labellogin'>Email address:</label>
                            <Input
                                className='inputlogin'
                                type='email'
                                placeholder='admin@gmail.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className='buttonforgots'>
                            <Button className='buttonforgot' htmlType='submit'>Continue</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default forgotpassword;