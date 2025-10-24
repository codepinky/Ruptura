import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions/Transactions';
import Reports from './pages/Reports/Reports/Reports';
import Spreadsheet from './pages/Spreadsheet/Spreadsheet/Spreadsheet';
import Categories from './pages/Categories/Categories/Categories';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <FinancialProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/spreadsheet" element={<Spreadsheet />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/budgets" element={<div>Orçamentos - Em desenvolvimento</div>} />
              <Route path="/goals" element={<div>Metas - Em desenvolvimento</div>} />
              <Route path="/calendar" element={<div>Calendário - Em desenvolvimento</div>} />
              <Route path="/settings" element={<div>Configurações - Em desenvolvimento</div>} />
            </Routes>
          </Layout>
        </Router>
      </FinancialProvider>
    </ThemeProvider>
  );
}

export default App;
