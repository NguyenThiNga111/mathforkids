import { Navigate, Outlet } from 'react-router-dom';

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload); // In payload để kiểm tra
        console.log('exp (Unix timestamp):', payload.exp);
        console.log('exp (Date):', new Date(payload.exp * 1000));
        console.log('Current time:', new Date(Date.now()));
        if (!payload.exp) {
            localStorage.removeItem('token');
            return false;
        }
        const isExpired = payload.exp * 1000 < Date.now();
        return !isExpired;
    } catch (error) {
        console.error('Token không hợp lệ:', error);
        localStorage.removeItem('token');
        return false;
    }
};

const PrivateRoute = () => {
    const authenticated = isAuthenticated();

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

export default PrivateRoute;
