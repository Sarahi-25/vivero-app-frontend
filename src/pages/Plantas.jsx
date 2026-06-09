import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const TIPOS = ['Todos', 'Ornamental', 'Suculenta', 'Frutal', 'Aromática'];

function estadoBadge(estado) {
  if (estado === 'Sana')    return <span className="badge badge-green">Sana</span>;
  if (estado === 'Enferma') return <span className="badge badge-red">Enferma</span>;
  return <span className="badge badge-amber">{estado}</span>;
}

function stockBadge(stock) {
  if (stock < 10) return <span className="badge badge-amber">Stock bajo</span>;
  return null;
}

export function Plantas() {
  const { plantas, loading, error } = useApp();
  const navigate   = useNavigate();
  const [filtro,    setFiltro]    = useState('Todos');
  const [busqueda,  setBusqueda]  = useState('');

  const lista = plantas.filter(p => {
    const porTipo     = filtro === 'Todos' || p.tipo === filtro;
    const porBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return porTipo && porBusqueda;
  });

  return (
    <div className="app-shell">
      <div className="page-content">
        <nav className="top-nav">
          <h1>Inventario de plantas</h1>
          <button className="nav-icon" onClick={() => navigate('/plantas/nueva')}>➕</button>
        </nav>

        <div className="screen">
          {error   && <div className="alert alert-red">{error}</div>}
          {loading && <div className="alert alert-green">⏳ Cargando plantas...</div>}

          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Buscar planta..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>

          <div className="chip-row">
            {TIPOS.map(t => (
              <button key={t} className={`chip${filtro === t ? ' active' : ''}`} onClick={() => setFiltro(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total plantas</div>
              <div className="stat-value green">{plantas.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total stock</div>
              <div className="stat-value">{plantas.reduce((s, p) => s + p.stock, 0)}</div>
            </div>
          </div>

          {lista.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🌵</span>
              <p>No se encontraron plantas</p>
            </div>
          ) : (
            lista.map(p => (
              <div key={p.id} className="list-item" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/plantas/${p.id}`)}>
                <div className="list-icon green">🌿</div>
                <div className="list-info">
                  <div className="item-name">{p.nombre}</div>
                  <div className="item-sub">{p.tipo} · {p.color}</div>
                </div>
                <div className="list-right">
                  <div className="item-val">Stock: {p.stock}</div>
                  <div>{stockBadge(p.stock) || estadoBadge(p.estado)}</div>
                </div>
              </div>
            ))
          )}

          <button className="btn btn-primary" style={{ marginTop: 16 }}
            onClick={() => navigate('/plantas/nueva')}>
            🌱 Agregar nueva planta
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export function NuevaPlanta() {
  const { agregarPlanta } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', tipo: 'Ornamental', color: '',
    precioCompra: '', precioVenta: '', stock: '', estado: 'Sana'
  });
  const [exito,   setExito]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await agregarPlanta({
        ...form,
        precioCompra: Number(form.precioCompra),
        precioVenta:  Number(form.precioVenta),
        stock:        Number(form.stock),
      });
      setExito(true);
      setTimeout(() => navigate('/plantas'), 1200);
    } catch (err) {
      setError(err.message || 'Error al guardar la planta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-content">
        <nav className="top-nav">
          <button className="back-btn" onClick={() => navigate('/plantas')}>←</button>
          <h1>Nueva planta</h1>
        </nav>

        <div className="screen">
          {exito && <div className="alert alert-green">✅ ¡Planta registrada exitosamente!</div>}
          {error && <div className="alert alert-red">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de la planta *</label>
              <input required placeholder="Ej. Nochebuena roja"
                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Tipo / especie *</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option>Ornamental</option><option>Suculenta</option>
                <option>Frutal</option><option>Aromática</option><option>Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <input placeholder="Ej. Rojo, Verde, Multicolor"
                value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio compra $</label>
                <input type="number" min="0" placeholder="0.00"
                  value={form.precioCompra} onChange={e => setForm({ ...form, precioCompra: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Precio venta $</label>
                <input required type="number" min="0" placeholder="0.00"
                  value={form.precioVenta} onChange={e => setForm({ ...form, precioVenta: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Stock inicial</label>
              <input required type="number" min="0" placeholder="0"
                value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option>Sana</option><option>Enferma</option><option>En cuarentena</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Guardando...' : '✅ Guardar planta'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/plantas')}>
              ✕ Cancelar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
