import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
registerType: 'autoUpdate',
manifest: {
name: 'Mi Aplicación PWA',
short_name: 'MiPWA',
description: 'Aplicación Web Progresiva con React y Vite',
theme_color: '#ffffff',
background_color: '#ffffff',
display: 'standalone',
start_url: '/',
icons: [
{
src: 'icon-192.png',
sizes: '192x192',
type: 'image/png'
},
{
src: 'icon-512.png',
sizes: '512x512',
type: 'image/png'
}
]
}
})
  ],base:'/MADRA/'
})