// Canlı quiz odası ve gerçek zamanlı quiz akışı için ana bileşen
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { getQuizByRoomCode, saveQuizHistory } from '../services/api';
import Leaderboard from './Leaderboard';
import QuestionTimer from './QuestionTimer';
import { useLocation, useNavigate } from 'react-router-dom';

// Socket.io bağlantısı (backend ile gerçek zamanlı iletişim)
const socket = io('${import.meta.env.BACKEND_URL}');

// Arka plan müziği için basit bir mp3 dosyası (public klasörüne eklenmeli)
const MUSIC_URL = process.env.PUBLIC_URL + '/quiz-music.mp3';

function LiveQuiz() {
  // State'ler: oda kodu, kullanıcı adı, quiz objesi, sorular, skorlar, vs.
  const [roomCode, setRoomCode] = useState(''); // Oda kodu
  const [username, setUsername] = useState(""); // Kullanıcı adı
  const [joined, setJoined] = useState(false); // Odaya katılım durumu
  const [quiz, setQuiz] = useState(null); // Quiz objesi
  const [currentQ, setCurrentQ] = useState(0); // Şu anki soru indeksi
  const [question, setQuestion] = useState(null); // Şu anki soru
  const [answer, setAnswer] = useState(''); // Kullanıcının cevabı
  const [showTimer, setShowTimer] = useState(false); // Zamanlayıcı gösterilsin mi
  const [quizEnd, setQuizEnd] = useState(false); // Quiz bitti mi
  const [scores, setScores] = useState([]); // Skor tablosu
  const [waitingOthers, setWaitingOthers] = useState(false); // Diğer oyuncuları bekliyor muyuz?
  const [historySaved, setHistorySaved] = useState(false); // Skor geçmişi kaydedildi mi
  const userIdRef = useRef(socket.id); // Socket id referansı
  const location = useLocation();
  const navigate = useNavigate();
  // Arka plan müziği için ref ve state
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(true);

  // Socket eventleri: quiz akışını ve skorları yönetir
  useEffect(() => {
    // Yeni soru geldiğinde state güncellenir
    socket.on('question', ({ index, question }) => {
      setCurrentQ(index);
      setQuestion(question);
      setAnswer('');
      setShowTimer(true);
      setWaitingOthers(false); // Yeni soru gelince bekleme kalkar
    });
    // Cevap alındığında (isteğe bağlı kullanılabilir)
    socket.on('receiveAnswer', ({ userId, answer, isCorrect }) => {
      // İsterseniz cevapları listeleyebilirsiniz
    });
    // Skor tablosu güncellendiğinde
    socket.on('updateScores', (newScores) => {
      setScores(newScores);
    });
    // Quiz bittiğinde skorlar ve durum güncellenir
    socket.on('quizEnd', async ({ scores }) => {
      setQuizEnd(true);
      setScores(scores);
      setShowTimer(false);
      // Quiz geçmişini kaydet (sadece bir kez kaydetmek için kontrol ekle)
      if (!historySaved && quiz && username) {
        try {
          await saveQuizHistory({
            quizId: quiz._id,
            score: scores.find(s => s.username === username)?.score || 0,
            mode: 'canli',
            date: new Date().toISOString()
          });
          setHistorySaved(true);
        } catch (err) {
          // Hata yönetimi (opsiyonel bildirim)
          console.error('Quiz geçmişi kaydedilemedi:', err);
        }
      }
    });
    // Backend'den autoNextQuestion gelirse yeni soruya geç
    socket.on('autoNextQuestion', () => {
      socket.emit('nextQuestion', roomCode);
      setWaitingOthers(false); // Yeni soru tetiklenince bekleme kalkar
    });
    // LobbyEnd event'i ile quiz başlatılır
    socket.on('lobbyEnd', async () => {
      // Oda kodu ile quiz bilgisini backend'den çek
      const res = await getQuizByRoomCode(roomCode);
      setQuiz(res.data);
      setJoined(true);
      setQuizEnd(false);
      setTimeout(() => {
        socket.emit('getQuestion', roomCode);
      }, 300); // State güncellensin diye gecikme artırıldı
    });
    // Component unmount olduğunda eventler temizlenir
    return () => {
      socket.off('question');
      socket.off('receiveAnswer');
      socket.off('updateScores');
      socket.off('quizEnd');
      socket.off('autoNextQuestion');
      socket.off('lobbyEnd');
    };
  }, [roomCode]);

  // Odaya katılma fonksiyonu (artık sadece lobbyEnd sonrası kullanılacak)
  const joinRoom = async () => {
    if (roomCode && username) {
      // Sadece lobbyEnd ile başlatılacak, burada getQuestion tetiklenmeyecek
      setJoined(true);
      setQuizEnd(false);
      socket.emit('joinRoom', { roomCode, username });
    } else {
      alert('Oda kodu ve kullanıcı adı zorunludur!');
    }
  };

  // Lobby'den yönlendirme ile gelindiyse roomCode ve username state'ini al
  useEffect(() => {
    if (location.state && location.state.roomCode) {
      setRoomCode(location.state.roomCode);
    }
    if (location.state && location.state.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);

  // Cevap gönderme fonksiyonu
  const sendAnswer = (selected) => {
    if (roomCode && question) {
      socket.emit('sendAnswer', {
        roomCode,
        answer: selected,
        userId: userIdRef.current,
        username // username'i de gönder
      });
      setAnswer(selected);
      setShowTimer(false);
      setWaitingOthers(true); // Cevap verince diğer oyuncuları bekle
    }
  };

  // Soru süresi dolduğunda otomatik sonraki soruya geç
  const handleTimeout = () => {
    setShowTimer(false);
    setTimeout(() => {
      socket.emit('nextQuestion', roomCode);
    }, 1000);
  };
  

  // Odaya katılım yoksa katılım formunu göster
  if (!joined) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <h2>Canlı Quiz Odası</h2>
        <input placeholder="Oda Kodu" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
        <input placeholder="Kullanıcı Adı" value={username} onChange={e => setUsername(e.target.value)} style={{ marginLeft: 8 }} />
        <button onClick={joinRoom}>Odaya Katıl</button>
      </div>
    );
  }

  // Quiz bittiğinde skor tablosunu göster
  if (quizEnd) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <audio ref={audioRef} src={MUSIC_URL} autoPlay loop style={{ display: 'none' }} />
        <h2>Quiz Bitti!</h2>
        <Leaderboard roomId={roomCode} scores={scores} />
        <div style={{ marginTop: 24 }}>
          <button onClick={() => navigate('/')} style={{ marginRight: 12 }}>Ana Sayfa</button>
          <button onClick={() => navigate('/profile')}>Profilim / Geçmişim</button>
          <button style={{ marginLeft: 16 }} onClick={() => setMusicPlaying(p => !p)}>{musicPlaying ? 'Müziği Durdur' : 'Müziği Başlat'}</button>
        </div>
      </div>
    );
  }

  // Soru yükleniyorsa loading mesajı göster
  if (!question) return <div style={{ padding: 32 }}>Soru yükleniyor...</div>;

  // Quiz sırasında soru ve seçenekleri, zamanlayıcı ve skor tablosu göster
  return (
    <div className="quiz-card" style={{ padding: 32 }}>
      <audio ref={audioRef} src={MUSIC_URL} autoPlay loop style={{ display: 'none' }} />
      <h2>{quiz?.title || 'Canlı Quiz'}</h2>
      <button style={{ marginBottom: 12 }} onClick={() => setMusicPlaying(p => !p)}>{musicPlaying ? 'Müziği Durdur' : 'Müziği Başlat'}</button>
      <div style={{ marginBottom: 16 }}>
        <b>{question.text}</b>
        <ul>
          {question.options.map((opt, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <button
                disabled={!!answer}
                onClick={() => sendAnswer(opt)}
                style={{
                  opacity: answer && answer !== opt ? 0.5 : 1,
                  cursor: answer ? 'not-allowed' : 'pointer',
                  background: answer === opt ? '#050505' : undefined
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
        {/* Soru için zamanlayıcı */}
        {showTimer && <QuestionTimer duration={10} onTimeout={handleTimeout} />}
        {/* Kullanıcı cevabı */}
        {answer && <div className="success">Cevabınız: {answer}</div>}
        {/* Diğer oyuncuları bekleme mesajı */}
        {waitingOthers && <div style={{ color: '#888', marginTop: 12 }}>Diğer oyuncular bekleniyor...</div>}
      </div>
      {/* Skor tablosu */}
      <Leaderboard roomId={roomCode} scores={scores} />
    </div>
  );
}

export default LiveQuiz;
