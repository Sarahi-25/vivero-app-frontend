import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi, logoutApi, getSavedUser,
  getPlantasApi, crearPlantaApi, actualizarPlantaApi, eliminarPlantaApi,
  getMovimientosApi, crearVentaApi, getPersonalApi,
} from '../services/api';

const AppContext = createContext(null);
const MOVIMIENTOS_MANUALES_KEY = 'vivero_movimientos_manuales';

function cargarMovimientosManuales() {
  try {
    return JSON.parse(localStorage.getItem(MOVIMIENTOS_MANUALES_KEY) || '[]');
  } catch {
    return [];
  }
}

function guardarMovimientosManuales(movimientos) {
  localStorage.setItem(MOVIMIENTOS_MANUALES_KEY, JSON.stringify(movimientos));
}

function ordenarMovimientos(lista) {
  return [...lista].sort((a, b) => {
    const fa = `${a.fecha || ''} ${a.hora || ''}`;
    const fb = `${b.fecha || ''} ${b.hora || ''}`;
    return fb.localeCompare(fa);
  });
}

/** Convierte un Product del backend al formato que usa vivero-app */
function backendToPlanta(p) {
  return {
    id:           p.id,
    nombre:       p.name,
    tipo:         p.tipo         || 'Ornamental',
    color:        p.color        || '',
    precioCompra: Number(p.purchasePrice || 0),
    precioVenta:  Number(p.price),
    stock:        Number(p.stock),
    estado:       p.estado       || 'Sana',
  };
}

/** Convierte una Sale del backend al formato de movimiento */
function backendToMovimiento(s) {
  return {
    id:       `venta-${s.id}`,
    tipo:     'salida',
    motivo:   'Venta',
    planta:   s.details?.[0]?.product?.name || '—',
    cantidad: s.details?.[0]?.quantity      || 0,
    total:    Number(s.total),
    fecha:    s.createdAt ? s.createdAt.slice(0, 10) : '',
    hora:     s.createdAt ? s.createdAt.slice(11, 16) : '',
  };
}

export function AppProvider({ children }) {
  const [plantas,     setPlantas]     = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [personal,    setPersonal]    = useState([]);
  const [usuario,     setUsuario]     = useState(getSavedUser);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // ── Cargar datos desde el backend cuando hay sesión ──────────────
  const cargarDatos = useCallback(async () => {
    if (!getSavedUser()) return;
    setLoading(true);
    try {
      const [prods, sales, personalBackend] = await Promise.all([
        getPlantasApi(),
        getMovimientosApi(),
        getPersonalApi(),
      ]);
      const ventasBackend = sales.map(backendToMovimiento);
      const manuales = cargarMovimientosManuales();
      setPlantas(prods.map(backendToPlanta));
      setMovimientos(ordenarMovimientos([...ventasBackend, ...manuales]));
      setPersonal(personalBackend);
    } catch (e) {
      setError('No se pudo conectar al servidor: ' + e.message);
      setMovimientos(cargarMovimientosManuales());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario, cargarDatos]);

  // ── Auth ──────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const user = await loginApi(email, password);
    setUsuario(user);
    return user;
  };

  const logout = () => {
    logoutApi();
    setUsuario(null);
    setPlantas([]);
    setMovimientos([]);
    setPersonal([]);
  };

  // ── Plantas ───────────────────────────────────────────────────────
  const agregarPlanta = async (planta) => {
    const payload = {
      name:  planta.nombre,
      price: planta.precioVenta,
      stock: planta.stock,
      purchasePrice: planta.precioCompra,
      tipo:   planta.tipo,
      color:  planta.color,
      estado: planta.estado,
    };
    const creada = await crearPlantaApi(payload);
    setPlantas(prev => [...prev, backendToPlanta(creada)]);
  };

  const actualizarPlanta = async (id, cambios) => {
    const payload = {
      name: cambios.nombre,
      price: cambios.precioVenta,
      stock: cambios.stock,
      purchasePrice: cambios.precioCompra,
      tipo: cambios.tipo,
      color: cambios.color,
      estado: cambios.estado,
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    const actualizada = await actualizarPlantaApi(id, payload);
    setPlantas(prev => prev.map(p => p.id === id ? backendToPlanta(actualizada) : p));
  };

  const eliminarPlanta = async (id) => {
    await eliminarPlantaApi(id);
    setPlantas(prev => prev.filter(p => p.id !== id));
  };

  // ── Movimientos ────────────────────────────────────────────────────
  const registrarMovimiento = async ({ tipo, motivo, planta: nombrePlanta, cantidad, fecha }) => {
    const planta = plantas.find(p => p.nombre === nombrePlanta);
    if (!planta) throw new Error('Planta no encontrada');

    if (tipo === 'salida' && motivo === 'Venta') {
      // Registrar venta real en el backend
      const venta = await crearVentaApi(usuario.id, planta.id, cantidad);
      const movimientoVenta = backendToMovimiento(venta);
      setMovimientos(prev => ordenarMovimientos([movimientoVenta, ...prev]));
      // El backend ya descuenta el stock; recargamos plants
      const prods = await getPlantasApi();
      setPlantas(prods.map(backendToPlanta));
    } else {
      // Actualizar stock vía PATCH y guardar el movimiento manual en localStorage
      const nuevoStock = tipo === 'salida'
        ? Math.max(0, planta.stock - cantidad)
        : planta.stock + cantidad;
      await actualizarPlantaApi(planta.id, { stock: nuevoStock });
      setPlantas(prev => prev.map(p =>
        p.id === planta.id ? { ...p, stock: nuevoStock } : p
      ));
      const mov = {
        id: `manual-${Date.now()}`,
        tipo,
        motivo,
        planta: nombrePlanta,
        cantidad,
        fecha: fecha || new Date().toISOString().slice(0, 10),
        hora:  new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };
      const manuales = [mov, ...cargarMovimientosManuales()];
      guardarMovimientosManuales(manuales);
      setMovimientos(prev => ordenarMovimientos([mov, ...prev]));
    }
  };

  // ── Personal ───────────────────────────────────────────────────────
  const registrarEntrada = (idPersonal) => {
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    setPersonal(prev => prev.map(p =>
      p.id === idPersonal ? { ...p, entrada: hora, estado: 'Presente' } : p
    ));
  };

  return (
    <AppContext.Provider value={{
      plantas, movimientos, personal, usuario, loading, error,
      login, logout,
      agregarPlanta, actualizarPlanta, eliminarPlanta,
      registrarMovimiento, registrarEntrada,
      recargar: cargarDatos,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
