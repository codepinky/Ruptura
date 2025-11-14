import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { CalendarProvider } from './context/CalendarContext';
import Layout from './components/Layout/Layout';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import ToastContainer from './components/Toast/ToastContainer';
import Dashboard from './pages/Dashboard/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions/Transactions';
import Spreadsheet from './pages/Spreadsheet/Spreadsheet/Spreadsheet';
import Categories from './pages/Categories/Categories/Categories';
import Calendar from './pages/Calendar/Calendar/Calendar';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <FinancialProvider>
          <CalendarProvider>
            <Router>
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/spreadsheet" element={<Spreadsheet />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<div>Configurações - Em desenvolvimento</div>} />
              </Routes>
            </Layout>
            <ToastContainer />
          </Router>
        </CalendarProvider>
        </FinancialProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
