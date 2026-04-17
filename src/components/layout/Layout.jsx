import { Topbar, Sidebar } from './Navigation';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-anim">{children}</div>
        </main>
      </div>
    </div>
  );
}
