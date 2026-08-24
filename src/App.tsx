import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingState } from './components/QueryState'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { MyDashboardPage } from './pages/MyDashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TeamPage } from './pages/TeamPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminPeriodsPage } from './pages/admin/AdminPeriodsPage'
import { AdminPlayerPage } from './pages/admin/AdminPlayerPage'
import { AdminPlayersPage } from './pages/admin/AdminPlayersPage'
import type { AppRole } from './types/app'

function ProtectedShell() {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loader"><LoadingState label="Marpunten gereedmaken…" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!user.active) return <Navigate to="/login" replace />
  return <AppShell />
}

function RoleRoute({ role, children }: { role: AppRole; children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/team'} replace />
  return children
}

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/team'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedShell />}>
        <Route index element={<HomeRedirect />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/me" element={<RoleRoute role="player"><MyDashboardPage /></RoleRoute>} />
        <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboardPage /></RoleRoute>} />
        <Route path="/admin/players" element={<RoleRoute role="admin"><AdminPlayersPage /></RoleRoute>} />
        <Route path="/admin/players/:id" element={<RoleRoute role="admin"><AdminPlayerPage /></RoleRoute>} />
        <Route path="/admin/periods" element={<RoleRoute role="admin"><AdminPeriodsPage /></RoleRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
