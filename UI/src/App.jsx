import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Client from './pages/Client';
import Transporter from './pages/Transporter';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex flex-col relative w-full overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/client" element={<Client />} />
            <Route path="/transporter" element={<Transporter />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
