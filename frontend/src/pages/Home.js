import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import InsightsIcon from '@mui/icons-material/Insights';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizTitles, setQuizTitles] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('https://quiz-master-backend-p6bs.onrender.com/api/user/me', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(res => {
        setUser(res.data);
        setQuizHistory(res.data.quizHistory || []);
      });
    }
  }, []);

  useEffect(() => {
    async function fetchTitles() {
      const missing = quizHistory.filter(q => q.quizId && !quizTitles[q.quizId]);
      const promises = missing.map(q =>
        axios.get('https://quiz-master-backend-p6bs.onrender.com/api/quiz/' + q.quizId)
          .then(res => ({ id: q.quizId, title: res.data.title }))
          .catch(() => ({ id: q.quizId, title: 'Quiz bulunamadı' }))
      );
      const results = await Promise.all(promises);
      if (results.length > 0) {
        setQuizTitles(prev => {
          const updated = { ...prev };
          results.forEach(r => { updated[r.id] = r.title; });
          return updated;
        });
      }
    }
    if (quizHistory.length > 0) fetchTitles();
    // eslint-disable-next-line
  }, [quizHistory]);

  return (
    <div className="animated-bg">
      <div className="hero" style={{ textAlign: 'center', padding: '64px 16px 32px 16px', color: '#fff' }}>
        <h1 className="hero-title">QuizMaster'a Hoş Geldiniz</h1>
        <p className="hero-desc">
          Gerçek zamanlı quizler oluştur, katıl ve arkadaşlarınla yarış! Anında skor, canlı liderlik tablosu ve eğlenceli deneyim.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
          <button className="home-btn home-btn-primary" onClick={() => navigate('/quiz-create')}>
            <AddCircleIcon /> Quiz Oluştur
          </button>
          <button className="home-btn home-btn-secondary" onClick={() => navigate('/quiz-list')}>
            <PlayArrowIcon /> Quiz Katıl
          </button>
        </div>
      </div>
      <div className="features" style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', margin: '0 auto', maxWidth: 1100 }}>
        <div className="feature-card quiz-card" style={{ minWidth: 260, flex: 1, background: '#fff', color: '#222', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32, marginBottom: 32 }}>
          <EmojiEventsIcon style={{ fontSize: 48, color: '#ffd93d', marginBottom: 12 }} />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Gerçek Zamanlı Deneyim</h3>
          <p>Canlı quiz oturumları, anında sonuçlar ve gerçek zamanlı skor tablosu ile heyecanı yaşa.</p>
        </div>
        <div className="feature-card quiz-card" style={{ minWidth: 260, flex: 1, background: '#fff', color: '#222', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32, marginBottom: 32 }}>
          <GroupIcon style={{ fontSize: 48, color: '#6a11cb', marginBottom: 12 }} />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Çok Oyunculu Eğlence</h3>
          <p>Arkadaşlarınla veya dünyanın dört bir yanından katılımcılarla yarış.</p>
        </div>
        <div className="feature-card quiz-card" style={{ minWidth: 260, flex: 1, background: '#fff', color: '#222', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32, marginBottom: 32 }}>
          <InsightsIcon style={{ fontSize: 48, color: '#2575fc', marginBottom: 12 }} />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Analiz & İstatistik</h3>
          <p>Performansını takip et, sonuçlarını analiz et ve bilgi seviyeni artır.</p>
        </div>
      </div>
      {/* Eğer kullanıcı giriş yaptıysa quiz geçmişi gösterilir */}
      {user && (
        <div className="card" style={{ marginTop: 32 }}>
          <h3>Quiz Geçmişiniz</h3>
          {/* Hiç quiz geçmişi yoksa bilgilendirme */}
          {quizHistory.length === 0 && <div>Henüz quiz geçmişiniz yok.</div>}
          {/* Quiz geçmişi varsa listele */}
          {quizHistory.length > 0 && (
            <ol className="quiz-history-list">
              {quizHistory.slice().reverse().map((q, i) => (
                <li className="quiz-history-item" key={i}>
                  <span className="score">{q.score}</span>
                  <span><b>{quizTitles[q.quizId] || '...'}</b></span>
                  <span className="date">{new Date(q.date).toLocaleString('tr-TR')}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
