import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DEPARTMENTS = [
  'San Salvador', 'La Libertad', 'Santa Ana', 'Sonsonate', 'Ahuachapán',
  'Cuscatlán', 'La Paz', 'Cabañas', 'San Vicente', 'Usulután',
  'San Miguel', 'Morazán', 'La Unión', 'Chalatenango'
];

const AMENITIES_LIST = [
  'WiFi', 'Piscina', 'Jacuzzi', 'Chimenea', 'BBQ / Parrilla', 'Estacionamiento',
  'Cocina equipada', 'Aire acondicionado', 'Calefacción', 'TV', 'Lavadora',
  'Vista al mar', 'Vista a volcán', 'Vista a lago', 'Jardín', 'Terraza',
  'Hamacas', 'Kayaks', 'Fogata', 'Desayuno incluido', 'Tour guiado', 'Seguridad 24h',
  'Área para niños', 'Admite mascotas', 'Sin escaleras', 'Acceso playa', 'Manglares',
];

export default function AddProperty() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', property_type: 'cabin',
    department: 'Sonsonate', municipality: '', address: '',
    price_per_night: '', max_guests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
    amenities: [], images: ['', '', '', ''],
  });

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError('El título es requerido');
    if (!form.description.trim()) return setError('La descripción es requerida');
    if (!form.price_per_night || Number(form.price_per_night) < 10) return setError('El precio mínimo es $10');

    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
        bedrooms: Number(form.bedrooms),
        beds: Number(form.beds),
        bathrooms: Number(form.bathrooms),
        images: form.images.filter(i => i.trim()),
      };
      await axios.post('/properties', payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al publicar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Tipo', 'Detalles', 'Fotos y comodidades', 'Precio'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Publica tu alojamiento</h1>
        <p className="text-gray-500 mt-1">Comparte tu espacio con viajeros en El Salvador</p>
      </div>

      {/* Progress */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <button
              onClick={() => step > i + 1 && setStep(i + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === i + 1 ? 'bg-primary-500 text-white' :
                step > i + 1 ? 'bg-green-500 text-white cursor-pointer' :
                'bg-gray-200 text-gray-500'
              }`}
            >
              {step > i + 1 ? '✓' : i + 1}
            </button>
            <div className={`flex-1 h-1 mx-1 rounded-full ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'} ${i === steps.length - 1 ? 'hidden' : ''}`} />
            <span className="hidden sm:block text-xs text-gray-500 ml-1">{s}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {/* Step 1: Type */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">¿Qué tipo de alojamiento es?</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: 'cabin', label: '🏕️ Cabaña', desc: 'Cabaña de campo o montaña' },
                { value: 'house', label: '🏠 Casa', desc: 'Casa completa' },
                { value: 'lodge', label: '🌿 Lodge', desc: 'Lodge ecológico' },
                { value: 'glamping', label: '⛺ Glamping', desc: 'Camping de lujo' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm({ ...form, property_type: t.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.property_type === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.label.split(' ')[0]}</div>
                  <div className="font-semibold text-sm text-gray-800">{t.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Departamento</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field mb-3">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Municipio / Zona</label>
              <input
                type="text"
                value={form.municipality}
                onChange={e => setForm({ ...form, municipality: e.target.value })}
                placeholder="Ej: Juayúa, Apaneca, El Tunco..."
                className="input-field mb-3"
              />
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección aproximada (opcional)</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Ej: Km 82 Carretera Panamericana"
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Detalles de tu alojamiento</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título del alojamiento</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Aurora - Cabaña con Vista Volcánica en Juayúa"
                className="input-field"
                maxLength={80}
              />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/80 caracteres</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={5}
                placeholder="Describe tu alojamiento: ambiente, vistas, actividades cercanas, lo que lo hace especial..."
                className="input-field resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000 caracteres</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Máx. huéspedes', key: 'max_guests', min: 1, max: 20 },
                { label: 'Habitaciones', key: 'bedrooms', min: 0, max: 20 },
                { label: 'Camas', key: 'beds', min: 1, max: 20 },
                { label: 'Baños', key: 'bathrooms', min: 1, max: 10 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setForm({ ...form, [f.key]: Math.max(f.min, form[f.key] - 1) })}
                      className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 font-bold">-</button>
                    <span className="flex-1 text-center font-semibold text-sm">{form[f.key]}</span>
                    <button type="button" onClick={() => setForm({ ...form, [f.key]: Math.min(f.max, form[f.key] + 1) })}
                      className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Photos & amenities */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Fotos y comodidades</h2>
            <p className="text-sm text-gray-500 mb-4">Agrega URLs de imágenes (Unsplash, Google Drive, etc.)</p>

            <div className="space-y-3 mb-6">
              {form.images.map((url, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {i === 0 ? 'Foto principal *' : `Foto ${i + 1} (opcional)`}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={e => {
                      const imgs = [...form.images];
                      imgs[i] = e.target.value;
                      setForm({ ...form, images: imgs });
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="input-field text-sm"
                  />
                  {url && (
                    <img src={url} alt="" className="mt-1 h-16 rounded-lg object-cover" onError={e => e.target.style.display = 'none'} />
                  )}
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-gray-800 mb-3">Comodidades disponibles</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`text-sm px-3 py-2.5 rounded-xl border-2 text-left transition-all font-medium ${
                    form.amenities.includes(a)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {form.amenities.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Price */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Precio por noche</h2>
            <div className="text-center mb-8">
              <div className="inline-flex items-center border-2 border-gray-300 rounded-2xl px-6 py-4 text-4xl font-bold text-gray-800">
                <span className="text-gray-400 mr-2 text-2xl">$</span>
                <input
                  type="number"
                  value={form.price_per_night}
                  onChange={e => setForm({ ...form, price_per_night: e.target.value })}
                  placeholder="0"
                  min="10"
                  max="5000"
                  className="w-36 text-4xl font-bold text-center outline-none bg-transparent"
                />
                <span className="text-gray-400 ml-2 text-lg">USD</span>
              </div>
              <p className="text-gray-500 text-sm mt-3">Precio mínimo: $10/noche</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[75, 150, 250, 320, 450, 600].map(price => (
                <button
                  key={price}
                  onClick={() => setForm({ ...form, price_per_night: price })}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    Number(form.price_per_night) === price ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  ${price}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-2">
              <p className="font-semibold text-gray-800 mb-3">Resumen de tu publicación</p>
              <div className="flex justify-between"><span className="text-gray-500">Tipo</span><span className="font-medium capitalize">{form.property_type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ubicación</span><span className="font-medium">{form.municipality}, {form.department}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Capacidad</span><span className="font-medium">{form.max_guests} huéspedes</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Comodidades</span><span className="font-medium">{form.amenities.length} seleccionadas</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2"><span className="text-gray-500">Precio</span><span className="font-bold text-primary-500">${form.price_per_night}/noche</span></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary py-2.5 px-5 text-sm">
              ← Anterior
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary py-2.5 px-6 text-sm">
              Siguiente →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary py-2.5 px-6 text-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publicando...
                </span>
              ) : '🚀 Publicar alojamiento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
