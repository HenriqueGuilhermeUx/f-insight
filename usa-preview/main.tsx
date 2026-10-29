import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import USPreview from '../src/pages/USPreview';

// No App, auth, router, PWA, Supabase or Brazilian product entrypoint imports.
createRoot(document.getElementById('root')!).render(
  <StrictMode><USPreview /></StrictMode>,
);
