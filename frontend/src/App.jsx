/**
 * App.jsx
 * =======
 * Root component for CRIS HMIS Voice Scribe.
 * Renders the enterprise header and the split-screen Dashboard.
 */

import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <Header />
      <Dashboard />
    </div>
  )
}
