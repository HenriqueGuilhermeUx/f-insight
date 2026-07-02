import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TenantProvider } from './context/TenantContext';
import Home from './pages/Home';
import Radar from './pages/Radar';
import AssetDetails from './pages/AssetDetails';
import Watchlist from './pages/Watchlist';
import News from './pages/News';
import Analyses from './pages/Analyses';
import Alerts from './pages/Alerts';
import MacroSignals from './pages/MacroSignals';
import WhiteLabelSettings from './pages/WhiteLabelSettings';

function App() {
  return (
    <TenantProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/radar" element={<Radar />} />
          <Route path="/ativo/:ticker" element={<AssetDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/noticias" element={<News />} />
          <Route path="/analises" element={<Analyses />} />
          <Route path="/alertas" element={<Alerts />} />
          <Route path="/macro" element={<MacroSignals />} />
          <Route path="/white-label" element={<WhiteLabelSettings />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </TenantProvider>
  );
}

export default App;
