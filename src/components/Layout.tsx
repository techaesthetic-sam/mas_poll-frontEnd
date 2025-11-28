import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-2xl font-bold text-foreground hover:opacity-80 transition-opacity"
            >
              <img src="/favicon.png" alt="Logo" className="w-10 h-10" />
              <span className="hidden sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Mas Poll
              </span>
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive('/')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Polls
                </Link>
                <Link
                  to="/create"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive('/create')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Create Poll
                </Link>
              </div>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium text-foreground">{user?.username}</p>
                          <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive('/login')
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
    </div>
  );
}

