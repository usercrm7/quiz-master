// Skor tablosu (Leaderboard) bileşeni
import React from 'react';

// roomId: Oda kodu (gerektiğinde kullanılabilir), scores: Skorlar dizisi
function Leaderboard({ roomId, scores }) {
  // Skorları azalan şekilde sırala
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  return (
    <div className="leaderboard">
      <h3>Skor Tablosu</h3>
      {/* Skorlar sıralı olarak listelenir */}
      <ol>
        {sortedScores.map((s, i) => (
          // Her oyuncunun kullanıcı adı (veya userId) ve skoru gösterilir
          <li key={i}>{s.username || s.userId}: {s.score}</li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;
