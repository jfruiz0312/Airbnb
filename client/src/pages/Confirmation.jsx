import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function Confirmation() {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/reservations/${reservationId}`)
      .then(res => { setReservation(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [reservationId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!reservation) return (
    <div className="text-center py-20 text-gray-500">Reservación no encontrada</div>
  );

  const img = reservation.property_images?.[0];
  const serviceFee = reservation.total_price * 0.12;
  const grandTotal = reservation.total_price + serviceFee;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Reservación confirmada!</h1>
        <p className="text-gray-500">Tu viaje a El Salvador está confirmado. ¡Prepárate para una experiencia increíble!</p>
      </div>

      {/* Reservation card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg mb-6">
        {img && (
          <div className="h-48 overflow-hidden">
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{reservation.property_title}</h2>
          <p className="text-gray-500 text-sm mb-4">{reservation.municipality}, {reservation.department}, El Salvador</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">LLEGADA</p>
              <p className="font-semibold text-gray-800">
                {new Date(reservation.check_in + 'T12:00:00').toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">SALIDA</p>
              <p className="font-semibold text-gray-800">
                {new Date(reservation.check_out + 'T12:00:00').toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Código de reservación</span>
              <span className="font-mono font-semibold text-gray-800">RES-{String(reservation.id).padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Huéspedes</span>
              <span className="font-semibold">{reservation.guests_count}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Noches</span>
              <span className="font-semibold">{reservation.nights}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estado del pago</span>
              <span className="font-semibold text-green-600">✅ Pagado</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2 mt-2">
              <span>Total pagado</span>
              <span>${grandTotal.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Host contact */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Contacta a tu anfitrión</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
            {reservation.host_name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{reservation.host_name}</p>
            {reservation.host_phone && (
              <a href={`tel:${reservation.host_phone}`} className="text-primary-500 hover:underline text-sm font-medium">
                📞 {reservation.host_phone}
              </a>
            )}
            {reservation.host_email && (
              <p className="text-gray-500 text-xs mt-0.5">{reservation.host_email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Special requests */}
      {reservation.special_requests && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-yellow-700 mb-1">TUS SOLICITUDES ESPECIALES</p>
          <p className="text-sm text-gray-700">{reservation.special_requests}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link to="/mis-reservaciones" className="btn-primary flex-1 text-center">
          Ver mis reservaciones
        </Link>
        <Link to="/" className="btn-secondary flex-1 text-center">
          Explorar más
        </Link>
      </div>
    </div>
  );
}
