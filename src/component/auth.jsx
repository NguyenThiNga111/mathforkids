import { Navigate, Outlet } from 'react-router-dom';

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        return !isExpired;
    } catch (error) {
        console.error('Invalid token format:', error);
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
