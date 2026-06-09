import { useNavigate, useLocation } from 'react-router-dom';

const items = [
  { path: '/dashboard', icon: '🏠', label: 'Inicio' },
  { path: '/plantas',   icon: '🌿', label: 'Plantas' },
  { path: '/ganancias', icon: '📊', label: 'Ganancias' },
  { path: '/personal',  icon: '👥', label: 'Personal' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.path}
          className={`bn-item${pathname.startsWith(item.path) ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
          aria-label={item.label}
        >
          <span className="bn-icon">{item.icon}</span>
          <span className="bn-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
