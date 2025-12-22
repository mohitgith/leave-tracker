import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchEmployees, EmployeeAPI } from '../services/api';

interface User {
    id: string;
    name: string;
    role: string;
    department: string;
    isManager: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate username from employee name (e.g., "Lohit Ganta" -> "lohitg")
const generateUsername = (name: string): string => {
    const parts = name.toLowerCase().split(' ');
    if (parts.length >= 2) {
        return parts[0] + parts[parts.length - 1].charAt(0);
    }
    return parts[0];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const employees = await fetchEmployees();
            
            // Find employee whose generated username matches
            const employee = employees.find((emp: EmployeeAPI) => {
                const expectedUsername = generateUsername(emp.name);
                return expectedUsername === username.toLowerCase() && password.toLowerCase() === username.toLowerCase();
            });

            if (employee) {
                // Check if manager (managerId is null or role contains MANAGER)
                const isManager = employee.managerId === null || 
                    employee.role.toUpperCase().includes('MANAGER');
                
                const loggedInUser: User = {
                    id: employee.id,
                    name: employee.name,
                    role: employee.role,
                    department: employee.department,
                    isManager,
                };

                setUser(loggedInUser);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
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
