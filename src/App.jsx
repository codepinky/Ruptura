import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout/Layout';
import ToastContainer from './components/Toast/ToastContainer';
import Dashboard from './pages/Dashboard/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions/Transactions';
import Reports from './pages/Reports/Reports/Reports';
import Spreadsheet from './pages/Spreadsheet/Spreadsheet/Spreadsheet';
import Categories from './pages/Categories/Categories/Categories';
import Budgets from './pages/Budgets/Budgets/Budgets';
import Goals from './pages/Goals/Goals/Goals';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <FinancialProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/spreadsheet" element={<Spreadsheet />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/calendar" element={<div>Calendário - Em desenvolvimento</div>} />
                <Route path="/settings" element={<div>Configurações - Em desenvolvimento</div>} />
              </Routes>
            </Layout>
            <ToastContainer />
          </Router>
        </FinancialProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
