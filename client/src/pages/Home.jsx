import { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import { mockProperties } from '../data/mockProperties';

const DEPARTMENTS = [
  'Todos', 'San Salvador', 'La Libertad', 'Santa Ana', 'Sonsonate',
  'Ahuachapán', 'Cuscatlán', 'La Paz', 'Cabañas', 'San Vicente',
  'Usulután', 'San Miguel', 'Morazán', 'La Unión', 'Chalatenango'
];

const TYPES = [
  { value: '', label: '🏠 Todos', icon: '🏠' },
  { value: 'cabin', label: '🏕️ Cabañas', icon: '🏕️' },
  { value: 'house', label: '🏡 Casas', icon: '🏡' },
  { value: 'lodge', label: '🌿 Lodges', icon: '🌿' },
  { value: 'glamping', label: '⛺ Glamping', icon: '⛺' },
];

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [guests, setGuests] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (department && department !== 'Todos') params.department = department;
      if (type) params.type = type;
      if (maxPrice) params.max_price = maxPrice;
      if (guests) params.guests = guests;

      const res = await axios.get('/properties', { params });
      setProperties(res.data);
    } catch (err) {
      // Fallback a datos mock cuando no hay backend (ej. GitHub Pages)
      let filtered = mockProperties;
      if (search) filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.municipality?.toLowerCase().includes(search.toLowerCase())
      );
      if (department && department !== 'Todos') filtered = filtered.filter(p => p.department === department);
      if (type) filtered = filtered.filter(p => p.property_type === type);
      if (maxPrice) filtered = filtered.filter(p => p.price_per_night <= Number(maxPrice));
      if (guests) filtered = filtered.filter(p => p.max_guests >= Number(guests));
      setProperties(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [department, type]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setType('');
    setMaxPrice('');
    setGuests('');
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[480px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600"
          alt="El Salvador paisaje"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-3 drop-shadow-lg">
              Descubre El Salvador
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow max-w-2xl">
              Cabañas, casas y lodges únicos para vivir experiencias auténticas
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center p-2">
                <div className="flex-1 px-4 py-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">BUSCAR</label>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Juayúa, Coatepeque, El Tunco..."
                    className="w-full text-gray-800 text-sm outline-none placeholder-gray-400"
                  />
                </div>
                <div className="border-l border-gray-200 px-4 py-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">DEPARTAMENTO</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="text-gray-800 text-sm outline-none bg-transparent cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d === 'Todos' ? '' : d}>{d}</option>)}
                  </select>
                </div>
                <button type="submit" className="ml-2 w-12 h-12 bg-primary-500 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-colors shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Type filters */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-medium text-sm whitespace-nowrap transition-all ${
                type === t.value
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}

          <div className="border-l border-gray-200 h-8 mx-1" />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-medium text-sm whitespace-nowrap transition-all ${
              showFilters ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">PRECIO MÁXIMO / NOCHE</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="500"
                  className="border border-gray-300 rounded-xl px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">HUÉSPEDES MÍN.</label>
              <input
                type="number"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                placeholder="2"
                min="1"
                max="20"
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={fetchProperties} className="btn-primary text-sm py-2 px-5">
                Aplicar
              </button>
              <button onClick={clearFilters} className="btn-secondary text-sm py-2 px-4">
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {loading ? 'Buscando...' : `${properties.length} alojamiento${properties.length !== 1 ? 's' : ''} disponible${properties.length !== 1 ? 's' : ''}`}
          </h2>
          {(search || (department && department !== 'Todos') || type || maxPrice || guests) && (
            <button onClick={clearFilters} className="text-sm text-primary-500 hover:underline font-medium">
              Ver todos
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron alojamientos</h3>
            <p className="text-gray-500 mb-4">Intenta con otros filtros o busca en otro departamento</p>
            <button onClick={clearFilters} className="btn-primary">
              Ver todos los alojamientos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
