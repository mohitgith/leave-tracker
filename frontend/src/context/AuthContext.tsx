import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { loginUser } from '../services/api';

interface User {
    id: string;
    name: string;
    role: string;
    department: string;
    isManager: boolean;
    username?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inactivity timeout in milliseconds (15 minutes)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const idleTimerRef = useRef<any>(null);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    }, []);

    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        if (user) {
            idleTimerRef.current = setTimeout(() => {
                console.log('User inactive for 15 minutes, logging out...');
                logout();
                window.location.href = '/login';
            }, INACTIVITY_TIMEOUT);
        }
    }, [user, logout]);

    // Setup idle listeners
    useEffect(() => {
        if (!user) {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            return;
        }

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        const handleActivity = () => resetIdleTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));
        resetIdleTimer(); // Start timer

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
        };
    }, [user, resetIdleTimer]);

    // Restore session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const data = await loginUser({ username, password });

            if (data && data.accessToken) {
                const employee = data.user;
                // Check if manager (managerId is null or role contains MANAGER)
                const isManager = employee.managerId === null ||
                    (employee.role && employee.role.toUpperCase().includes('MANAGER'));

                const loggedInUser: User = {
                    id: employee.id,
                    name: employee.name,
                    role: employee.role,
                    department: employee.department,
                    username: employee.username,
                    isManager,
                };

                setUser(loggedInUser);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
                localStorage.setItem('token', data.accessToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            logout,
            loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
