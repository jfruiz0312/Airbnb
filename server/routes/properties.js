const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Get all properties (with filters)
router.get('/', (req, res) => {
  const { department, type, min_price, max_price, guests, search } = req.query;

  let query = `
    SELECT p.*, u.name as host_name, u.avatar as host_avatar, u.phone as host_phone,
      (SELECT COUNT(*) FROM reservations r WHERE r.property_id = p.id AND r.status != 'cancelled') as reservation_count
    FROM properties p
    JOIN users u ON p.host_id = u.id
    WHERE p.is_available = 1
  `;
  const params = [];

  if (department) {
    query += ' AND p.department = ?';
    params.push(department);
  }
  if (type) {
    query += ' AND p.property_type = ?';
    params.push(type);
  }
  if (min_price) {
    query += ' AND p.price_per_night >= ?';
    params.push(Number(min_price));
  }
  if (max_price) {
    query += ' AND p.price_per_night <= ?';
    params.push(Number(max_price));
  }
  if (guests) {
    query += ' AND p.max_guests >= ?';
    params.push(Number(guests));
  }
  if (search) {
    query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.municipality LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY p.rating DESC, p.created_at DESC';

  const properties = db.prepare(query).all(...params);
  const parsed = properties.map(p => ({
    ...p,
    amenities: JSON.parse(p.amenities || '[]'),
    images: JSON.parse(p.images || '[]'),
  }));

  res.json(parsed);
});

// Get single property
router.get('/:id', (req, res) => {
  const property = db.prepare(`
    SELECT p.*, u.name as host_name, u.avatar as host_avatar, u.phone as host_phone, u.created_at as host_since
    FROM properties p
    JOIN users u ON p.host_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!property) return res.status(404).json({ error: 'Propiedad no encontrada' });

  const reviews = db.prepare(`
    SELECT r.*, u.name as guest_name, u.avatar as guest_avatar
    FROM reviews r
    JOIN users u ON r.guest_id = u.id
    WHERE r.property_id = ?
    ORDER BY r.created_at DESC
    LIMIT 10
  `).all(req.params.id);

  const reservedDates = db.prepare(`
    SELECT check_in, check_out FROM reservations
    WHERE property_id = ? AND status IN ('confirmed', 'pending')
  `).all(req.params.id);

  res.json({
    ...property,
    amenities: JSON.parse(property.amenities || '[]'),
    images: JSON.parse(property.images || '[]'),
    reviews,
    reservedDates,
  });
});

// Create property (host only)
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'host') {
    return res.status(403).json({ error: 'Solo los anfitriones pueden publicar propiedades' });
  }

  const {
    title, description, property_type, department, municipality, address,
    price_per_night, max_guests, bedrooms, beds, bathrooms, amenities, images
  } = req.body;

  if (!title || !department || !price_per_night) {
    return res.status(400).json({ error: 'Título, departamento y precio son requeridos' });
  }

  const result = db.prepare(`
    INSERT INTO properties (host_id, title, description, property_type, department, municipality, address,
      price_per_night, max_guests, bedrooms, beds, bathrooms, amenities, images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id, title, description, property_type || 'cabin', department, municipality, address,
    price_per_night, max_guests || 2, bedrooms || 1, beds || 1, bathrooms || 1,
    JSON.stringify(amenities || []), JSON.stringify(images || [])
  );

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({
    ...property,
    amenities: JSON.parse(property.amenities),
    images: JSON.parse(property.images),
  });
});

// Update property
router.put('/:id', authenticateToken, (req, res) => {
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!property) return res.status(404).json({ error: 'Propiedad no encontrada' });
  if (property.host_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

  const {
    title, description, property_type, department, municipality, address,
    price_per_night, max_guests, bedrooms, beds, bathrooms, amenities, images, is_available
  } = req.body;

  db.prepare(`
    UPDATE properties SET title=?, description=?, property_type=?, department=?, municipality=?, address=?,
      price_per_night=?, max_guests=?, bedrooms=?, beds=?, bathrooms=?, amenities=?, images=?, is_available=?
    WHERE id = ?
  `).run(
    title || property.title,
    description || property.description,
    property_type || property.property_type,
    department || property.department,
    municipality || property.municipality,
    address || property.address,
    price_per_night || property.price_per_night,
    max_guests || property.max_guests,
    bedrooms || property.bedrooms,
    beds || property.beds,
    bathrooms || property.bathrooms,
    JSON.stringify(amenities || JSON.parse(property.amenities)),
    JSON.stringify(images || JSON.parse(property.images)),
    is_available !== undefined ? is_available : property.is_available,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  res.json({ ...updated, amenities: JSON.parse(updated.amenities), images: JSON.parse(updated.images) });
});

// Delete property
router.delete('/:id', authenticateToken, (req, res) => {
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!property) return res.status(404).json({ error: 'Propiedad no encontrada' });
  if (property.host_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

  db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
  res.json({ message: 'Propiedad eliminada' });
});

// Get host's properties
router.get('/host/my-properties', authenticateToken, (req, res) => {
  const properties = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM reservations r WHERE r.property_id = p.id) as total_reservations,
      (SELECT COUNT(*) FROM reservations r WHERE r.property_id = p.id AND r.status = 'confirmed') as active_reservations
    FROM properties p
    WHERE p.host_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user.id);

  const parsed = properties.map(p => ({
    ...p,
    amenities: JSON.parse(p.amenities || '[]'),
    images: JSON.parse(p.images || '[]'),
  }));

  res.json(parsed);
});

module.exports = router;
