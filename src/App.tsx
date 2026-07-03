import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Radar from './pages/Radar';
import AssetDetails from './pages/AssetDetails';
import Watchlist from './pages/Watchlist';
import News from './pages/News';
import Analyses from './pages/Analyses';
import Alerts from './pages/Alerts';
import MacroSignals from './pages/MacroSignals';
import WhiteLabelSettings from './pages/WhiteLabelSettings';
import ClientPortal from './pages/ClientPortal';
import AdvisorWorkspace from './pages/AdvisorWorkspace';
import RegisterOffice from './pages/RegisterOffice';
import AdminDashboard from './pages/AdminDashboard';
import AdminAdvisors from './pages/AdminAdvisors';
import AdminClients from './pages/AdminClients';
import AdminReports from './pages/AdminReports';
import InvitePage from './pages/InvitePage';
import Login from './pages/Login';

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/radar" element={<Radar />} />
            <Route path="/ativo/:ticker" element={<AssetDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/analises" element={<Analyses />} />
            <Route path="/alertas" element={<Alerts />} />
            <Route path="/macro" element={<MacroSignals />} />
            <Route path="/white-label" element={<WhiteLabelSettings />} />
            <Route path="/assessor" element={<AdvisorWorkspace />} />
            <Route path="/cliente" element={<ClientPortal />} />
            <Route path="/cadastro-escritorio" element={<RegisterOffice />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/assessores" element={<AdminAdvisors />} />
            <Route path="/admin/clientes" element={<AdminClients />} />
            <Route path="/admin/relatorios" element={<AdminReports />} />
            <Route path="/convite/:token" element={<InvitePage />} />
            <Route path="*" element={<Home />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
