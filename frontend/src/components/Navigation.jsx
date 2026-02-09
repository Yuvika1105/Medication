import { Home, Pill, ClipboardList, Stethoscope, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/medications', icon: Pill, label: 'Meds' },
    { path: '/tracker', icon: ClipboardList, label: 'Tracker' },
    { path: '/doctor', icon: Stethoscope, label: 'Doctor' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      <nav className="hidden md:block bg-white border-b-2 border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold font-lexend text-primary">MedBuddy</h1>
            </div>
            <div className="flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`flex items-center gap-2 text-lg font-medium transition-colors ${
                      isActive ? 'text-primary' : 'text-muted hover:text-primary'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-border shadow-lg z-40">
        <div className="flex items-center justify-around h-20 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 min-w-[60px] transition-colors ${
                  isActive ? 'text-primary' : 'text-muted'
                }`}
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}