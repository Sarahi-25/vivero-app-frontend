import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { descargarReportePdf } from '../utils/pdfReporte';

export default function Reportes() {
  const { plantas, movimientos, personal } = useApp();
  const navigate = useNavigate();

  const totalStock     = plantas.reduce((s, p) => s + p.stock, 0);
  const totalIngresos  = movimientos
    .filter(m => m.tipo === 'salida' && m.motivo === 'Venta')
    .reduce((s, m) => s + (m.total || 0), 0);
  const enfermas  = plantas.filter(p => p.estado === 'Enferma').length;
  const presentes = personal.filter(p => p.estado === 'Presente').length;

  const reportes = [
    {
      icon: '📦', title: 'Reporte de inventario',
      sub: `${plantas.length} tipos de plantas · Stock total: ${totalStock}`,
      accion: () => navigate('/plantas'),
    },
    {
      icon: '💰', title: 'Reporte de ventas',
      sub: `Ingresos totales: $${totalIngresos.toLocaleString()}`,
      accion: () => navigate('/ganancias'),
    },
    {
      icon: '🌡️', title: 'Plantas enfermas / bajas',
      sub: `${enfermas} ${enfermas === 1 ? 'planta afectada' : 'plantas afectadas'}`,
      accion: () => navigate('/plantas'),
    },
    {
      icon: '📋', title: 'Asistencia del personal',
      sub: `${presentes} de ${personal.length} presentes hoy`,
      accion: () => navigate('/personal'),
    },
    {
      icon: '📊', title: 'Análisis de ganancias',
      sub: 'Comparación por tipo de planta',
      accion: () => navigate('/ganancias'),
    },
    {
      icon: '📅', title: 'Historial de movimientos',
      sub: `${movimientos.length} movimientos registrados`,
      accion: () => navigate('/movimientos'),
    },
  ];

  return (
    <div className="app-shell">
      <div className="page-content">
        <nav className="top-nav">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
          <h1>Reportes</h1>
        </nav>

        <div className="screen">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total ingresos</div>
              <div className="stat-value green">${totalIngresos.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Stock total</div>
              <div className="stat-value">{totalStock}</div>
            </div>
          </div>

          <div className="section-header">
            <h3>Reportes disponibles</h3>
          </div>

          {reportes.map((r, i) => (
            <div key={i} className="report-card" onClick={r.accion}>
              <div className="report-icon">{r.icon}</div>
              <div className="report-info">
                <div className="report-title">{r.title}</div>
                <div className="report-sub">{r.sub}</div>
              </div>
              <span style={{ color: 'var(--green-700)', fontSize: 18 }}>›</span>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <button className="btn btn-outline" onClick={() => descargarReportePdf({ plantas, movimientos, personal })}>📥 Descargar PDF</button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
