import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadSiteContent, startLiveContent } from './content/siteContent';
import { useContentVersion } from './content/useContentVersion';
import { registerAppServiceWorker } from './pwa';
import './styles/index.css';

// Re-renders the site when admin-saved content changes while it is open (no reload).
function Root() {
  useContentVersion();
  return <App />;
}

const render = () =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );

registerAppServiceWorker();

// The admin panel reads its own data; the shop applies admin-saved content first, then keeps it current.
if (window.location.pathname.startsWith('/admin')) render();
else
  loadSiteContent().finally(() => {
    render();
    startLiveContent();
  });
