const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Add review
router.post('/', authenticateToken, (req, res) => {
  const { property_id, reservation_id, rating, comment } = req.body;

  if (!property_id || !reservation_id || !rating) {
    return res.status(400).json({ error: 'Propiedad, reservación y calificación son requeridos' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'La calificación debe ser entre 1 y 5' });
  }

  const reservation = db.prepare(
    'SELECT * FROM reservations WHERE id = ? AND guest_id = ? AND status = ?'
  ).get(reservation_id, req.user.id, 'completed');

  if (!reservation) {
    return res.status(400).json({ error: 'Solo puedes reseñar reservaciones completadas' });
  }

  const existing = db.prepare('SELECT id FROM reviews WHERE reservation_id = ?').get(reservation_id);
  if (existing) return res.status(400).json({ error: 'Ya dejaste una reseña para esta reservación' });

  db.prepare(`
    INSERT INTO reviews (property_id, guest_id, reservation_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(property_id, req.user.id, reservation_id, rating, comment || null);

  // Update property rating
  const stats = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE property_id = ?
  `).get(property_id);

  db.prepare('UPDATE properties SET rating = ?, review_count = ? WHERE id = ?').run(
    Math.round(stats.avg_rating * 100) / 100,
    stats.count,
    property_id
  );

  res.status(201).json({ message: 'Reseña publicada exitosamente' });
});

// Get property reviews
router.get('/property/:id', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.name as guest_name, u.avatar as guest_avatar
    FROM reviews r
    JOIN users u ON r.guest_id = u.id
    WHERE r.property_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.id);

  res.json(reviews);
});

module.exports = router;
