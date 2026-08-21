import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className="container py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
