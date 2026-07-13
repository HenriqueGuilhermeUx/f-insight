import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import DemoExperience from './pages/DemoExperience';
import LegalTerms from './pages/LegalTerms';
import OfficeOnboarding from './pages/OfficeOnboarding';
import ClientApp from './pages/ClientApp';
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
import AdvisorFollowUps from './pages/AdvisorFollowUps';
import RegisterOffice from './pages/RegisterOffice';
import AdminDashboard from './pages/AdminDashboard';
import AdminAdvisors from './pages/AdminAdvisors';
import AdminClients from './pages/AdminClients';
import AdminReports from './pages/AdminReports';
import AdminContents from './pages/AdminContents';
import AdminContentFactory from './pages/AdminContentFactory';
import ToolsHub from './pages/ToolsHub';
import FinancialCopilot from './pages/FinancialCopilot';
import ContactCenter from './pages/ContactCenter';
import ScheduledUpdates from './pages/ScheduledUpdates';
import DataOperations from './pages/DataOperations';
import Billing from './pages/Billing';
import InvitePage from './pages/InvitePage';
import Login from './pages/Login';

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/precos" element={<Pricing />} />
            <Route path="/demo" element={<DemoExperience />} />
            <Route path="/termos" element={<LegalTerms />} />
            <Route path="/privacidade" element={<LegalTerms />} />
            <Route path="/aviso-educacional" element={<LegalTerms />} />
            <Route path="/onboarding" element={<OfficeOnboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><ClientApp /></ProtectedRoute>} />
            <Route path="/cliente/app" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><ClientApp /></ProtectedRoute>} />
            <Route path="/radar" element={<Radar />} />
            <Route path="/ativo/:ticker" element={<AssetDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/analises" element={<Analyses />} />
            <Route path="/alertas" element={<Alerts />} />
            <Route path="/macro" element={<MacroSignals />} />
            <Route path="/cadastro-escritorio" element={<RegisterOffice />} />
            <Route path="/convite/:token" element={<InvitePage />} />
            <Route path="/contato" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><ContactCenter /></ProtectedRoute>} />
            <Route path="/admin/contato" element={<ProtectedRoute roles={['admin', 'advisor']}><ContactCenter /></ProtectedRoute>} />
            <Route path="/admin/onboarding" element={<ProtectedRoute roles={['admin']}><OfficeOnboarding /></ProtectedRoute>} />
            <Route path="/admin/cobranca" element={<ProtectedRoute roles={['admin']}><Billing /></ProtectedRoute>} />
            <Route path="/admin/atualizacoes" element={<ProtectedRoute roles={['admin', 'advisor']}><ScheduledUpdates /></ProtectedRoute>} />
            <Route path="/admin/status-dados" element={<ProtectedRoute roles={['admin', 'advisor']}><DataOperations /></ProtectedRoute>} />
            <Route path="/assessor/acompanhamentos" element={<ProtectedRoute roles={['admin', 'advisor']}><AdvisorFollowUps /></ProtectedRoute>} />
            <Route path="/admin/acompanhamentos" element={<ProtectedRoute roles={['admin', 'advisor']}><AdvisorFollowUps /></ProtectedRoute>} />
            <Route path="/ia-financeira" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><FinancialCopilot /></ProtectedRoute>} />
            <Route path="/admin/ia-financeira" element={<ProtectedRoute roles={['admin', 'advisor']}><FinancialCopilot /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><ToolsHub /></ProtectedRoute>} />
            <Route path="/admin/insights" element={<ProtectedRoute roles={['admin', 'advisor']}><ToolsHub /></ProtectedRoute>} />
            <Route path="/white-label" element={<ProtectedRoute roles={['admin']}><WhiteLabelSettings /></ProtectedRoute>} />
            <Route path="/assessor" element={<ProtectedRoute roles={['admin', 'advisor']}><AdvisorWorkspace /></ProtectedRoute>} />
            <Route path="/cliente" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><ClientPortal /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/assessores" element={<ProtectedRoute roles={['admin']}><AdminAdvisors /></ProtectedRoute>} />
            <Route path="/admin/clientes" element={<ProtectedRoute roles={['admin']}><AdminClients /></ProtectedRoute>} />
            <Route path="/admin/relatorios" element={<ProtectedRoute roles={['admin', 'advisor']}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/conteudos" element={<ProtectedRoute roles={['admin', 'advisor']}><AdminContents /></ProtectedRoute>} />
            <Route path="/admin/fabrica-conteudo" element={<ProtectedRoute roles={['admin', 'advisor']}><AdminContentFactory /></ProtectedRoute>} />
            <Route path="*" element={<Home />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
