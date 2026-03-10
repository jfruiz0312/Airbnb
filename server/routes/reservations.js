const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Create reservation
router.post('/', authenticateToken, (req, res) => {
  const { property_id, check_in, check_out, guests_count, special_requests } = req.body;

  if (!property_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'Propiedad, fecha de entrada y salida son requeridos' });
  }

  const property = db.prepare('SELECT * FROM properties WHERE id = ? AND is_available = 1').get(property_id);
  if (!property) return res.status(404).json({ error: 'Propiedad no disponible' });

  if (guests_count > property.max_guests) {
    return res.status(400).json({ error: `Máximo ${property.max_guests} huéspedes permitidos` });
  }

  // Check for conflicts
  const conflict = db.prepare(`
    SELECT id FROM reservations
    WHERE property_id = ? AND status IN ('confirmed', 'pending')
    AND (
      (check_in <= ? AND check_out > ?) OR
      (check_in < ? AND check_out >= ?) OR
      (check_in >= ? AND check_out <= ?)
    )
  `).get(property_id, check_in, check_in, check_out, check_out, check_in, check_out);

  if (conflict) {
    return res.status(400).json({ error: 'Las fechas seleccionadas no están disponibles' });
  }

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  if (nights < 1) return res.status(400).json({ error: 'La estancia mínima es de 1 noche' });

  const total_price = nights * property.price_per_night;

  const result = db.prepare(`
    INSERT INTO reservations (property_id, guest_id, check_in, check_out, guests_count, total_price, nights, status, special_requests)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(property_id, req.user.id, check_in, check_out, guests_count || 1, total_price, nights, special_requests || null);

  const reservation = db.prepare(`
    SELECT r.*, p.title as property_title, p.images as property_images, p.department, p.municipality,
      u.name as host_name, u.phone as host_phone
    FROM reservations r
    JOIN properties p ON r.property_id = p.id
    JOIN users u ON p.host_id = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({
    ...reservation,
    property_images: JSON.parse(reservation.property_images || '[]'),
  });
});

// Get guest reservations
router.get('/my-reservations', authenticateToken, (req, res) => {
  const reservations = db.prepare(`
    SELECT r.*, p.title as property_title, p.images as property_images,
      p.department, p.municipality, p.price_per_night,
      u.name as host_name, u.phone as host_phone,
      pay.status as payment_status, pay.id as payment_id
    FROM reservations r
    JOIN properties p ON r.property_id = p.id
    JOIN users u ON p.host_id = u.id
    LEFT JOIN payments pay ON pay.reservation_id = r.id
    WHERE r.guest_id = ?
    ORDER BY r.created_at DESC
  `).all(req.user.id);

  const parsed = reservations.map(r => ({
    ...r,
    property_images: JSON.parse(r.property_images || '[]'),
  }));

  res.json(parsed);
});

// Get host's reservations
router.get('/host-reservations', authenticateToken, (req, res) => {
  const reservations = db.prepare(`
    SELECT r.*, p.title as property_title, p.images as property_images, p.department, p.municipality,
      u.name as guest_name, u.email as guest_email, u.phone as guest_phone,
      pay.status as payment_status, pay.amount as payment_amount
    FROM reservations r
    JOIN properties p ON r.property_id = p.id
    JOIN users u ON r.guest_id = u.id
    LEFT JOIN payments pay ON pay.reservation_id = r.id
    WHERE p.host_id = ?
    ORDER BY r.created_at DESC
  `).all(req.user.id);

  const parsed = reservations.map(r => ({
    ...r,
    property_images: JSON.parse(r.property_images || '[]'),
  }));

  res.json(parsed);
});

// Get single reservation
router.get('/:id', authenticateToken, (req, res) => {
  const reservation = db.prepare(`
    SELECT r.*, p.title as property_title, p.images as property_images, p.department, p.municipality,
      p.address, p.price_per_night, p.amenities as property_amenities,
      uh.name as host_name, uh.phone as host_phone, uh.email as host_email,
      ug.name as guest_name, ug.phone as guest_phone, ug.email as guest_email,
      pay.status as payment_status, pay.id as payment_id, pay.card_last4, pay.paid_at
    FROM reservations r
    JOIN properties p ON r.property_id = p.id
    JOIN users uh ON p.host_id = uh.id
    JOIN users ug ON r.guest_id = ug.id
    LEFT JOIN payments pay ON pay.reservation_id = r.id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });

  // Check authorization
  const property = db.prepare('SELECT host_id FROM properties WHERE id = ?').get(reservation.property_id);
  if (reservation.guest_id !== req.user.id && property.host_id !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  res.json({
    ...reservation,
    property_images: JSON.parse(reservation.property_images || '[]'),
    property_amenities: JSON.parse(reservation.property_amenities || '[]'),
  });
});

// Update reservation status (host)
router.patch('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'cancelled', 'completed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const reservation = db.prepare(`
    SELECT r.*, p.host_id FROM reservations r JOIN properties p ON r.property_id = p.id WHERE r.id = ?
  `).get(req.params.id);

  if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });

  const isHost = reservation.host_id === req.user.id;
  const isGuest = reservation.guest_id === req.user.id;

  if (!isHost && !isGuest) return res.status(403).json({ error: 'No autorizado' });
  if (status === 'confirmed' && !isHost) return res.status(403).json({ error: 'Solo el anfitrión puede confirmar' });

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Estado actualizado', status });
});

// Cancel reservation (guest)
router.delete('/:id', authenticateToken, (req, res) => {
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
  if (reservation.guest_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });
  if (['confirmed', 'completed'].includes(reservation.status)) {
    return res.status(400).json({ error: 'No se puede cancelar una reservación confirmada o completada' });
  }

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run('cancelled', req.params.id);
  res.json({ message: 'Reservación cancelada' });
});

module.exports = router;
