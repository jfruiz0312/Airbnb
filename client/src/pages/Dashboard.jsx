import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, earnings: [] });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsRes, earningsRes] = await Promise.all([
        axios.get('/properties/host/my-properties'),
        axios.get('/payments/earnings'),
      ]);
      setProperties(propsRes.data);
      setEarnings(earningsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta propiedad? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    try {
      await axios.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  const toggleAvailability = async (id, current) => {
    try {
      await axios.put(`/properties/${id}`, { is_available: current ? 0 : 1 });
      setProperties(prev => prev.map(p => p.id === id ? { ...p, is_available: current ? 0 : 1 } : p));
    } catch (err) {
      alert('Error al actualizar disponibilidad');
    }
  };

  const totalReservations = properties.reduce((s, p) => s + (p.total_reservations || 0), 0);

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de anfitrión</h1>
          <p className="text-gray-500">Bienvenido, {user?.name} · Gestiona tus propiedades</p>
        </div>
        <Link to="/dashboard/agregar" className="btn-primary flex items-center gap-2">
          <span>+</span> Agregar alojamiento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Propiedades', value: properties.length, icon: '🏠', color: 'bg-primary-50 text-primary-600' },
          { label: 'Activas', value: properties.filter(p => p.is_available).length, icon: '✅', color: 'bg-green-50 text-green-600' },
          { label: 'Reservaciones', value: totalReservations, icon: '📅', color: 'bg-blue-50 text-blue-600' },
          { label: 'Ganancias', value: `$${earnings.total.toFixed(2)}`, icon: '💰', color: 'bg-yellow-50 text-yellow-600' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium opacity-75">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Link to="/reservaciones-host" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors shadow-sm">
          📋 Ver reservaciones
        </Link>
        <Link to="/dashboard/agregar" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors shadow-sm">
          ➕ Nueva propiedad
        </Link>
      </div>

      {/* Properties */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis alojamientos</h2>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🏡</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin propiedades aún</h3>
          <p className="text-gray-500 mb-6">Empieza a ganar dinero publicando tu cabaña o casa</p>
          <Link to="/dashboard/agregar" className="btn-primary inline-block">Publicar alojamiento</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {properties.map(p => {
            const img = p.images?.[0];
            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-32 h-28 shrink-0 bg-gray-100">
                    {img && <img src={img} alt={p.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{p.title}</h3>
                      <button
                        onClick={() => toggleAvailability(p.id, p.is_available)}
                        className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          p.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {p.is_available ? '● Activa' : '● Inactiva'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{p.municipality}, {p.department}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>${p.price_per_night}/noche</span>
                      <span>·</span>
                      <span>{p.total_reservations || 0} reserv.</span>
                      {p.rating > 0 && <span>· ⭐ {p.rating}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/propiedad/${p.id}`} className="text-xs text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Ver
                      </Link>
                      <Link to={`/dashboard/editar/${p.id}`} className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="text-xs text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        {deleting === p.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
