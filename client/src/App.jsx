import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import MyReservations from './pages/MyReservations';
import HostReservations from './pages/HostReservations';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/propiedad/:id" element={<PropertyDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute role="host"><Dashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/agregar" element={
                <ProtectedRoute role="host"><AddProperty /></ProtectedRoute>
              } />
              <Route path="/dashboard/editar/:id" element={
                <ProtectedRoute role="host"><EditProperty /></ProtectedRoute>
              } />
              <Route path="/mis-reservaciones" element={
                <ProtectedRoute><MyReservations /></ProtectedRoute>
              } />
              <Route path="/reservaciones-host" element={
                <ProtectedRoute role="host"><HostReservations /></ProtectedRoute>
              } />
              <Route path="/pago/:reservationId" element={
                <ProtectedRoute><Payment /></ProtectedRoute>
              } />
              <Route path="/confirmacion/:reservationId" element={
                <ProtectedRoute><Confirmation /></ProtectedRoute>
              } />
            </Routes>
          </main>
          <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
              <p className="font-semibold text-gray-700 mb-1">🏡 CasaSV - Alojamientos en El Salvador</p>
              <p>© 2024 CasaSV · Todos los derechos reservados · Hecho con ❤️ para El Salvador</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
