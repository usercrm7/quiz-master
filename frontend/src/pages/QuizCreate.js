// Quiz oluşturma sayfası (kullanıcı quiz ve sorularını ekler)
import React, { useState } from 'react';
import axios from 'axios';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function QuizCreate() {
  // Quiz başlığı, açıklama ve sorular için state'ler
  const [title, setTitle] = useState(''); // Quiz başlığı
  const [description, setDescription] = useState(''); // Quiz açıklaması
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctIndex: 0 }
  ]); // Soru dizisi

  // Soru metni veya doğru şık değiştiğinde çağrılır
  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    if (field === 'text') updated[idx].text = value;
    else if (field.startsWith('option')) updated[idx].options[parseInt(field[6])] = value;
    else if (field === 'correctIndex') updated[idx].correctIndex = parseInt(value);
    setQuestions(updated);
  };

  // Belirli bir sorunun şıklarından biri değiştiğinde çağrılır
  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  // Doğru şık işaretlendiğinde çağrılır
  const handleCorrectChange = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].correctIndex = optIdx;
    setQuestions(updated);
  };

  // Yeni soru ekler
  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }]);
  };

  // Form submit edildiğinde quiz backend'e kaydedilir
  const handleSubmit = async (e) => {
    e.preventDefault();
    // JWT token ile backend'e gönderilecek (şimdilik token yoksa hata verir)
    try {
      await axios.post('${import.meta.env.BACKEND_URL}/api/quiz', {
        title,
        description,
        questions
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      alert('Quiz oluşturuldu!');
      setTitle('');
      setDescription('');
      setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0 }]);
    } catch {
      alert('Quiz oluşturulamadı. Giriş yapmış olmalısınız.');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
      minHeight: '100vh',
      padding: '32px 0',
    }}>
      <div className="card" style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', color: '#3b3b5c', fontWeight: 700, fontSize: 28, marginBottom: 24 }}>
          <AddCircleIcon style={{ marginRight: 10, color: '#6a11cb' }} /> Quiz Oluştur
        </h2>
        {/* Quiz oluşturma formu */}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Başlık:</label><br />
            <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', padding: 8, marginBottom: 10 }} />
          </div>
          <div>
            <label>Açıklama:</label><br />
            <input value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', padding: 8, marginBottom: 10 }} />
          </div>
          <h4 style={{ color: '#3b3b5c', marginTop: 18 }}>Sorular</h4>
          {/* Her soru için giriş alanları */}
          {questions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 16, background: '#f7f8fa', borderRadius: 8, padding: 12 }}>
              <b>Soru {idx + 1}:</b><br />
              <input value={q.text} onChange={e => handleQuestionChange(idx, 'text', e.target.value)} placeholder="Soru metni" required style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', padding: 8, marginBottom: 8 }} />
              <div style={{ marginTop: 6 }}>
                {q.options.map((opt, i) => (
                  <span key={i} style={{ display: 'inline-block', marginRight: 8 }}>
                    <input value={opt} onChange={e => handleOptionChange(idx, i, e.target.value)} placeholder={`Seçenek ${i + 1}`} required style={{ width: 120, borderRadius: 8, border: '1px solid #ddd', padding: 6 }} />
                    <input type="radio" name={`correct-${idx}`} checked={q.correctIndex === i} onChange={() => handleCorrectChange(idx, i)} />
                    <span style={{ fontSize: 13, color: '#888' }}>Doğru</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} style={{ background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, marginRight: 8 }}>
            <AddCircleIcon style={{ marginRight: 4, fontSize: 18 }} /> Soru Ekle
          </button>
          <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600 }}>Quiz Oluştur</button>
        </form>
      </div>
    </div>
  );
}

export default QuizCreate;
