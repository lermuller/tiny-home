import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './app/Layout'
import { Login } from './app/routes/Login'
import { Hoje } from './app/routes/Hoje'
import { Quadro } from './app/routes/Quadro'
import { Compras } from './app/routes/Compras'
import { ComprasLista } from './app/routes/ComprasLista'
import { Casa } from './app/routes/Casa'
import { RequireAuth } from './features/auth/RequireAuth'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/hoje" replace />} />
        <Route path="/hoje" element={<Hoje />} />
        <Route path="/quadro" element={<Quadro />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/compras/:listId" element={<ComprasLista />} />
        <Route path="/casa" element={<Casa />} />
      </Route>
    </Routes>
  )
}
