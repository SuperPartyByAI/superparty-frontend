// Structură propusă pentru zona "angajat" (SuperParty)
// Poți copia fiecare bloc într-un fișier separat în proiectul tău sau poți rula
// acest fișier ca demo (un singur fișier), fără erori de sintaxă.
//
// ┌───────────────────────────────
// │ frontend/angajat
// ├── AngajatApp.tsx             // Acest fișier (single-file demo)
// ├── (opțional) AngajatRoutes.tsx, layout/, pages/, types.ts dacă îl rupi pe fișiere
// └── ...

// IMPORTANT:
// - În varianta "TOTUL într-un singur fișier" folosim O SINGURĂ importare de React mai jos.
// - Pentru a evita eroarea "useRoutes() may be used only in the context of a <Router>",
//   în această variantă single-file ÎNFĂȘURĂM toate <Routes> într-un <BrowserRouter> local.
//
// TESTE MANUALE ("test cases")
// 1. Deschide aplicația: ar trebui să vezi formularul de login la /angajat/login.
// 2. Login cu email "admin@superparty.ro" → după submit, să apară layout-ul cu Admin Panel în meniu
//    și să poți accesa /angajat/admin.
// 3. Login cu email "gm@superparty.ro" → să apară GM Panel în meniu și ruta /angajat/gm.
// 4. Login cu orice alt email valid → să apară Dashboard + KYC în meniu, fără Admin / GM.
// 5. Bifează "Doresc să fiu șofer" în KYC → să apară secțiunea suplimentară cu textul
//    "Upload permis + cazier (de implementat)".
// 6. Apasă "Logout" din layout → ar trebui să revii la ecranul de login.

// ===============================
// Importuri comune (varianta single-file demo)
// ===============================

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';

// ===============================
// Tipuri de user
// ===============================

export type UserRole = 'USER' | 'ADMIN' | 'GM';

export interface User {
  role: UserRole;
  email: string;
  username?: string;
  kyc_status?: boolean;
}

// ===============================
// Layout principal pentru zona angajat
// ===============================

interface AngajatLayoutProps {
  currentUser: User | null;
  onLogout: () => void;
}

const AngajatLayout: React.FC<AngajatLayoutProps> = ({ currentUser, onLogout }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a', color: '#f1f5f9' }}>
      <aside
        style={{
          width: 260,
          padding: 24,
          borderRight: '1px solid #1f2937',
          background: 'rgba(15,23,42,0.95)',
        }}
      >
        <h2 style={{ fontSize: 24, marginBottom: 24 }}>🎉 SuperParty</h2>
        {currentUser && (
          <div style={{ marginBottom: 24, fontSize: 14, opacity: 0.8 }}>
            <div>{currentUser.username || currentUser.email}</div>
            <div>Rol: {currentUser.role}</div>
          </div>
        )}

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>
              <Link to="/angajat/dashboard">🏠 Dashboard</Link>
            </li>
            <li>
              <Link to="/angajat/kyc">🪪 KYC</Link>
            </li>
            {currentUser?.role === 'ADMIN' && (
              <li>
                <Link to="/angajat/admin">🔒 Admin Panel</Link>
              </li>
            )}
            {currentUser?.role === 'GM' && (
              <li>
                <Link to="/angajat/gm">👑 GM Panel</Link>
              </li>
            )}
          </ul>
        </nav>

        {currentUser && (
          <button
            style={{
              marginTop: 32,
              padding: '10px 16px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(239,68,68,0.9)',
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={onLogout}
          >
            🚪 Logout
          </button>
        )}
      </aside>

      <main style={{ flex: 1, padding: 32 }}>
        <Outlet />
      </main>
    </div>
  );
};

// ===============================
// Pagina de Login
// ===============================

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // TODO: înlocuiește cu apel real la backend
    try {
      if (email === 'admin@superparty.ro') {
        onLoginSuccess({ role: 'ADMIN', email, username: 'Admin Super', kyc_status: true });
      } else if (email === 'gm@superparty.ro') {
        onLoginSuccess({ role: 'GM', email, username: 'GM Boss', kyc_status: true });
      } else {
        onLoginSuccess({ role: 'USER', email, username: 'User Normal', kyc_status: false });
      }
    } catch (err) {
      setError('Email sau parolă greșită');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          borderRadius: 24,
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid #334155',
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 24, textAlign: 'center' }}>🎉 SuperParty Login</h1>
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              border: '1px solid rgba(239,68,68,0.5)',
              background: 'rgba(239,68,68,0.2)',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #475569',
                background: 'rgba(15,23,42,0.7)',
                color: '#f1f5f9',
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #475569',
                background: 'rgba(15,23,42,0.7)',
                color: '#f1f5f9',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 999,
              border: 'none',
              background:
                'linear-gradient(135deg, rgba(102,126,234,1) 0%, rgba(118,75,162,1) 100%)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            {loading ? 'Se încarcă...' : '🔓 Intră în aplicație'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ===============================
// Pagina de Register
// ===============================

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: apel real la backend (register)
    alert('Cont creat (mock)');
  };

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          padding: 32,
          borderRadius: 24,
          background: '#ffffff',
          color: '#111827',
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 24, textAlign: 'center' }}>✨ Înregistrează-te</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            ✨ Creează cont
          </button>
        </form>
      </div>
    </div>
  );
};

