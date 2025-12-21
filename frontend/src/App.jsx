import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavDrawer from './components/NavDrawer';
import Home from './pages/Home';
import Vocabulary from './pages/Vocabulary';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [songLyrics, setLyrics] = useState('');

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <Router>
      <div className="app">
        <NavDrawer isOpen={drawerOpen} onClose={closeDrawer} />
        
        <Routes>
          <Route
            path="/"
            element={<Home 
              translation={translation}
              setTranslation={setTranslation}
              songLyrics={songLyrics}
              setLyrics={setLyrics}
              onMenuClick={toggleDrawer} />}
          />
          <Route
            path="/vocabulary"
            element={<Vocabulary onMenuClick={toggleDrawer} />}
          />
          <Route
            path="/profile"
            element={<Profile onMenuClick={toggleDrawer} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
