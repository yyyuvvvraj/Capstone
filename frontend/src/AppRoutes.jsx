import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

import MailApp from './pages/MailApp';
import DocsApp from './pages/DocsApp';

const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, token } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (roleRequired && user?.role !== roleRequired) return <Navigate to="/" replace />;
    return children;
};

const AppRoutes = () => {
    const { user, token } = useAuth();
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={!token ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin' : '/'} />} />
                
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<UserDashboard />} />
                    <Route path="/mail" element={<MailApp />} />
                    <Route path="/docs" element={<DocsApp />} />
                    
                    <Route path="/admin/*" element={
                        <ProtectedRoute roleRequired="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