// ===============================
// Pagina de KYC
// ===============================

const KycPage: React.FC = () => {
  const [contract, setContract] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: trimite datele la backend
    alert('KYC complet (mock)');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>🪪 KYC Onboarding</h1>
      <form onSubmit={handleSubmit}>
        <section
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 16,
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid #334155',
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>📄 Contract de colaborare</h2>
          <label
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={contract}
              onChange={(e) => setContract(e.target.checked)}
            />
            <span>Am citit și accept contractul de colaborare SuperParty</span>
          </label>
        </section>

        <section
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 16,
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid #334155',
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>👤 Documente de identitate</h2>
          <p style={{ fontSize: 14, opacity: 0.8 }}>Buletin + Selfie cu buletinul</p>
          {/* TODO: input-uri reale type="file" */}
        </section>

        <section
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 16,
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid #334155',
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>🚗 Doresc să fiu șofer</h2>
          <label
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isDriver}
              onChange={(e) => setIsDriver(e.target.checked)}
            />
            <span>DA, vreau să fiu și șofer</span>
          </label>
          {isDriver && (
            <div style={{ marginTop: 16, fontSize: 14, opacity: 0.8 }}>
              {/* TODO: upload permis + cazier */}
              Upload permis + cazier (de implementat)
            </div>
          )}
        </section>

        <button
          type="submit"
          style={{
            padding: '12px 20px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🚀 Finalizează onboarding
        </button>
      </form>
    </div>
  );
};

// ===============================
// Dashboard
// ===============================

const DashboardPage: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header
        style={{
          padding: 24,
          borderRadius: 24,
          marginBottom: 24,
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid #334155',
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>👋 Bine ai venit!</h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>Dashboard în construcție</p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
          <h3 style={{ fontSize: 20, marginBottom: 4 }}>Task-uri azi</h3>
          <p style={{ fontSize: 14, opacity: 0.8 }}>0 task-uri programate</p>
        </div>
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <h3 style={{ fontSize: 20, marginBottom: 4 }}>Profit luna asta</h3>
          <p style={{ fontSize: 14, opacity: 0.8 }}>0 RON</p>
        </div>
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
          <h3 style={{ fontSize: 20, marginBottom: 4 }}>Rating</h3>
          <p style={{ fontSize: 14, opacity: 0.8 }}>5.0 / 5.0</p>
        </div>
      </section>
    </div>
  );
};

// ===============================
// Admin Page
// ===============================

const AdminPage: React.FC = () => {
  // TODO: înlocuiește cu date reale din backend
  const users = [
    { username: 'User Normal', email: 'user@superparty.ro', status: 'active', is_driver: true },
    { username: 'Admin Super', email: 'admin@superparty.ro', status: 'pending', is_driver: false },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <header
        style={{
          padding: 24,
          borderRadius: 24,
          marginBottom: 24,
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid #334155',
        }}
      >
        <h1 style={{ fontSize: 32 }}>🔒 Admin Panel</h1>
      </header>

      <section
        style={{
          padding: 24,
          borderRadius: 24,
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid #334155',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #334155' }}>
                Nume
              </th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #334155' }}>
                Email
              </th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #334155' }}>
                Status
              </th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #334155' }}>
                Șofer
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email}>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #1f2937' }}>{u.username}</td>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #1f2937' }}>{u.email}</td>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #1f2937' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      background: u.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)',
                      color: u.status === 'active' ? '#22c55e' : '#fbbf24',
                    }}
                  >
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '10px 8px', borderBottom: '1px solid #1f2937' }}>
                  {u.is_driver ? '🚗 DA' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

// ===============================
// GM Page
// ===============================

const GmPage: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header
        style={{
          padding: 24,
          borderRadius: 24,
          marginBottom: 24,
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid #334155',
        }}
      >
        <h1 style={{ fontSize: 32 }}>👑 GM Panel</h1>
        <p style={{ fontSize: 14, opacity: 0.8 }}>
          Aici poți pune statistici, rapoarte, overview global.
        </p>
      </header>
    </div>
  );
};

// ===============================
// Router pentru zona angajat
// ===============================

const AngajatRoutes: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    // Zona de auth (fără layout de angajat)
    return (
      <Routes>
        <Route path="/angajat/login" element={<LoginPage onLoginSuccess={setCurrentUser} />} />
        <Route path="/angajat/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/angajat/login" replace />} />
      </Routes>
    );
  }

  // User logat → toate paginile sub layout-ul Angajat
  return (
    <Routes>
      <Route element={<AngajatLayout currentUser={currentUser} onLogout={handleLogout} />}>
        <Route path="/angajat/dashboard" element={<DashboardPage />} />
        <Route path="/angajat/kyc" element={<KycPage />} />
        {currentUser.role === 'ADMIN' && <Route path="/angajat/admin" element={<AdminPage />} />}
        {currentUser.role === 'GM' && <Route path="/angajat/gm" element={<GmPage />} />}
        <Route path="*" element={<Navigate to="/angajat/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

// ===============================
// Rădăcina demo-ului single-file (înfășoară totul într-un <BrowserRouter>)
// ===============================

const AngajatApp: React.FC = () => {
  return (
    <BrowserRouter>
      <AngajatRoutes />
    </BrowserRouter>
  );
};

export default AngajatApp;
