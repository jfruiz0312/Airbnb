const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Process payment
router.post('/process', authenticateToken, (req, res) => {
  const { reservation_id, payment_method, card_number, card_name, card_expiry, card_cvv } = req.body;

  if (!reservation_id || !payment_method) {
    return res.status(400).json({ error: 'ID de reservación y método de pago son requeridos' });
  }

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ? AND guest_id = ?').get(reservation_id, req.user.id);
  if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
  if (reservation.status === 'cancelled') return res.status(400).json({ error: 'No se puede pagar una reservación cancelada' });

  const existingPayment = db.prepare('SELECT * FROM payments WHERE reservation_id = ? AND status = ?').get(reservation_id, 'completed');
  if (existingPayment) return res.status(400).json({ error: 'Esta reservación ya fue pagada' });

  // Simulate payment processing
  const card_last4 = card_number ? card_number.slice(-4) : null;
  const transaction_id = uuidv4();
  const now = new Date().toISOString();

  // Delete any pending payment
  db.prepare('DELETE FROM payments WHERE reservation_id = ? AND status = ?').run(reservation_id, 'pending');

  const result = db.prepare(`
    INSERT INTO payments (reservation_id, amount, status, payment_method, card_last4, transaction_id, paid_at)
    VALUES (?, ?, 'completed', ?, ?, ?, ?)
  `).run(reservation.total_price, reservation_id, payment_method, card_last4, transaction_id, now);

  // Confirm reservation
  db.prepare("UPDATE reservations SET status = 'confirmed' WHERE id = ?").run(reservation_id);

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  res.json({ payment, message: '¡Pago procesado exitosamente!' });
});

// Get payment status
router.get('/reservation/:reservation_id', authenticateToken, (req, res) => {
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.reservation_id);
  if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
  if (reservation.guest_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

  const payment = db.prepare('SELECT * FROM payments WHERE reservation_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.reservation_id);
  res.json({ payment, reservation });
});

// Host earnings summary
router.get('/earnings', authenticateToken, (req, res) => {
  if (req.user.role !== 'host') return res.status(403).json({ error: 'Solo anfitriones' });

  const earnings = db.prepare(`
    SELECT
      SUM(pay.amount) as total_earned,
      COUNT(pay.id) as total_payments,
      strftime('%Y-%m', pay.paid_at) as month
    FROM payments pay
    JOIN reservations r ON pay.reservation_id = r.id
    JOIN properties p ON r.property_id = p.id
    WHERE p.host_id = ? AND pay.status = 'completed'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `).all(req.user.id);

  const total = db.prepare(`
    SELECT COALESCE(SUM(pay.amount), 0) as total
    FROM payments pay
    JOIN reservations r ON pay.reservation_id = r.id
    JOIN properties p ON r.property_id = p.id
    WHERE p.host_id = ? AND pay.status = 'completed'
  `).get(req.user.id);

  res.json({ earnings, total: total.total });
});

module.exports = router;
