import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MeusClientes from "./pages/MeusClientes";
import LeadsParados from "./pages/LeadsParados";
import Admin from "./pages/Admin";
import Atividades from "./pages/Atividades";
import { useProprietarioAtual } from "./hooks/useProprietarioAtual";

function RotaProtegida({ children }) {
  const { token, proprietarioId } = useProprietarioAtual();
  return token && proprietarioId ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<MeusClientes />} />
        <Route path="/leads" element={<LeadsParados />} />
        <Route path="/atividades" element={<Atividades />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
