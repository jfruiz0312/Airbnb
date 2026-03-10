import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    axios.get(`/properties/${id}`)
      .then(res => {
        const p = res.data;
        setForm({
          title: p.title,
          description: p.description || '',
          property_type: p.property_type,
          department: p.department,
          municipality: p.municipality || '',
          address: p.address || '',
          price_per_night: p.price_per_night,
          max_guests: p.max_guests,
          bedrooms: p.bedrooms,
          beds: p.beds,
          bathrooms: p.bathrooms,
          amenities: p.amenities || [],
          images: [...(p.images || []), '', '', '', ''].slice(0, 4),
          is_available: p.is_available,
        });
        setLoading(false);
      })
      .catch(() => navigate('/dashboard'));
  }, [id]);

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('El título es requerido');
    setError('');
    setSaving(true);
    try {
      await axios.put(`/properties/${id}`, {
        ...form,
        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
        bedrooms: Number(form.bedrooms),
        beds: Number(form.beds),
        bathrooms: Number(form.bathrooms),
        images: form.images.filter(i => i.trim()),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar alojamiento</h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="input-field resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Departamento</label>
            <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Municipio</label>
            <input type="text" value={form.municipality} onChange={e => setForm({ ...form, municipality: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Precio por noche (USD)</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">$</span>
            <input type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} min="10" className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Huéspedes', key: 'max_guests' },
            { label: 'Habitaciones', key: 'bedrooms' },
            { label: 'Camas', key: 'beds' },
            { label: 'Baños', key: 'bathrooms' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setForm({ ...form, [f.key]: Math.max(1, form[f.key] - 1) })} className="px-2.5 py-2 text-gray-500 hover:bg-gray-100">-</button>
                <span className="flex-1 text-center text-sm font-semibold">{form[f.key]}</span>
                <button type="button" onClick={() => setForm({ ...form, [f.key]: form[f.key] + 1 })} className="px-2.5 py-2 text-gray-500 hover:bg-gray-100">+</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Imágenes (URLs)</label>
          {form.images.map((url, i) => (
            <div key={i} className="mb-2">
              <input
                type="url"
                value={url}
                onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs }); }}
                placeholder={`URL foto ${i + 1}`}
                className="input-field text-sm"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Comodidades</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES_LIST.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`text-sm px-3 py-2 rounded-xl border-2 text-left transition-all ${
                  form.amenities.includes(a) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {form.amenities.includes(a) ? '✓ ' : ''}{a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.is_available}
              onChange={e => setForm({ ...form, is_available: e.target.checked ? 1 : 0 })}
              className="w-5 h-5 accent-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Disponible para reservaciones</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
