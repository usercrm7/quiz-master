import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import QuizCreate from './pages/QuizCreate';
import LiveQuiz from './pages/LiveQuiz';
import PlayQuiz from './pages/PlayQuiz';
import Profile from './pages/Profile';
import Lobby from './pages/Lobby';
import AdminPanel from './pages/AdminPanel';
import QuizIcon from '@mui/icons-material/Quiz';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function App() {
  // Kullanıcı oturum bilgisini tutan state
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Kullanıcı rolü

  // Sayfa yüklendiğinde localStorage'dan kullanıcıyı kontrol et
  useEffect(() => {
    // JWT token ve email localStorage'dan alınır
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const userRole = localStorage.getItem('role');
    if (token && email) {
      setUser({ email }); // Kullanıcı oturumu varsa state'e yazılır
      setRole(userRole);
    } else {
      setUser(null); // Oturum yoksa kullanıcı null yapılır
      setRole(null);
    }
  }, []);

  // Çıkış yap butonu fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token'); // Token silinir
    localStorage.removeItem('email'); // Email silinir
    setUser(null); // Kullanıcı state'i sıfırlanır
    window.location.reload(); // Sayfa yenilenir
  };

  return (
    <Router>
      <div className="App">
        {/* Navigasyon menüsü */}
        <nav style={{ padding: '1rem', background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #0001', borderRadius: 12, margin: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Link to="/" style={{ marginRight: 18, color: '#fff', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, textDecoration: 'none' }}><HomeIcon style={{ marginRight: 4 }} /> Ana Sayfa</Link>
            <Link to="/quiz-list" style={{ marginRight: 18, color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><QuizIcon style={{ marginRight: 4 }} /> Quizler</Link>
            <Link to="/quiz-create" style={{ marginRight: 18, color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><AddCircleIcon style={{ marginRight: 4 }} /> Quiz Oluştur</Link>
            <Link to="/live-quiz" style={{ marginRight: 18, color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><LiveTvIcon style={{ marginRight: 4 }} /> Canlı Quiz</Link>
            {user && <Link to="/profile" style={{ marginRight: 18, color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><PersonIcon style={{ marginRight: 4 }} /> Profilim</Link>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            {/* Sadece admin rolü için admin sekmesi */}
            {user && role === 'admin' && (
              <Link to="/admin" style={{ marginRight: 18, color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><AdminPanelSettingsIcon style={{ marginRight: 4 }} /> Admin</Link>
            )}
            {!user && <><Link to="/login" style={{ marginRight: 10, color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><LoginIcon style={{ marginRight: 4 }} /> Giriş</Link>
            <Link to="/register" style={{ color: '#fff', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><PersonIcon style={{ marginRight: 4 }} /> Kayıt Ol</Link></>}
            {user && (
              <>
                <span style={{ marginLeft: 20, marginRight: 10, fontWeight: 'bold', color: '#fff', fontSize: 16 }}>{user.email}</span>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 16 }}><LogoutIcon style={{ marginRight: 4 }} /> Çıkış Yap</button>
              </>
            )}
          </div>
        </nav>
        {/* Sayfa yönlendirmeleri (routing) */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz-list" element={<QuizList />} />
          <Route path="/quiz-create" element={<QuizCreate />} />
          <Route path="/live-quiz" element={<LiveQuiz />} />
          <Route path="/play-quiz/:id" element={<PlayQuiz />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
