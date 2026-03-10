import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Payment() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/reservations/${reservationId}`)
      .then(res => { setReservation(res.data); setLoading(false); })
      .catch(() => navigate('/mis-reservaciones'));
  }, [reservationId]);

  const formatCard = (val) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };
  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '');
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2, 4);
    return v;
  };

  const handlePay = async () => {
    if (paymentMethod === 'card') {
      if (!card.number || !card.name || !card.expiry || !card.cvv) {
        return setError('Por favor completa todos los datos de la tarjeta');
      }
      if (card.number.replace(/\s/g, '').length < 16) return setError('Número de tarjeta inválido');
    }
    setError('');
    setProcessing(true);
    try {
      await axios.post('/payments/process', {
        reservation_id: Number(reservationId),
        payment_method: paymentMethod,
        card_number: card.number.replace(/\s/g, ''),
        card_name: card.name,
      });
      navigate(`/confirmacion/${reservationId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error procesando el pago');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  const serviceFee = reservation.total_price * 0.12;
  const grandTotal = reservation.total_price + serviceFee;
  const img = reservation.property_images?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Confirmar y pagar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Payment form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Trip details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">Tu viaje</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Llegada</span>
                <span className="font-medium">{new Date(reservation.check_in + 'T12:00:00').toLocaleDateString('es-SV', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salida</span>
                <span className="font-medium">{new Date(reservation.check_out + 'T12:00:00').toLocaleDateString('es-SV', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Noches</span>
                <span className="font-medium">{reservation.nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Huéspedes</span>
                <span className="font-medium">{reservation.guests_count}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">Método de pago</h2>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { id: 'card', label: '💳 Tarjeta' },
                { id: 'paypal', label: '🅿️ PayPal' },
                { id: 'transfer', label: '🏦 Transferencia' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all text-center ${
                    paymentMethod === m.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Número de tarjeta</label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={e => setCard({ ...card, number: formatCard(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre en la tarjeta</label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
                    placeholder="NOMBRE APELLIDO"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vencimiento</label>
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      value={card.cvv}
                      onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="•••"
                      maxLength={4}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                  <span>🔒</span>
                  <span>Tus datos están protegidos con encriptación SSL de 256 bits</span>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="p-6 text-center bg-blue-50 rounded-xl">
                <p className="text-blue-700 font-medium mb-2">🅿️ PayPal</p>
                <p className="text-sm text-blue-600">Serás redirigido a PayPal para completar el pago de forma segura</p>
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-2">
                <p className="font-semibold text-gray-800">Datos para transferencia bancaria:</p>
                <p>Banco: Banco Agrícola</p>
                <p>Cuenta: 1234-567890-0</p>
                <p>Beneficiario: CasaSV S.A. de C.V.</p>
                <p>Referencia: RES-{reservationId}</p>
                <p className="text-yellow-600 mt-2">⚠️ Envía el comprobante a pagos@casasv.com</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={processing}
            className="btn-primary w-full text-base py-4"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando pago...
              </span>
            ) : `Confirmar y pagar $${grandTotal.toFixed(2)}`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al confirmar aceptas los términos y condiciones de CasaSV. El cargo aparecerá como "CasaSV El Salvador".
          </p>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                {img && <img src={img} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-800 line-clamp-2">{reservation.property_title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{reservation.municipality}, {reservation.department}</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-4">Desglose del precio</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Alojamiento ({reservation.nights} noche{reservation.nights > 1 ? 's' : ''})</span>
                <span>${reservation.total_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tarifa de servicio (12%)</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-200 pt-3 mt-3">
                <span>Total (USD)</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-xl text-xs text-green-700 flex items-center gap-2">
              <span>✅</span>
              <span>Cancelación gratuita antes de {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-SV')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
