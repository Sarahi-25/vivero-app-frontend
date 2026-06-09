import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Ganancias() {
  const { plantas, movimientos } = useApp();
  const navigate  = useNavigate();
  const [periodo, setPeriodo] = useState('semana');

  // Calcular ganancias por planta (ventas registradas en el backend)
  const gananciasPorPlanta = plantas.map(p => {
    const ventas = movimientos.filter(
      m => m.tipo === 'salida' && m.motivo === 'Venta' && m.planta === p.nombre
    );
    const unidades = ventas.reduce((s, m) => s + m.cantidad, 0);
    // Si hay total real del backend úsalo, sino estimado
    const total = ventas.reduce((s, m) => s + (m.total || p.precioVenta * m.cantidad), 0);
    const costo    = unidades * p.precioCompra;
    const ganancia = total - costo;
    return { ...p, unidades, total, ganancia };
  }).sort((a, b) => b.total - a.total);

  const totalIngresos = gananciasPorPlanta.reduce((s, p) => s + p.total, 0);
  const totalGanancia = gananciasPorPlanta.reduce((s, p) => s + p.ganancia, 0);
  const margen = totalIngresos > 0 ? Math.round((totalGanancia / totalIngresos) * 100) : 0;

  const tipos = [...new Set(plantas.map(p => p.tipo))];
  const dataTipos = tipos.map(tipo => ({
    tipo: tipo.slice(0, 5) + '.',
    ingresos: gananciasPorPlanta.filter(p => p.tipo === tipo).reduce((s, p) => s + p.total, 0)
  })).sort((a, b) => b.ingresos - a.ingresos);

  return (
    <div className="app-shell">
      <div className="page-content">
        <nav className="top-nav">
          <h1>Análisis de ganancias</h1>
        </nav>

        <div className="screen">
          <div className="chip-row">
            {['semana', 'mes', 'año'].map(p => (
              <button key={p} className={`chip${periodo === p ? ' active' : ''}`} onClick={() => setPeriodo(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total ingresos</div>
              <div className="stat-value green">${totalIngresos.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ganancia neta</div>
              <div className="stat-value green">${totalGanancia.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Margen</div>
              <div className="stat-value green">{margen}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Tipos de planta</div>
              <div className="stat-value">{tipos.length}</div>
            </div>
          </div>

          <div className="section-header">
            <h3>Ingresos por categoría</h3>
          </div>
          <div className="chart-wrap" style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataTipos} barSize={32}>
                <XAxis dataKey="tipo" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6C757D' }} />
                <YAxis hide />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Ingresos']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="ingresos" fill="#639922" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="section-header">
            <h3>Plantas más rentables</h3>
          </div>

          {gananciasPorPlanta.every(p => p.total === 0) ? (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <p>Aún no hay ventas registradas</p>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }}
                onClick={() => navigate('/movimientos')}>
                Registrar primera venta
              </button>
            </div>
          ) : gananciasPorPlanta.map((p, i) => (
            <div key={p.id} className="list-item">
              <div className="rank-num">#{i + 1}</div>
              <div className="list-info">
                <div className="item-name">{p.nombre}</div>
                <div className="item-sub">{p.unidades} unidades vendidas · {p.tipo}</div>
              </div>
              <div className="list-right">
                <div className="item-val" style={{ color: 'var(--green-700)' }}>
                  ${p.total.toLocaleString()}
                </div>
                <div className="item-sub">gan: ${p.ganancia.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
