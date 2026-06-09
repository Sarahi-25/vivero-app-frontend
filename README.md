# 🌱 Vivero App — Conectada al Backend NestJS

## ¿Qué cambió?

Esta versión conecta el frontend móvil al backend real (NestJS + MySQL del ProyectoIntegrador).

| Funcionalidad         | Antes              | Ahora                              |
|-----------------------|--------------------|------------------------------------|
| Login                 | Cualquier usuario  | Email + contraseña reales (JWT)    |
| Registro              | No existía         | ✅ Nuevo: crea cuenta desde la app |
| Plantas / inventario  | Datos en memoria   | ✅ MySQL vía `/products`           |
| Agregar planta        | Solo local         | ✅ Se guarda en la BD              |
| Ventas (salidas)      | Solo local         | ✅ Se registra en `/sales`         |
| Entradas de stock     | Solo local         | ✅ Actualiza stock vía PATCH       |
| Sesión                | Se pierde al cerrar| ✅ Persiste con JWT en localStorage|
| Personal / asistencia | Datos en memoria   | Sin cambio (backend no tiene módulo)|

---

## ⚙️ Configuración

### 1. Configura la URL del backend

Edita el archivo `src/services/api.js` y cambia la primera línea:

```js
// Desarrollo local (backend en tu misma PC)
const BASE_URL = 'http://localhost:3000';

// Red local (backend en otra PC de la misma red)
const BASE_URL = 'http://192.168.1.100:3000';   // ← IP de la PC con el backend

// Producción (servidor desplegado)
const BASE_URL = 'https://tu-servidor.com';
```

O usa una variable de entorno creando un archivo `.env` en la raíz del proyecto:

```
REACT_APP_API_URL=http://192.168.1.100:3000
```

---

### 2. Levanta el backend (ProyectoIntegrador)

```bash
cd backend-pi
npm install
# Edita src/app.module.ts con tu contraseña de MySQL
npm run start:dev
```

Asegúrate de que el backend tenga CORS habilitado (ya lo tiene con `app.enableCors()`).

---

### 3. Levanta el frontend

```bash
cd vivero-app
npm install
npm start
```

---

## 🌐 Acceso desde otro dispositivo

Para que **cualquiera en la red local** pueda registrarse y usar la app:

1. El backend debe correr con `--host 0.0.0.0` o simplemente `npm run start:dev`
2. Encuentra la IP de la PC del backend: `ipconfig` (Windows) o `ip a` (Linux/Mac)
3. Cambia `BASE_URL` en `api.js` a esa IP
4. El frontend también puede servirse con: `npm start -- --host 0.0.0.0`
5. Abre en cualquier celular o PC: `http://192.168.1.X:3000`

---

## 📋 Endpoints del backend usados

| Acción           | Método | Endpoint              |
|------------------|--------|-----------------------|
| Login            | POST   | `/auth/login`         |
| Registro         | POST   | `/users`              |
| Listar plantas   | GET    | `/products`           |
| Crear planta     | POST   | `/products`           |
| Actualizar stock | PATCH  | `/products/:id`       |
| Eliminar planta  | DELETE | `/products/:id`       |
| Listar ventas    | GET    | `/sales`              |
| Registrar venta  | POST   | `/sales`              |
