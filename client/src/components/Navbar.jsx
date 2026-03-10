import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white text-lg">🏡</span>
          </div>
          <div>
            <span className="font-bold text-xl text-primary-500 leading-tight">CasaSV</span>
            <div className="text-xs text-gray-400 leading-tight -mt-0.5">El Salvador</div>
          </div>
        </Link>

        {/* Center search hint */}
        <div className="hidden md:flex items-center gap-1 border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <span className="text-sm font-medium text-gray-700">¿A dónde vas?</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-sm text-gray-500">Cualquier fecha</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-sm text-gray-500">Huéspedes</span>
          <button className="ml-2 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 relative">
          {user?.role === 'host' && (
            <Link to="/dashboard/agregar" className="hidden md:block text-sm font-semibold text-gray-700 hover:text-primary-500 transition-colors px-3 py-2 rounded-full hover:bg-gray-100">
              + Agregar alojamiento
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition-shadow"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${user.role === 'host' ? 'bg-primary-100 text-primary-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.role === 'host' ? '🏠 Anfitrión' : '✈️ Huésped'}
                      </span>
                    </div>
                    {user.role === 'guest' && (
                      <Link to="/mis-reservaciones" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        📅 Mis reservaciones
                      </Link>
                    )}
                    {user.role === 'host' && (
                      <>
                        <Link to="/dashboard" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          🏠 Mi panel
                        </Link>
                        <Link to="/reservaciones-host" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          📋 Reservaciones
                        </Link>
                        <Link to="/dashboard/agregar" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          ➕ Agregar alojamiento
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/registro" className="block px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      Registrarse
                    </Link>
                    <Link to="/login" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}
