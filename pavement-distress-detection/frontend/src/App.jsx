import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import DetectionPage from './pages/DetectionPage'
import ComparisonPage from './pages/ComparisonPage'
import HistoryPage from './pages/HistoryPage'

function Navbar() {
  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link-active' : 'nav-link'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-base">
            PaveScan<span className="text-brand-600">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass} id="nav-detect">Detection</NavLink>
          <NavLink to="/compare" className={linkClass} id="nav-compare">Comparison</NavLink>
          <NavLink to="/history" className={linkClass} id="nav-history">History</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DetectionPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
