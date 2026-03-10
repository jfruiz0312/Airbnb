# 🏡 CasaSV — Airbnb El Salvador

Plataforma de alojamientos turísticos para El Salvador. Permite a anfitriones publicar cabañas, casas y lodges, y a huéspedes buscar, reservar y pagar estadías.

🌐 **Demo en vivo:** [https://jfruiz0312.github.io/Airbnb](https://jfruiz0312.github.io/Airbnb)

---

## ✨ Funcionalidades

- 🔐 Registro e inicio de sesión (roles: Anfitrión / Huésped)
- 🏠 Publicar, editar y eliminar propiedades (cabañas, casas, lodges, glamping)
- 🔍 Buscar y filtrar por departamento, tipo, precio y huéspedes
- 📅 Calendario de reservaciones con fechas bloqueadas
- 💳 Flujo de pago simulado (tarjeta, PayPal, transferencia)
- 📋 Panel de anfitrión con gestión de reservaciones e ingresos
- ⭐ Sistema de reseñas y calificaciones
- 📍 14 departamentos de El Salvador

---

## 🗂 Estructura del proyecto

```
AirBnB/
├── client/          # Frontend — React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/       # Home, PropertyDetail, Dashboard, Payment...
│   │   ├── components/  # Navbar, PropertyCard, ProtectedRoute
│   │   └── context/     # AuthContext (JWT)
│   └── package.json
│
└── server/          # Backend — Express + SQLite
    ├── routes/          # auth, properties, reservations, payments, reviews
    ├── middleware/       # JWT auth
    ├── db/              # Base de datos SQLite + seed data
    └── package.json
```

---

## 🚀 Levantar en local

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/jfruiz0312/Airbnb.git
cd Airbnb
```

### 2. Instalar dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Levantar el backend

Abre una terminal y ejecuta:

```bash
cd server
node index.js
```

✅ API corriendo en: `http://localhost:3001`

> La base de datos SQLite se crea automáticamente con **8 propiedades de ejemplo** al primer inicio.

### 4. Levantar el frontend

Abre **otra terminal** y ejecuta:

```bash
cd client
npx vite --host
```

✅ App corriendo en: `http://localhost:5173`

---

## 👤 Cuentas de prueba

| Rol | Email | Contraseña |
|---|---|---|
| 🏠 Anfitrión | `maria@example.com` | `password123` |
| 🏠 Anfitrión | `carlos@example.com` | `password123` |
| ✈️ Huésped | `juan@example.com` | `password123` |
| ✈️ Huésped | `sofia@example.com` | `password123` |

---

## 🔄 Flujo de uso

### Como Huésped
1. Regístrate o usa una cuenta demo de huésped
2. Explora propiedades — filtra por departamento, tipo o precio
3. Entra a una propiedad y selecciona fechas en el calendario
4. Haz clic en **Reservar**
5. Completa el pago (usa cualquier número de tarjeta de 16 dígitos)
6. Recibe la confirmación con código de reservación

### Como Anfitrión
1. Regístrate seleccionando el rol **Anfitrión** (o usa `maria@example.com`)
2. Ve a **Mi panel** desde el menú
3. Haz clic en **Agregar alojamiento** y completa los 4 pasos
4. Ve a **Reservaciones** para gestionar y confirmar reservas

---

## 🛠 Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| HTTP Client | Axios |
| Calendario | react-datepicker, date-fns |
| Backend | Node.js, Express |
| Base de datos | SQLite (better-sqlite3) |
| Autenticación | JWT (jsonwebtoken), bcryptjs |
| Deploy frontend | GitHub Pages + gh-pages |

---

## 📦 Scripts útiles

```bash
# Backend
cd server
node index.js           # Producción
npx nodemon index.js    # Desarrollo (auto-reload)

# Frontend
cd client
npx vite                # Desarrollo
npm run build           # Build para producción
npm run deploy          # Deploy a GitHub Pages
```

---

## 🌎 Propiedades precargadas

| Propiedad | Ubicación | Precio/noche |
|---|---|---|
| Aurora - Cabaña Volcánica | Juayúa, Sonsonate | $271.60 |
| Villa Coatepeque | Santa Ana | $320.00 |
| Refugio del Café | Apaneca, Ahuachapán | $185.00 |
| Casa Surf | Playa El Tunco, La Libertad | $245.00 |
| Cabaña del Bosque | Cerro Verde, Santa Ana | $198.00 |
| Eco Lodge | Bahía de Jiquilisco, Usulután | $155.00 |
| Casa Colonial | Suchitoto, Cuscatlán | $210.00 |
| Glamping Volcán Santa Ana | El Congo, Santa Ana | $175.00 |
