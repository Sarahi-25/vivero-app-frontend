import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { registerApi } from '../services/api';

export default function Login() {
  const { login } = useApp();
  const navigate  = useNavigate();
  const [tab, setTab]   = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [exitoReg, setExitoReg] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // ── Login ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Completa todos los campos.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  // ── Registro ──────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nombre || !form.email || !form.password) { setError('Completa todos los campos.'); return; }
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden.'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      await registerApi(form.nombre, form.email, form.password);
      setExitoReg('¡Cuenta creada! Ahora inicia sesión.');
      setTab('login');
      setForm(f => ({ ...f, nombre: '', password: '', confirmar: '' }));
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-logo">🌱</div>
      <h1 className="login-title">Vivero Madra</h1>
      <p className="login-subtitle">Gestión de invernaderos</p>

      {/* Tabs */}
      <div className="chip-row" style={{ justifyContent: 'center', marginBottom: 16 }}>
        <button className={`chip${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
          🔐 Iniciar sesión
        </button>
        <button className={`chip${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
          📝 Registrarse
        </button>
      </div>

      {exitoReg && <div className="alert alert-green" style={{ marginBottom: 12 }}>✅ {exitoReg}</div>}
      {error     && <div className="alert alert-red"   style={{ marginBottom: 12 }}>⚠️ {error}</div>}

      {tab === 'login' ? (
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="tu@correo.com"
              value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Entrando...' : '🔐 Iniciar sesión'}
          </button>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input type="text" placeholder="Tu nombre"
              value={form.nombre} onChange={set('nombre')} />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="tu@correo.com"
              value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="Mínimo 6 caracteres"
              value={form.password} onChange={set('password')} autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input type="password" placeholder="Repite la contraseña"
              value={form.confirmar} onChange={set('confirmar')} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Creando cuenta...' : '📝 Crear cuenta'}
          </button>
        </form>
      )}
    </div>
  );
}
