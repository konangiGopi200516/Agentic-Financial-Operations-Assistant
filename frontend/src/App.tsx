import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { Transactions } from './pages/Transactions';
import { Approvals } from './pages/Approvals';
import { AuditLogs } from './pages/AuditLogs';
import { FraudDetection } from './pages/FraudDetection';
import { PaymentAgent } from './pages/PaymentAgent';
import { AIAgents } from './pages/AIAgents';
import { Login } from './pages/Login';
import { AIAssistant } from './components/AIAssistant';
import { apiClient } from '@/api/client';

const NotFound = () => <div className="p-8 text-2xl font-bold">Page Under Construction</div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('finpilot_token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="payment-agent" element={<PaymentAgent />} />
          <Route path="fraud" element={<FraudDetection />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="agents" element={<AIAgents />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
