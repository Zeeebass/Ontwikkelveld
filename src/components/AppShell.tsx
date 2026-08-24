import { Gauge, LogOut, Settings2, ShieldCheck, Target, UsersRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BrandMark } from './BrandMark'

type NavItem = { to: string; label: string; icon: typeof Gauge; end?: boolean }

const playerLinks: NavItem[] = [
  { to: '/team', label: 'Team', icon: UsersRound },
  { to: '/me', label: 'Mijn groei', icon: Target },
]

const adminLinks: NavItem[] = [
  { to: '/team', label: 'Team', icon: UsersRound },
  { to: '/admin', label: 'Overzicht', icon: Gauge, end: true },
  { to: '/admin/players', label: 'Spelers', icon: ShieldCheck },
  { to: '/admin/periods', label: 'Perioden', icon: Settings2 },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const links = user?.role === 'admin' ? adminLinks : playerLinks
  return (
    <div className="app-shell">
      <aside className="side-rail">
        <NavLink to={user?.role === 'admin' ? '/admin' : '/team'} className="side-rail__brand"><BrandMark /></NavLink>
        <nav className="side-rail__nav" aria-label="Hoofdnavigatie">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>
              <Icon aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-rail__account">
          <span className="account-dot" aria-hidden="true" />
          <div><strong>{user?.fullName}</strong><span>{user?.role === 'admin' ? 'Admin' : 'Speler'}</span></div>
          <button type="button" className="icon-button" onClick={() => void signOut()} aria-label="Uitloggen"><LogOut /></button>
        </div>
      </aside>

      <header className="mobile-header"><BrandMark /><button className="icon-button" type="button" onClick={() => void signOut()} aria-label="Uitloggen"><LogOut /></button></header>
      <main className="app-main"><Outlet /></main>
      <nav className="mobile-nav" aria-label="Mobiele navigatie">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`}>
            <Icon aria-hidden="true" /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
