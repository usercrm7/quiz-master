// Tek başına quiz çözme (canlı olmayan mod) için sayfa
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById } from '../services/api';
import QuestionTimer from './QuestionTimer';
import { saveQuizHistory } from '../services/api';

// Arka plan müziği için basit bir mp3 dosyası (public klasörüne eklenmeli)
const MUSIC_URL = process.env.PUBLIC_URL + '/quiz-music.mp3';

function PlayQuiz() {
  // URL'den quiz id'sini al
  const { id } = useParams();
  const navigate = useNavigate();
  // Quiz objesi, mevcut soru, cevap ve zamanlayıcı için state'ler
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0); // Şu anki soru indeksi
  const [answer, setAnswer] = useState(''); // Kullanıcının cevabı
  const [showTimer, setShowTimer] = useState(true); // Zamanlayıcı gösterilsin mi
  const [historySaved, setHistorySaved] = useState(false);
  const correctCountRef = useRef(0);

  // Cevapları ve doğru sayısını takip etmek için bir dizi ekleyelim
  const [answers, setAnswers] = useState([]);

  // Arka plan müziği için ref ve state
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(true);

  // Sayfa yüklendiğinde quiz detayını backend'den çek
  useEffect(() => {
    getQuizById(id).then(res => setQuiz(res.data));
  }, [id]);

  // Cevap verildiğinde bir sonraki soruya geçiş
  const handleAnswer = (selected) => {
    setAnswer(selected);
    setShowTimer(false);
    setAnswers(prev => [...prev, selected]);
    setTimeout(() => {
      setCurrentQ(q => q + 1); // Sonraki soruya geç
      setAnswer('');
      setShowTimer(true);
    }, 1000);
  };

  // Süre dolduğunda otomatik sonraki soruya geçiş
  const handleTimeout = () => {
    setShowTimer(false);
    setAnswers(prev => [...prev, null]); // Cevap verilmediyse null ekle
    setTimeout(() => {
      setCurrentQ(q => q + 1);
      setAnswer('');
      setShowTimer(true);
    }, 1000);
  };

  // Quiz başladığında müziği başlat
  useEffect(() => {
    if (audioRef.current && musicPlaying) {
      audioRef.current.volume = 0.25;
      audioRef.current.play().catch(() => {});
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [musicPlaying]);

  // Quiz bitiminde geçmişi kaydet (koşul dışında, hook kuralına uygun)
  useEffect(() => {
    if (
      quiz &&
      answers.length === quiz.questions.length &&
      !historySaved
    ) {
      // Doğru cevap sayısını hesapla
      const correctCount = quiz.questions.reduce((acc, q, idx) => {
        if (answers[idx] && q.options[q.correctIndex] === answers[idx]) return acc + 1;
        return acc;
      }, 0);
      correctCountRef.current = correctCount;
      const token = localStorage.getItem('token');
      if (token && quiz._id) {
        saveQuizHistory(quiz._id, {
          score: correctCount,
          date: new Date(),
          mode: 'bireysel'
        }, token).finally(() => setHistorySaved(true));
      } else {
        setHistorySaved(true);
      }
    }
  }, [quiz, answers, historySaved]);

  // Quiz yükleniyorsa loading mesajı göster
  if (!quiz) return <div>Yükleniyor...</div>;
  // Tüm sorular bittiğinde quiz bitti mesajı ve yönlendirme butonları göster
  if (currentQ >= quiz.questions.length) return (
    <div style={{ padding: 32 }}>
      <audio ref={audioRef} src={MUSIC_URL} autoPlay loop style={{ display: 'none' }} />
      <h2>Quiz bitti!</h2>
      <div>Doğru sayınız: {correctCountRef.current} / {quiz.questions.length}</div>
      <button onClick={() => navigate('/')}>Ana Sayfa</button>
      <button style={{ marginLeft: 8 }} onClick={() => navigate('/profile')}>Profilim / Geçmişim</button>
      <button style={{ marginLeft: 16 }} onClick={() => setMusicPlaying(p => !p)}>{musicPlaying ? 'Müziği Durdur' : 'Müziği Başlat'}</button>
    </div>
  );

  // Mevcut soru
  const q = quiz.questions[currentQ];

  return (
    <div style={{ padding: 32 }}>
      <audio ref={audioRef} src={MUSIC_URL} autoPlay loop style={{ display: 'none' }} />
      <h2>{quiz.title}</h2>
      <button style={{ marginBottom: 12 }} onClick={() => setMusicPlaying(p => !p)}>{musicPlaying ? 'Müziği Durdur' : 'Müziği Başlat'}</button>
      <div style={{ marginBottom: 16 }}>
        <b>{q.text}</b>
        <ul>
          {q.options.map((opt, i) => (
            <li key={i}>
              <button
                disabled={!!answer}
                onClick={() => handleAnswer(opt)}
                style={{
                  opacity: answer && answer !== opt ? 0.5 : 1,
                  cursor: answer ? 'not-allowed' : 'pointer',
                  background: answer === opt ? '#d1e7dd' : undefined
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
        {answer && <div style={{ color: 'green' }}>Cevabınız: {answer}</div>}
      </div>
    </div>
  );
}

export default PlayQuiz;
