import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonalApi, crearPersonalApi, actualizarPersonalApi, eliminarPersonalApi } from '../services/api';
import BottomNav from '../components/BottomNav';

const ROLES   = ['Empleado', 'Empleada', 'Supervisor', 'Supervisora', 'Cajero', 'Cajera', 'Jardinero', 'Jardinera', 'Administrativo'];
const TURNOS  = ['Matutino', 'Vespertino', 'Nocturno', 'Completo'];
const ESTADOS = ['Activo', 'Inactivo', 'Vacaciones', 'Baja'];

function estadoBadge(estado) {
  const colores = { Activo: 'badge-green', Inactivo: 'badge-red', Vacaciones: 'badge-amber', Baja: 'badge-red' };
  return <span className={`badge ${colores[estado] || 'badge-green'}`}>{estado}</span>;
}

const formVacio = {
  name: '', email: '', password: '', telefono: '',
  rol: 'Empleado', turno: 'Matutino', estado: 'Activo',
  direccion: '', fechaIngreso: new Date().toISOString().slice(0, 10),
};

export default function Personal() {
  const navigate  = useNavigate();
  const [personal,    setPersonal]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [exito,       setExito]       = useState('');
  const [vista,       setVista]       = useState('lista'); // 'lista' | 'nuevo' | 'editar'
  const [form,        setForm]        = useState(formVacio);
  const [editandoId,  setEditandoId]  = useState(null);
  const [guardando,   setGuardando]   = useState(false);
  const [busqueda,    setBusqueda]    = useState('');

  useEffect(() => { cargarPersonal(); }, []);

  const cargarPersonal = async () => {
    setLoading(true);
    try {
      const data = await getPersonalApi();
      setPersonal(data);
    } catch (e) {
      setError('No se pudo cargar el personal: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const abrirNuevo = () => {
    setForm(formVacio);
    setEditandoId(null);
    setError('');
    setVista('nuevo');
  };

  const abrirEditar = (p) => {
    setForm({
      name:         p.name        || '',
      email:        p.email       || '',
      password:     '',
      telefono:     p.telefono    || '',
      rol:          p.rol         || 'Empleado',
      turno:        p.turno       || 'Matutino',
      estado:       p.estado      || 'Activo',
      direccion:    p.direccion   || '',
      fechaIngreso: p.fechaIngreso || '',
    });
    setEditandoId(p.id);
    setError('');
    setVista('editar');
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      if (vista === 'nuevo') {
        await crearPersonalApi(form);
        setExito('✅ Personal registrado correctamente');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await actualizarPersonalApi(editandoId, payload);
        setExito('✅ Datos actualizados correctamente');
      }
      await cargarPersonal();
      setVista('lista');
      setTimeout(() => setExito(''), 2500);
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await eliminarPersonalApi(id);
      setPersonal(prev => prev.filter(p => p.id !== id));
      setExito('✅ Personal eliminado');
      setTimeout(() => setExito(''), 2000);
    } catch (e) {
      setError('No se pudo eliminar: ' + e.message);
    }
  };

  const lista = personal.filter(p =>
    p.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.rol?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const activos   = personal.filter(p => p.estado === 'Activo').length;
  const inactivos = personal.filter(p => p.estado !== 'Activo').length;

  // ── Formulario ─────────────────────────────────────────────────────
  if (vista === 'nuevo' || vista === 'editar') {
    return (
      <div className="app-shell">
        <div className="page-content">
          <nav className="top-nav">
            <button className="back-btn" onClick={() => setVista('lista')}>←</button>
            <h1>{vista === 'nuevo' ? 'Registrar personal' : 'Editar personal'}</h1>
          </nav>
          <div className="screen">
            {error && <div className="alert alert-red">⚠️ {error}</div>}

            <form onSubmit={guardar}>
              <div className="section-header"><h3>Datos personales</h3></div>

              <div className="form-group">
                <label>Nombre completo *</label>
                <input required placeholder="Ej. María López"
                  value={form.name} onChange={set('name')} />
              </div>

              <div className="form-group">
                <label>Correo electrónico *</label>
                <input required type="email" placeholder="correo@ejemplo.com"
                  value={form.email} onChange={set('email')} />
              </div>

              <div className="form-group">
                <label>{vista === 'nuevo' ? 'Contraseña *' : 'Nueva contraseña (dejar vacío para no cambiar)'}</label>
                <input type="password" placeholder="Mínimo 6 caracteres"
                  required={vista === 'nuevo'}
                  value={form.password} onChange={set('password')} />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input placeholder="Ej. 81-1234-5678"
                  value={form.telefono} onChange={set('telefono')} />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input placeholder="Calle, colonia, ciudad"
                  value={form.direccion} onChange={set('direccion')} />
              </div>

              <div className="section-header"><h3>Datos laborales</h3></div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol / Puesto</label>
                  <select value={form.rol} onChange={set('rol')}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Turno</label>
                  <select value={form.turno} onChange={set('turno')}>
                    {TURNOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado</label>
                  <select value={form.estado} onChange={set('estado')}>
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de ingreso</label>
                  <input type="date"
                    value={form.fechaIngreso} onChange={set('fechaIngreso')} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? '⏳ Guardando...' : vista === 'nuevo' ? '✅ Registrar personal' : '✅ Guardar cambios'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setVista('lista')}>
                ✕ Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Lista ──────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <div className="page-content">
        <nav className="top-nav">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
          <h1>Personal</h1>
          <button className="nav-icon" onClick={abrirNuevo}>➕</button>
        </nav>

        <div className="screen">
          {exito && <div className="alert alert-green">{exito}</div>}
          {error && <div className="alert alert-red">⚠️ {error}</div>}
          {loading && <div className="alert alert-green">⏳ Cargando personal...</div>}

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total personal</div>
              <div className="stat-value green">{personal.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Activos</div>
              <div className="stat-value green">{activos}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Inactivos</div>
              <div className="stat-value">{inactivos}</div>
            </div>
          </div>

          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Buscar por nombre o rol..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>

          {lista.length === 0 && !loading ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>No hay personal registrado</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={abrirNuevo}>
                ➕ Registrar primer empleado
              </button>
            </div>
          ) : lista.map(p => (
            <div key={p.id} className="list-item">
              <div className="list-icon green">👤</div>
              <div className="list-info" style={{ cursor: 'pointer' }} onClick={() => abrirEditar(p)}>
                <div className="item-name">{p.name}</div>
                <div className="item-sub">{p.rol} · Turno {p.turno}</div>
                <div className="item-sub">{p.telefono || p.email}</div>
              </div>
              <div className="list-right">
                {estadoBadge(p.estado || 'Activo')}
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, marginTop: 4 }}
                  onClick={() => eliminar(p.id, p.name)}>🗑️</button>
              </div>
            </div>
          ))}

          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={abrirNuevo}>
            👤 Registrar nuevo empleado
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
