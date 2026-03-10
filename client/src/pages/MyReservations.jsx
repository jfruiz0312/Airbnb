import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const statusConfig = {
  pending: { label: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: '✅' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: '❌' },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-600', icon: '🏁' },
};

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchReservations = () => {
    setLoading(true);
    axios.get('/reservations/my-reservations')
      .then(res => { setReservations(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('¿Estás seguro de cancelar esta reservación?')) return;
    setCancelling(id);
    try {
      await axios.delete(`/reservations/${id}`);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Mis reservaciones</h1>
      <p className="text-gray-500 mb-8">Gestiona todas tus estadías en El Salvador</p>

      {reservations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin reservaciones aún</h3>
          <p className="text-gray-500 mb-6">Explora los increíbles alojamientos disponibles en El Salvador</p>
          <Link to="/" className="btn-primary inline-block">Explorar alojamientos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map(r => {
            const status = statusConfig[r.status] || statusConfig.pending;
            const img = r.property_images?.[0];
            const serviceFee = r.total_price * 0.12;
            const grandTotal = r.total_price + serviceFee;

            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-40 h-32 sm:h-auto shrink-0 bg-gray-100">
                    {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <h3 className="font-semibold text-gray-800 text-lg">{r.property_title}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{r.municipality}, {r.department}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">LLEGADA</p>
                        <p className="font-semibold">{new Date(r.check_in + 'T12:00:00').toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">SALIDA</p>
                        <p className="font-semibold">{new Date(r.check_out + 'T12:00:00').toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">NOCHES</p>
                        <p className="font-semibold">{r.nights}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">TOTAL</p>
                        <p className="font-semibold text-primary-500">${grandTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {r.status === 'pending' && !r.payment_status && (
                        <Link to={`/pago/${r.id}`} className="btn-primary text-sm py-2 px-4">
                          💳 Pagar ahora
                        </Link>
                      )}
                      {r.status === 'confirmed' && (
                        <Link to={`/confirmacion/${r.id}`} className="btn-secondary text-sm py-2 px-4">
                          Ver detalles
                        </Link>
                      )}
                      {r.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancelling === r.id}
                          className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 py-2 px-4 rounded-xl transition-colors"
                        >
                          {cancelling === r.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        Código: RES-{String(r.id).padStart(6, '0')}
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
