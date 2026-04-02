import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/auth.js';

function Layout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await authService.logout();
    } catch (error) {
    } finally {
      setUser(null);
      setLoggingOut(false);
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-40 h-16 border-b border-surface-200 bg-white shadow-sm">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display text-xl font-bold text-ink-900">
              LearnHub
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900'}`
                }
              >
                Courses
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!user && (
              <>
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            )}

            {user && user.role === 'USER' && (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-ink-700 transition-colors hover:text-brand-600">
                  Dashboard
                </Link>
                <button type="button" className="btn-secondary" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </>
            )}

            {user && user.role === 'ADMIN' && (
              <>
                <Link to="/admin" className="text-sm font-medium text-ink-700 transition-colors hover:text-brand-600">
                  Admin
                </Link>
                <button type="button" className="btn-secondary" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

export default Layout;