import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';
import { BankCardProvider } from './context/BankCardContext';
import { CalendarProvider } from './context/CalendarContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout/Layout';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import ToastContainer from './components/Toast/ToastContainer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';
import VerifyEmail from './pages/Auth/VerifyEmail/VerifyEmail';
import Dashboard from './pages/Dashboard/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions/Transactions';
import Spreadsheet from './pages/Spreadsheet/Spreadsheet/Spreadsheet';
import Categories from './pages/Categories/Categories/Categories';
import Calendar from './pages/Calendar/Calendar/Calendar';
import Planning from './pages/Planning/Planning/Planning';
import Settings from './pages/Settings/Settings/Settings';
import BankAccounts from './pages/BankAccounts/BankAccounts/BankAccounts';
import './App.css';

// Componente para redirecionar usuários autenticados
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border-primary)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <FinancialProvider>
            <BankCardProvider>
              <CalendarProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  {/* Rotas públicas (autenticação) */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/verify-email"
                    element={
                      <ProtectedRoute>
                        <VerifyEmail />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rotas protegidas */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Transactions />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/spreadsheet"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Spreadsheet />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Categories />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planning"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Planning />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bank-accounts"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <BankAccounts />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Rota padrão - redirecionar para login se não autenticado */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
                <ToastContainer />
              </Router>
            </CalendarProvider>
            </BankCardProvider>
          </FinancialProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
