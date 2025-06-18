// Oyun bekleme (lobby) ekranı, PIN ile giriş ve zamanlayıcı
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';

const socket = io('${import.meta.env.BACKEND_URL}');

function Lobby() {
  const [seconds, setSeconds] = useState(30);
  const [players, setPlayers] = useState(1);
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh sonrası roomCode ve username'i localStorage'dan yükle
  useEffect(() => {
    // Eğer state yoksa localStorage'dan yükle
    if (!location.state) {
      const savedRoom = localStorage.getItem('lobbyRoomCode');
      const savedUser = localStorage.getItem('lobbyUsername');
      if (savedRoom && savedUser) {
        setRoomCode(savedRoom);
        setUsername(savedUser);
        setJoined(true);
        socket.emit('joinLobby', { roomCode: savedRoom, username: savedUser });
      }
    } else {
      // State varsa localStorage'a kaydet
      if (location.state.roomCode) localStorage.setItem('lobbyRoomCode', location.state.roomCode);
      if (location.state.username) localStorage.setItem('lobbyUsername', location.state.username);
    }
  }, [location.state]);

  // Oyun sahibi için roomCode location.state ile gelir
  useEffect(() => {
    if (location.state && location.state.roomCode) {
      setRoomCode(location.state.roomCode);
      socket.emit('startLobby', { roomCode: location.state.roomCode });
      setJoined(true);
    }
  }, [location.state]);

  // Katılımcı PIN ile giriş yaparsa
  const handleJoin = () => {
    if (roomCode && username) {
      localStorage.setItem('lobbyRoomCode', roomCode);
      localStorage.setItem('lobbyUsername', username);
      socket.emit('joinLobby', { roomCode, username });
      setJoined(true);
    }
  };

  // Lobby eventlerini dinle
  useEffect(() => {
    socket.on('lobbyStarted', ({ roomCode }) => {
      setRoomCode(roomCode);
    });
    socket.on('lobbyTimer', ({ seconds }) => {
      setSeconds(seconds);
    });
    socket.on('lobbyPlayers', ({ players }) => {
      setPlayers(players);
    });
    // LobbyEnd ile oyun başlarsa localStorage temizle
    socket.on('lobbyEnd', () => {
      localStorage.removeItem('lobbyRoomCode');
      localStorage.removeItem('lobbyUsername');
      navigate('/live-quiz', { state: { roomCode, username } });
    });
    return () => {
      socket.off('lobbyStarted');
      socket.off('lobbyTimer');
      socket.off('lobbyPlayers');
      socket.off('lobbyEnd');
    };
  }, [roomCode, username, navigate]);

  if (!joined) {
    // Katılımcı için PIN ve kullanıcı adı girişi
    return (
      <div className="card" style={{ padding: 32 }}>
        <h2>Oyun PIN'i ile Katıl</h2>
        <input placeholder="Oyun PIN" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} />
        <input placeholder="Kullanıcı Adı" value={username} onChange={e => setUsername(e.target.value)} style={{ marginLeft: 8 }} />
        <button onClick={handleJoin}>Odaya Katıl</button>
      </div>
    );
  }

  // Oyun sahibi ve katılımcılar için lobby ekranı
  // Oyun sahibi (quiz başlatan) için quiz sonlandır butonu göster
  const isOwner = localStorage.getItem('email') && location.state && location.state.isOwner;

  // Quiz'i sonlandırma fonksiyonu
  const handleEndQuiz = async () => {
    try {
      // Aktif quiz id'sini backend'den çekmek için roomCode ile quiz getir
      const res = await fetch(`${import.meta.env.BACKEND_URL}/api/quiz/room/${roomCode}`);
      const quiz = await res.json();
      if (quiz && quiz._id) {
        await fetch(`${import.meta.env.BACKEND_URL}/api/quiz/${quiz._id}/end`, { method: 'POST' });
        alert('Quiz sonlandırıldı.');
        // Odayı terk et ve ana sayfaya yönlendir
        localStorage.removeItem('lobbyRoomCode');
        localStorage.removeItem('lobbyUsername');
        navigate('/');
      }
    } catch {
      alert('Quiz sonlandırılamadı.');
    }
  };

  return (
    <div className="card" style={{ padding: 32 }}>
      <h2>Oyun Bekleme Odası</h2>
      <div style={{ fontSize: 22, marginBottom: 16 }}>PIN: <b>{roomCode}</b></div>
      <div>Katılımcı sayısı: {players}</div>
      <div style={{ margin: '16px 0', fontSize: 18 }}>Oyun {seconds} saniye sonra başlayacak...</div>
      <div style={{ color: '#888', fontSize: 14 }}>Arkadaşlarınıza PIN'i verin, onlar da katılsın!</div>
      {/* Sadece quiz sahibi için quiz sonlandır butonu */}
      {isOwner && (
        <button onClick={handleEndQuiz} style={{ marginTop: 18, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          Quizi Sonlandır
        </button>
      )}
    </div>
  );
}

export default Lobby;
