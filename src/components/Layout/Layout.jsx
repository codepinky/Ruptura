import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import TopBar from './TopBar/TopBar';
import HelpGuide from '../HelpGuide/HelpGuide';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={toggleSidebar} />
      
      <div className="main-content">
        <TopBar onMenuClick={toggleSidebar} />
        <main className="content">
          {children}
        </main>
      </div>
      
      <HelpGuide />
    </div>
  );
};

export default Layout;
