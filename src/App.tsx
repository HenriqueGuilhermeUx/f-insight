import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfessionalAccessGuard from './components/auth/ProfessionalAccessGuard';
import UserDataHydrator from './components/auth/UserDataHydrator';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import PremiumIndividual from './pages/PremiumIndividual';
import AdvisorsOffices from './pages/AdvisorsOffices';
import MarketToolPage from './pages/MarketToolPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DeleteAccount from './pages/DeleteAccount';
import DeleteData from './pages/DeleteData';
import LoggedArea from './pages/LoggedArea';
import DemoExperience from './pages/DemoExperience';
import LegalTerms from './pages/LegalTerms';
import OfficeOnboarding from './pages/OfficeOnboarding';
import PublicPortal from './pages/PublicPortal';
import ClientApp from './pages/ClientApp';
import AutomationOps from './pages/AutomationOps';
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
import FutureAI from './pages/FutureAI';
import ContactCenter from './pages/ContactCenter';
import ScheduledUpdatesHydrated from './pages/ScheduledUpdatesHydrated';
import DataOperations from './pages/DataOperations';
import Billing from './pages/Billing';
import InvitePage from './pages/InvitePage';
import Login from './pages/Login';

function Professional({ children }: { children: React.ReactNode }) {
  return <ProfessionalAccessGuard>{children}</ProfessionalAccessGuard>;
}

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <UserDataHydrator />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portal" element={<PublicPortal />} />
            <Route path="/assessores-escritorios" element={<AdvisorsOffices />} />
            <Route path="/premium" element={<PremiumIndividual />} />
            <Route path="/area-logada" element={<LoggedArea />} />
            <Route path="/cadastro-gratis" element={<Login />} />
            <Route path="/criar-conta" element={<Login />} />
            <Route path="/graham-valor" element={<MarketToolPage tool="graham" />} />
            <Route path="/screener-acoes" element={<MarketToolPage tool="screener" />} />
            <Route path="/backtesting" element={<MarketToolPage tool="backtesting" />} />
            <Route path="/precos" element={<Pricing />} />
            <Route path="/demo" element={<DemoExperience />} />
            <Route path="/termos" element={<LegalTerms />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
            <Route path="/excluir-conta" element={<DeleteAccount />} />
            <Route path="/deletar-conta" element={<DeleteAccount />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/excluir-dados" element={<DeleteData />} />
            <Route path="/deletar-dados" element={<DeleteData />} />
            <Route path="/delete-data" element={<DeleteData />} />
            <Route path="/aviso-educacional" element={<LegalTerms />} />
            <Route path="/onboarding" element={<OfficeOnboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<ClientApp />} />
            <Route path="/cliente/app" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><Professional><ClientApp /></Professional></ProtectedRoute>} />
            <Route path="/radar" element={<Radar />} />
            <Route path="/ativo/:ticker" element={<AssetDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/analises" element={<Analyses />} />
            <Route path="/alertas" element={<Alerts />} />
            <Route path="/macro" element={<MacroSignals />} />
            <Route path="/cadastro-escritorio" element={<RegisterOffice />} />
            <Route path="/convite/:token" element={<InvitePage />} />
            <Route path="/contato" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><Professional><ContactCenter /></Professional></ProtectedRoute>} />
            <Route path="/admin/contato" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><ContactCenter /></Professional></ProtectedRoute>} />
            <Route path="/admin/onboarding" element={<ProtectedRoute roles={['admin']}><OfficeOnboarding /></ProtectedRoute>} />
            <Route path="/admin/cobranca" element={<ProtectedRoute roles={['admin']}><Billing /></ProtectedRoute>} />
            <Route path="/admin/automacoes" element={<ProtectedRoute roles={['admin']}><Professional><AutomationOps /></Professional></ProtectedRoute>} />
            <Route path="/admin/atualizacoes" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><ScheduledUpdatesHydrated /></Professional></ProtectedRoute>} />
            <Route path="/admin/status-dados" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><DataOperations /></Professional></ProtectedRoute>} />
            <Route path="/assessor/acompanhamentos" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><AdvisorFollowUps /></Professional></ProtectedRoute>} />
            <Route path="/admin/acompanhamentos" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><AdvisorFollowUps /></Professional></ProtectedRoute>} />
            <Route path="/ia-financeira" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><FinancialCopilot /></ProtectedRoute>} />
            <Route path="/admin/ia-financeira" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><FinancialCopilot /></Professional></ProtectedRoute>} />
            <Route path="/meu-futuro" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><FutureAI /></ProtectedRoute>} />
            <Route path="/futuro-ia" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><FutureAI /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><ToolsHub /></ProtectedRoute>} />
            <Route path="/admin/insights" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><ToolsHub /></Professional></ProtectedRoute>} />
            <Route path="/white-label" element={<ProtectedRoute roles={['admin']}><Professional><WhiteLabelSettings /></Professional></ProtectedRoute>} />
            <Route path="/assessor" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><AdvisorWorkspace /></Professional></ProtectedRoute>} />
            <Route path="/cliente" element={<ProtectedRoute roles={['admin', 'advisor', 'client']}><Professional><ClientPortal /></Professional></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Professional><AdminDashboard /></Professional></ProtectedRoute>} />
            <Route path="/admin/assessores" element={<ProtectedRoute roles={['admin']}><Professional><AdminAdvisors /></Professional></ProtectedRoute>} />
            <Route path="/admin/clientes" element={<ProtectedRoute roles={['admin']}><Professional><AdminClients /></Professional></ProtectedRoute>} />
            <Route path="/admin/relatorios" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><AdminReports /></Professional></ProtectedRoute>} />
            <Route path="/admin/conteudos" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><AdminContents /></Professional></ProtectedRoute>} />
            <Route path="/admin/fabrica-conteudo" element={<ProtectedRoute roles={['admin', 'advisor']}><Professional><AdminContentFactory /></Professional></ProtectedRoute>} />
            <Route path="*" element={<Home />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
