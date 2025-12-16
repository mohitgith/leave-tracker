import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';
import LeaveTrackerPage from './components/pages/LeaveTrackerPage';
import OrgChart from './components/employees/OrgChart';
import './App.css';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={
                        <div style={{ padding: 24 }}>
                            <h2>Dashboard View</h2>
                            <p>Work in progress. Please check specific modules.</p>
                        </div>
                    } />
                    <Route path="employees" element={<OrgChart />} />
                    <Route path="leave-tracker" element={<LeaveTrackerPage />} />
                    <Route path="settings" element={
                        <div style={{ padding: 24 }}>
                            <h2>Settings View</h2>
                            <p>Work in progress.</p>
                        </div>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
