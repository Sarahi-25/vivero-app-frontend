import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { plantas, movimientos, personal, usuario, logout, loading, recargar } = useApp();
  const navigate = useNavigate();

  const totalStock  = plantas.reduce((s, p) => s + p.stock, 0);
  const enfermas    = plantas.filter(p => p.estado === 'Enferma').length;
  const stockBajo   = plantas.filter(p => p.stock < 10);

  // Ingresos reales desde ventas del backend (movimientos con total)
  const totalIngresos = movimientos
    .filter(m => m.tipo === 'salida' && m.motivo === 'Venta' && m.total)
    .reduce((s, m) => s + m.total, 0);

  const hoy = new Date().toISOString().slice(0, 10);
  const ventasHoy = movimientos.filter(m => m.tipo === 'salida' && m.motivo === 'Venta' && m.fecha === hoy);
  const ingresoHoy = ventasHoy.reduce((s, m) => s + (m.total || 0), 0);
  const entradasHoy = movimientos
    .filter(m => m.tipo === 'entrada' && m.fecha === hoy)
    .reduce((s, m) => s + m.cantidad, 0);

  // Gráfica: agrupar ventas por día (últimos 7 días)
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const fecha = d.toISOString().slice(0, 10);
    const dias  = ['D','L','M','X','J','V','S'];
    const ventas = movimientos
      .filter(m => m.tipo === 'salida' && m.motivo === 'Venta' && m.fecha === fecha)
      .reduce((s, m) => s + (m.total || 0), 0);
    return { dia: dias[d.getDay()], ventas };
  });

  return (
    <div className="app-shell">
      <div className="page-content">
        <nav className="top-nav">
          <span style={{ fontSize: 22 }}>🌿</span>
          <h1>Vivero MADRA🌿</h1>
          {loading
            ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>⏳</span>
            : <button className="nav-icon" onClick={recargar} title="Actualizar">🔄</button>
          }
          <button className="nav-icon" onClick={logout} title="Cerrar sesión">👤</button>
        </nav>

        <div className="screen">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            Bienvenido, <strong>{usuario?.name || usuario?.nombre}</strong>
          </p>

          {stockBajo.map(p => (
            <div key={p.id} className="alert alert-amber">
              ⚠️ Stock bajo: <strong>{p.nombre}</strong> — quedan {p.stock} unidades
            </div>
          ))}
          {enfermas > 0 && (
            <div className="alert alert-red">
              🌡️ {enfermas} {enfermas === 1 ? 'planta enferma detectada' : 'plantas enfermas detectadas'}
            </div>
          )}

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Plantas en stock</div>
              <div className="stat-value green">{totalStock.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ventas hoy</div>
              <div className="stat-value">${ingresoHoy.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Entradas hoy</div>
              <div className="stat-value green">+{entradasHoy}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total ingresos</div>
              <div className="stat-value green">${totalIngresos.toLocaleString()}</div>
            </div>
          </div>

          <div className="section-header">
            <h3>Ventas últimos 7 días</h3>
            <button onClick={() => navigate('/reportes')}>Ver reporte</button>
          </div>
          <div className="chart-wrap" style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ultimos7} barSize={28}>
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6C757D' }} />
                <Tooltip
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Ventas']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="ventas" fill="#639922" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="section-header" style={{ marginTop: 4 }}>
            <h3>Acceso rápido</h3>
          </div>
          <div className="quick-grid">
            <button className="quick-btn" onClick={() => navigate('/plantas/nueva')}>
              <span>🌱</span>Registrar planta
            </button>
            <button className="quick-btn" onClick={() => navigate('/movimientos')}>
              <span>📦</span>Movimientos
            </button>
            <button className="quick-btn" onClick={() => navigate('/personal')}>
              <span>⏱️</span>Asistencia
            </button>
            <button className="quick-btn" onClick={() => navigate('/reportes')}>
              <span>📋</span>Reportes
            </button>
          </div>

          <div className="section-header">
            <h3>Últimos movimientos</h3>
            <button onClick={() => navigate('/movimientos')}>Ver todos</button>
          </div>
          {movimientos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>Sin movimientos aún</p>
            </div>
          ) : movimientos.slice(0, 4).map(m => (
            <div key={m.id} className="list-item">
              <div className={`list-icon ${m.tipo === 'entrada' ? 'green' : m.motivo === 'Venta' ? 'amber' : 'red'}`}>
                {m.tipo === 'entrada' ? '⬇️' : m.motivo === 'Venta' ? '🛒' : '🌡️'}
              </div>
              <div className="list-info">
                <div className="item-name">{m.motivo} · {m.planta}</div>
                <div className="item-sub">{m.fecha} {m.hora}</div>
              </div>
              <div className="list-right">
                <div className="item-val" style={{ color: m.tipo === 'entrada' ? 'var(--green-700)' : 'var(--red-700)' }}>
                  {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}
                </div>
                {m.total ? <div className="item-sub">${m.total.toFixed(2)}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
