import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays, addDays, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

const typeLabels = {
  cabin: '🏕️ Cabaña', house: '🏠 Casa', lodge: '🌿 Lodge',
  glamping: '⛺ Glamping', apartment: '🏢 Apartamento',
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    axios.get(`/properties/${id}`)
      .then(res => { setProperty(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  const isDateReserved = (date) => {
    if (!property?.reservedDates) return false;
    return property.reservedDates.some(({ check_in, check_out }) => {
      try {
        return isWithinInterval(date, {
          start: parseISO(check_in),
          end: parseISO(check_out),
        });
      } catch { return false; }
    });
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights * (property?.price_per_night || 0);
  const serviceFee = totalPrice * 0.12;
  const grandTotal = totalPrice + serviceFee;

  const handleBook = async () => {
    if (!user) return navigate('/login');
    if (user.role === 'host') return setError('Los anfitriones no pueden hacer reservaciones. Usa una cuenta de huésped.');
    if (!checkIn || !checkOut) return setError('Selecciona las fechas de tu estancia');
    if (nights < 1) return setError('La fecha de salida debe ser posterior a la de entrada');

    setError('');
    setBookingLoading(true);
    try {
      const res = await axios.post('/reservations', {
        property_id: id,
        check_in: checkIn.toISOString().split('T')[0],
        check_out: checkOut.toISOString().split('T')[0],
        guests_count: guestsCount,
        special_requests: specialRequests,
      });
      navigate(`/pago/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la reservación');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );
  if (!property) return (
    <div className="text-center py-20 text-gray-500">Propiedad no encontrada</div>
  );

  const amenities = property.amenities || [];
  const displayedAmenities = showAllAmenities ? amenities : amenities.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {property.rating > 0 && (
            <span className="flex items-center gap-1 font-semibold text-gray-800">
              ⭐ {property.rating.toFixed(2)}
              <span className="font-normal text-gray-500">· {property.review_count} reseñas</span>
            </span>
          )}
          <span>·</span>
          <span className="font-medium text-gray-700">{property.municipality}, {property.department}, El Salvador</span>
          <span>·</span>
          <span>{typeLabels[property.property_type]}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[360px] mb-8">
        {property.images.slice(0, 5).map((img, idx) => (
          <div
            key={idx}
            className={`cursor-pointer overflow-hidden ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}
            onClick={() => setActiveImg(idx)}
          >
            <img
              src={img}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'; }}
            />
          </div>
        ))}
        {property.images.length < 3 && [...Array(3 - property.images.length)].map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">🏡</div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host & basics */}
          <div className="flex justify-between items-start pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Alojamiento completo · {typeLabels[property.property_type]}
              </h2>
              <p className="text-gray-500">
                {property.max_guests} huéspedes · {property.bedrooms} habitaciones · {property.beds} camas · {property.bathrooms} baños
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {property.host_name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{property.host_name}</p>
                <p className="text-xs text-gray-500">Anfitrión</p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-sm">Favorito entre huéspedes</p>
                <p className="text-gray-500 text-sm">Uno de los alojamientos más populares en CasaSV</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="font-semibold text-sm">Llegada autónoma</p>
                <p className="text-gray-500 text-sm">Coordina directamente con el anfitrión</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-sm">Zona hermosa</p>
                <p className="text-gray-500 text-sm">A los huéspedes les encanta la ubicación en {property.department}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sobre este alojamiento</h3>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lo que ofrece este lugar</h3>
              <div className="grid grid-cols-2 gap-3">
                {displayedAmenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-lg">✓</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
              {amenities.length > 8 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 border-2 border-gray-800 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {showAllAmenities ? 'Mostrar menos' : `Mostrar las ${amenities.length} comodidades`}
                </button>
              )}
            </div>
          )}

          {/* Reviews */}
          {property.reviews?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">⭐ {property.rating.toFixed(2)} · {property.review_count} reseñas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {property.reviews.slice(0, 4).map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {review.guest_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{review.guest_name}</p>
                        <p className="text-xs text-gray-500">{'⭐'.repeat(review.rating)}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-2xl font-bold text-gray-800">${property.price_per_night.toFixed(2)}</span>
                <span className="text-gray-500 text-sm"> / noche</span>
              </div>
              {property.rating > 0 && (
                <span className="text-sm font-medium text-gray-600">⭐ {property.rating.toFixed(2)}</span>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Dates */}
            <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
              <div className="grid grid-cols-2 divide-x divide-gray-300">
                <div className="p-3">
                  <label className="block text-xs font-bold text-gray-600 mb-1">LLEGADA</label>
                  <DatePicker
                    selected={checkIn}
                    onChange={date => { setCheckIn(date); if (checkOut && date >= checkOut) setCheckOut(null); }}
                    minDate={new Date()}
                    filterDate={d => !isDateReserved(d)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Agregar fecha"
                    locale={es}
                    className="w-full text-sm text-gray-700 outline-none cursor-pointer"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-xs font-bold text-gray-600 mb-1">SALIDA</label>
                  <DatePicker
                    selected={checkOut}
                    onChange={date => setCheckOut(date)}
                    minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                    filterDate={d => !isDateReserved(d)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Agregar fecha"
                    locale={es}
                    className="w-full text-sm text-gray-700 outline-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="border-t border-gray-300 p-3">
                <label className="block text-xs font-bold text-gray-600 mb-1">HUÉSPEDES</label>
                <select
                  value={guestsCount}
                  onChange={e => setGuestsCount(Number(e.target.value))}
                  className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                >
                  {[...Array(property.max_guests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} huésped{i > 0 ? 'es' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special requests */}
            <textarea
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              placeholder="Solicitudes especiales (opcional)..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3 resize-none"
            />

            <button
              onClick={handleBook}
              disabled={bookingLoading}
              className="btn-primary w-full text-center text-base"
            >
              {bookingLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : 'Reservar'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">Aún no se te cobrará nada</p>

            {/* Price breakdown */}
            {nights > 0 && (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>${property.price_per_night.toFixed(2)} × {nights} noche{nights > 1 ? 's' : ''}</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tarifa de servicio</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total (USD)</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Host contact */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-1">Anfitrión: {property.host_name}</p>
              {property.host_phone && (
                <a href={`tel:${property.host_phone}`} className="text-xs text-primary-500 font-medium hover:underline">
                  📞 {property.host_phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
