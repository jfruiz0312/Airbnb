const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'airbnb_sv.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'guest',
    phone TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT DEFAULT 'cabin',
    department TEXT NOT NULL,
    municipality TEXT,
    address TEXT,
    price_per_night REAL NOT NULL,
    max_guests INTEGER DEFAULT 2,
    bedrooms INTEGER DEFAULT 1,
    beds INTEGER DEFAULT 1,
    bathrooms REAL DEFAULT 1,
    amenities TEXT DEFAULT '[]',
    images TEXT DEFAULT '[]',
    is_available INTEGER DEFAULT 1,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    guest_id INTEGER NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INTEGER DEFAULT 1,
    total_price REAL NOT NULL,
    nights INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    special_requests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (guest_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    card_last4 TEXT,
    transaction_id TEXT,
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    guest_id INTEGER NOT NULL,
    reservation_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (guest_id) REFERENCES users(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
  );
`);

// Seed data
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const hashedPass = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)
  `);

  const host1 = insertUser.run('María López', 'maria@example.com', hashedPass, 'host', '+503 7777-1111');
  const host2 = insertUser.run('Carlos Ramos', 'carlos@example.com', hashedPass, 'host', '+503 7777-2222');
  const host3 = insertUser.run('Ana Martínez', 'ana@example.com', hashedPass, 'host', '+503 7777-3333');
  const host4 = insertUser.run('Roberto Flores', 'roberto@example.com', hashedPass, 'host', '+503 7777-4444');
  const guest1 = insertUser.run('Juan García', 'juan@example.com', hashedPass, 'guest', '+503 7777-5555');
  const guest2 = insertUser.run('Sofia Hernández', 'sofia@example.com', hashedPass, 'guest', '+503 7777-6666');

  const insertProp = db.prepare(`
    INSERT INTO properties (host_id, title, description, property_type, department, municipality, price_per_night, max_guests, bedrooms, beds, bathrooms, amenities, images, rating, review_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProp.run(
    host1.lastInsertRowid,
    'Aurora - Cabaña Volcánica en Juayúa',
    'Disfruta de una experiencia única en esta hermosa cabaña con vista al volcán Santa Ana. Perfecta para parejas y familias pequeñas. Cuenta con piscina de infinito, chimenea exterior y todas las comodidades modernas en el corazón de la Ruta de las Flores.',
    'cabin',
    'Sonsonate',
    'Juayúa',
    271.60,
    5, 2, 3, 1.5,
    JSON.stringify(['Piscina', 'WiFi', 'Chimenea', 'Cocina equipada', 'Estacionamiento', 'Vista al volcán', 'Área de fogata', 'Hamacas']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
    ]),
    4.96, 84
  );

  insertProp.run(
    host2.lastInsertRowid,
    'Villa Coatepeque - Frente al Lago',
    'Impresionante villa con acceso directo al Lago Coatepeque, el lago cratérico más hermoso de El Salvador. Disfruta de kayak, pesca y atardeceres mágicos. La propiedad cuenta con muelle privado, jacuzzi y terraza panorámica.',
    'house',
    'Santa Ana',
    'Santa Ana',
    320.00,
    8, 4, 6, 3,
    JSON.stringify(['Lago privado', 'Jacuzzi', 'Muelle', 'WiFi', 'Cocina equipada', 'BBQ', 'Kayaks', 'Estacionamiento', 'Aire acondicionado']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    ]),
    4.88, 52
  );

  insertProp.run(
    host3.lastInsertRowid,
    'Refugio del Café - Apaneca',
    'Cabaña rodeada de cafetales en el Parque Nacional El Imposible. Vive la experiencia cafetalera salvadoreña, con desayuno tradicional incluido, tours de café y vistas espectaculares de las montañas. Ideal para escapar del estrés.',
    'cabin',
    'Ahuachapán',
    'Apaneca',
    185.00,
    4, 2, 2, 2,
    JSON.stringify(['Desayuno incluido', 'WiFi', 'Tour de café', 'Cocina', 'Jardín', 'Vista a montañas', 'Chimenea', 'Estacionamiento']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
    ]),
    4.92, 37
  );

  insertProp.run(
    host4.lastInsertRowid,
    'Casa Surf - Playa El Tunco',
    'Casa de playa a 50 metros del mar en la famosa Playa El Tunco. Perfecta para surfistas y amantes del mar. Con terraza frente al océano, duchas exteriores y acceso directo a las mejores olas de El Salvador.',
    'house',
    'La Libertad',
    'La Libertad',
    245.00,
    6, 3, 4, 2,
    JSON.stringify(['Vista al mar', 'Playa privada', 'WiFi', 'BBQ', 'Estacionamiento', 'Tablas de surf', 'Duchas exteriores', 'Hamacas']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      'https://images.unsplash.com/photo-1520984032-31e4b0a9c2e2?w=800',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
    ]),
    4.79, 63
  );

  insertProp.run(
    host1.lastInsertRowid,
    'Cabaña del Bosque - Cerro Verde',
    'Cabaña de madera en el Parque Nacional Cerro Verde, a 2,030 metros de altura. Rodeada de bosque nublado y con vista privilegiada al Volcán Izalco (el Faro del Pacífico). Perfecta para senderismo y observación de aves.',
    'cabin',
    'Santa Ana',
    'Cerro Verde',
    198.00,
    3, 1, 2, 1,
    JSON.stringify(['WiFi', 'Chimenea', 'Cocina', 'Senderismo', 'Observación de aves', 'Vista volcán', 'Ropa de cama', 'Estacionamiento']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ]),
    4.85, 28
  );

  insertProp.run(
    host2.lastInsertRowid,
    'Eco Lodge - Bahía de Jiquilisco',
    'Lodge ecológico en la Reserva de Biósfera Bahía de Jiquilisco, Patrimonio Mundial UNESCO. Conecta con la naturaleza en manglares, observa tortugas marinas y disfruta de pesca artesanal. Incluye kayak en manglares.',
    'lodge',
    'Usulután',
    'Jiquilisco',
    155.00,
    4, 2, 2, 1,
    JSON.stringify(['Manglares', 'Kayak', 'Observación de tortugas', 'WiFi', 'Cocina', 'Tour naturaleza', 'Hamacas', 'Mosquiteros']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
    ]),
    4.71, 19
  );

  insertProp.run(
    host3.lastInsertRowid,
    'Casa Colonial - Suchitoto',
    'Hermosa casa colonial del siglo XIX en el centro histórico de Suchitoto, la ciudad más colonial de El Salvador. A pasos del Lago Suchitlán, galerías de arte y restaurantes. Decoración auténtica con arte local.',
    'house',
    'Cuscatlán',
    'Suchitoto',
    210.00,
    6, 3, 3, 2,
    JSON.stringify(['WiFi', 'Patio colonial', 'Arte local', 'Cocina equipada', 'Vista lago', 'Estacionamiento', 'Desayuno opcional', 'Aire acondicionado']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
    ]),
    4.94, 41
  );

  insertProp.run(
    host4.lastInsertRowid,
    'Glamping Volcán Santa Ana',
    'Experiencia glamping única en las faldas del Volcán Santa Ana. Carpas de lujo con camas king, baños privados y fogata incluida. Disfruta del cielo estrellado más claro de Centroamérica y caminatas guiadas al cráter.',
    'glamping',
    'Santa Ana',
    'El Congo',
    175.00,
    2, 1, 1, 1,
    JSON.stringify(['Cama king', 'Fogata', 'Baño privado', 'Desayuno', 'Tour volcán', 'Cielo estrellado', 'Ropa de cama premium', 'Calefacción']),
    JSON.stringify([
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800',
      'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800',
      'https://images.unsplash.com/photo-1478827387698-1527781a4887?w=800'
    ]),
    4.97, 23
  );

  console.log('✅ Database seeded with El Salvador properties');
}

module.exports = db;
