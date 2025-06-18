// API istekleri için servis fonksiyonları
import axios from 'axios';

// Backend API ana adresi
const API_URL = '${import.meta.env.BACKEND_URL}/api';

// Kullanıcı kaydı (register)
// username, email ve password ile yeni kullanıcı oluşturur
export const register = (username, email, password) =>
  axios.post(`${API_URL}/auth/register`, { username, email, password });

// Kullanıcı girişi (login)
// email ve password ile giriş yapar, JWT token döner
export const login = (email, password) =>
  axios.post(`${API_URL}/auth/login`, { email, password });

// Tüm quizleri getirir
export const getQuizzes = () =>
  axios.get(`${API_URL}/quiz`);

// Yeni quiz oluşturur (JWT token zorunlu)
export const createQuiz = (quiz, token) =>
  axios.post(`${API_URL}/quiz`, quiz, {
    headers: { Authorization: 'Bearer ' + token }
  });

// Belirli bir quizin detayını getirir
export const getQuizById = (id) =>
  axios.get(`${API_URL}/quiz/${id}`);

// Oda kodu ile aktif quiz getirir (canlı quiz için)
export const getQuizByRoomCode = (roomCode) =>
  axios.get(`${API_URL}/quiz/room/${roomCode}`);

// Quiz güncelle (PUT)
export const updateQuiz = (id, quiz, token) =>
  axios.put(`${API_URL}/quiz/${id}`, quiz, {
    headers: { Authorization: 'Bearer ' + token }
  });

// Quiz sil (DELETE)
export const deleteQuiz = (id, token) =>
  axios.delete(`${API_URL}/quiz/${id}`, {
    headers: { Authorization: 'Bearer ' + token }
  });

// Quiz geçmişi kaydet (bireysel veya canlı, mode parametresi ile)
export const saveQuizHistory = (quizId, data, token) =>
  axios.post(`${API_URL}/quiz/${quizId}/history`, data, {
    headers: { Authorization: 'Bearer ' + token }
  });
