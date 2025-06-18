// Kullanıcı kayıt (register) sayfası
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../services/api';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Register() {
  // Kullanıcı adı, email, şifre ve hata mesajı için state'ler
  const [username, setUsername] = useState(''); // Kullanıcı adı
  const [email, setEmail] = useState(''); // Email
  const [password, setPassword] = useState(''); // Şifre
  const [error, setError] = useState(''); // Hata mesajı
  const navigate = useNavigate(); // Yönlendirme için hook

  // Form submit edildiğinde kayıt işlemini yapar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // API ile kayıt isteği gönder
      await register(username, email, password);
      // Kayıt başarılıysa otomatik giriş
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', email);
      alert('Kayıt ve giriş başarılı!');
      navigate('/'); // Ana sayfaya yönlendir
    } catch (err) {
      setError('Kayıt başarısız.'); // Hata mesajı göster
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
      minHeight: '100vh',
      padding: '32px 0',
    }}>
      <div className="card" style={{ maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', color: '#3b3b5c', fontWeight: 700, fontSize: 28, marginBottom: 24 }}>
          <PersonAddIcon style={{ marginRight: 10, color: '#6a11cb' }} /> Kayıt Ol
        </h2>
        {/* Kayıt formu */}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Kullanıcı Adı:</label><br />
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', padding: 8, marginBottom: 10 }} />
          </div>
          <div>
            <label>Email:</label><br />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', padding: 8, marginBottom: 10 }} />
          </div>
          <div>
            <label>Şifre:</label><br />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', padding: 8, marginBottom: 10 }} />
          </div>
          <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, width: '100%', marginTop: 10 }}>
            <PersonAddIcon style={{ marginRight: 4, fontSize: 18 }} /> Kayıt Ol
          </button>
        </form>
        {/* Hata mesajı varsa göster */}
        {error && <div className="error" style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

export default Register;
