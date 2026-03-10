import { Link } from 'react-router-dom';

const typeLabels = {
  cabin: '🏕️ Cabaña',
  house: '🏠 Casa',
  lodge: '🌿 Lodge',
  glamping: '⛺ Glamping',
  apartment: '🏢 Apartamento',
};

export default function PropertyCard({ property }) {
  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  return (
    <Link to={`/propiedad/${property.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'; }}
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              {typeLabels[property.property_type] || '🏠 Alojamiento'}
            </span>
          </div>
          {property.rating >= 4.9 && (
            <div className="absolute top-3 right-3">
              <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                ⭐ Favorito
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 flex-1 pr-2">
              {property.title}
            </h3>
            {property.rating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <svg className="w-3.5 h-3.5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-800">{property.rating.toFixed(2)}</span>
              </div>
            )}
          </div>

          <p className="text-gray-500 text-sm">
            {property.municipality ? `${property.municipality}, ` : ''}{property.department}
          </p>
          <p className="text-gray-500 text-sm">
            {property.max_guests} huéspedes · {property.bedrooms} hab. · {property.beds} camas
          </p>
          <p className="text-gray-800 text-sm mt-1">
            <span className="font-semibold">${property.price_per_night.toFixed(2)}</span>
            <span className="text-gray-500"> noche</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
