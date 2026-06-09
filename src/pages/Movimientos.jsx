import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

export default function Movimientos() {
  const { plantas, movimientos, registrarMovimiento } = useApp();
  const navigate = useNavigate();
  const [tab,  setTab]  = useState('salida');
  const [form, setForm] = useState({
    planta: '', motivo: 'Venta', cantidad: '', fecha: new Date().toISOString().slice(0, 10)
  });
  const [exito,   setExito]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const motivosSalida  = ['Venta', 'Enfermedad', 'Baja / pérdida', 'Donación', 'Otro'];
  const motivosEntrada = ['Compra a proveedor', 'Trasplante interno', 'Devolución', 'Otro'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.planta || !form.cantidad) return;
    setError('');
    setLoading(true);
    try {
      await registrarMovimiento({
        tipo:     tab,
        motivo:   form.motivo,
        planta:   form.planta,
        cantidad: Number(form.cantidad),
        fecha:    form.fecha,
      });
      setExito(`✅ ${tab === 'salida' ? 'Salida' : 'Entrada'} registrada correctamente`);
      setForm({ planta: '', motivo: tab === 'salida' ? 'Venta' : 'Compra a proveedor',
                cantidad: '', fecha: new Date().toISOString().slice(0, 10) });
      setTimeout(() => setExito(''), 2500);
    } catch (err) {
      setError(err.message || 'Error al registrar movimiento.');
    } finally {
      setLoading(false);
    }
  };

  const iconoMov = (m) => {
    if (m.tipo === 'entrada') return { icon: '⬇️', cls: 'green' };
    if (m.motivo === 'Venta') return { icon: '🛒', cls: 'amber' };
    if (m.motivo === 'Enfermedad') return { icon: '🌡️', cls: 'red' };
    return { icon: '📦', cls: 'red' };
  };

  return (
    <div className="app-shell">
      <div className="page-content">
        <nav className="top-nav">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
          <h1>Movimientos</h1>
        </nav>

        <div className="screen">
          {exito && <div className="alert alert-green">{exito}</div>}
          {error && <div className="alert alert-red">⚠️ {error}</div>}

          <div className="chip-row">
            <button className={`chip${tab === 'salida' ? ' active' : ''}`}
              onClick={() => { setTab('salida'); setForm(f => ({ ...f, motivo: 'Venta' })); }}>
              📤 Registrar salida
            </button>
            <button className={`chip${tab === 'entrada' ? ' active' : ''}`}
              onClick={() => { setTab('entrada'); setForm(f => ({ ...f, motivo: 'Compra a proveedor' })); }}>
              📥 Registrar entrada
            </button>
          </div>

          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label>Planta *</label>
              <select required value={form.planta} onChange={e => setForm({ ...form, planta: e.target.value })}>
                <option value="">Seleccionar planta...</option>
                {plantas.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre} (stock: {p.stock})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Motivo *</label>
              <select value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}>
                {(tab === 'salida' ? motivosSalida : motivosEntrada).map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cantidad *</label>
                <input required type="number" min="1" placeholder="0"
                  value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" value={form.fecha}
                  onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Registrando...' : tab === 'salida' ? '📤 Registrar salida' : '📥 Registrar entrada'}
            </button>
          </form>

          <div className="section-header" style={{ marginTop: 8 }}>
            <h3>Historial reciente</h3>
          </div>

          {movimientos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>Sin movimientos registrados</p>
            </div>
          ) : movimientos.map(m => {
            const { icon, cls } = iconoMov(m);
            return (
              <div key={m.id} className="list-item">
                <div className={`list-icon ${cls}`}>{icon}</div>
                <div className="list-info">
                  <div className="item-name">{m.motivo} · {m.planta}</div>
                  <div className="item-sub">{m.fecha} · {m.hora}</div>
                </div>
                <div className="list-right">
                  <div className="item-val" style={{ color: m.tipo === 'entrada' ? 'var(--green-700)' : 'var(--red-700)' }}>
                    {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                  </div>
                  {m.total ? <div className="item-sub">${m.total.toFixed(2)}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
