import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>Job Portal demo — REST API via json-server. Run <code>npm run dev:full</code>.</p>
      </footer>
    </div>
  );
}
