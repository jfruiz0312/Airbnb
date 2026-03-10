export const mockUsers = [
  { id: 1, name: 'María López',      email: 'maria@example.com',   password: 'password123', role: 'host',  phone: '+503 7777-1111' },
  { id: 2, name: 'Carlos Ramos',     email: 'carlos@example.com',  password: 'password123', role: 'host',  phone: '+503 7777-2222' },
  { id: 3, name: 'Ana Martínez',     email: 'ana@example.com',     password: 'password123', role: 'host',  phone: '+503 7777-3333' },
  { id: 4, name: 'Roberto Flores',   email: 'roberto@example.com', password: 'password123', role: 'host',  phone: '+503 7777-4444' },
  { id: 5, name: 'Juan García',      email: 'juan@example.com',    password: 'password123', role: 'guest', phone: '+503 7777-5555' },
  { id: 6, name: 'Sofia Hernández',  email: 'sofia@example.com',   password: 'password123', role: 'guest', phone: '+503 7777-6666' },
];

export function mockLogin(email, password) {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Email o contraseña incorrectos');
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token: `mock-token-${safeUser.id}` };
}

export function mockRegister(data) {
  const existing = mockUsers.find(u => u.email === data.email);
  if (existing) throw new Error('El email ya está registrado');
  const newUser = {
    id: Date.now(),
    name: data.name,
    email: data.email,
    role: data.role || 'guest',
    phone: data.phone || null,
  };
  return { user: newUser, token: `mock-token-${newUser.id}` };
}

export function mockGetMe(token) {
  const id = parseInt(token?.replace('mock-token-', ''));
  const user = mockUsers.find(u => u.id === id);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}
