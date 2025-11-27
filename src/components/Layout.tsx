import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const isHomePage = location.pathname === '/';

  return (
    <div className={`min-h-screen ${isHomePage ? 'bg-transparent' : 'bg-background'}`}>
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-foreground hover:opacity-80 transition-opacity">
              <img src="/favicon.png" alt="Mas Poll Logo" className="w-8 h-8" />
              Mas Poll
            </Link>
            <div className="flex gap-6">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Polls
              </Link>
              <Link
                to="/create"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/create')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Create Poll
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

