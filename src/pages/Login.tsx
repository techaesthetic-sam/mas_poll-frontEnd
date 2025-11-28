import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {isRegister ? 'Register' : 'Login'}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-xl text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isRegister
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

