import { useState, useEffect } from 'react';
import axios from 'axios';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: '✅' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: '❌' },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-600', icon: '🏁' },
};

export default function HostReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchReservations = () => {
    setLoading(true);
    axios.get('/reservations/host-reservations')
      .then(res => { setReservations(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axios.patch(`/reservations/${id}/status`, { status });
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar estado');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);
  const total = reservations.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + r.total_price, 0);

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reservaciones</h1>
          <p className="text-gray-500">Gestiona las reservaciones de tus alojamientos</p>
        </div>
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-right">
          <p className="text-xs font-semibold text-primary-600">INGRESOS CONFIRMADOS</p>
          <p className="text-xl font-bold text-primary-500">${total.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: '⏳ Pendientes' },
          { key: 'confirmed', label: '✅ Confirmadas' },
          { key: 'completed', label: '🏁 Completadas' },
          { key: 'cancelled', label: '❌ Canceladas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              filter === f.key ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === f.key ? 'bg-white/20' : 'bg-gray-100'}`}>
              {f.key === 'all' ? reservations.length : reservations.filter(r => r.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-3">📭</div>
          <p>No hay reservaciones en este estado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => {
            const status = statusConfig[r.status] || statusConfig.pending;
            const img = r.property_images?.[0];

            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-36 h-28 sm:h-auto shrink-0 bg-gray-100">
                    {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{r.property_title}</h3>
                        <p className="text-gray-500 text-sm">{r.department}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">HUÉSPED</p>
                        <p className="font-semibold">{r.guest_name}</p>
                        {r.guest_phone && <p className="text-xs text-gray-400">{r.guest_phone}</p>}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">FECHAS</p>
                        <p className="font-semibold text-xs">
                          {new Date(r.check_in + 'T12:00:00').toLocaleDateString('es-SV', { day: 'numeric', month: 'short' })} →{' '}
                          {new Date(r.check_out + 'T12:00:00').toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">HUÉSPEDES</p>
                        <p className="font-semibold">{r.guests_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">TOTAL</p>
                        <p className="font-semibold text-primary-500">${r.total_price.toFixed(2)}</p>
                        {r.payment_status === 'completed' && (
                          <p className="text-xs text-green-600 font-medium">💳 Pagado</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {r.status === 'pending' && r.payment_status === 'completed' && (
                        <button
                          onClick={() => handleStatus(r.id, 'confirmed')}
                          disabled={updating === r.id}
                          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          ✅ Confirmar
                        </button>
                      )}
                      {r.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatus(r.id, 'completed')}
                          disabled={updating === r.id}
                          className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          🏁 Marcar completada
                        </button>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        RES-{String(r.id).padStart(6, '0')} · {new Date(r.created_at).toLocaleDateString('es-SV')}
                      </span>
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
