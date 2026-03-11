import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || null);

    useEffect(() => {
        if (token) {
            // Rehydrate user from token (in a real app, you'd fetch /me or decode JWT safely)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ id: payload.userId, role: payload.role });
            } catch (e) {
                console.error("Token decode error", e);
                logout();
            }
        }
    }, [token]);

    const login = (newToken, newUser, newSessionId) => {
        setToken(newToken);
        setUser(newUser);
        setSessionId(newSessionId);
        localStorage.setItem('token', newToken);
        localStorage.setItem('sessionId', newSessionId);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setSessionId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
    };

    return (
        <AuthContext.Provider value={{ user, token, sessionId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
