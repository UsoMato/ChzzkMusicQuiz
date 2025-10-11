import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResultPage.css';

interface Player {
  username: string;
  score: number;
}

function ResultPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const response = await axios.get('/api/game/results');
      setPlayers(response.data);
    } catch (error) {
      console.error('Failed to load results:', error);
      alert('결과를 불러오는데 실패했습니다.');
    }
  };

  const handleRestart = () => {
    navigate('/');
  };

  return (
    <div className="result-page">
      <div className="result-content">
        <h2 className="result-title">🏆 게임 결과 🏆</h2>

        {players.length === 0 ? (
          <div className="no-players">
            <p>참가자가 없습니다.</p>
          </div>
        ) : (
          <div className="rankings">
            {players.map((player, index) => (
              <div
                key={player.username}
                className={`ranking-item ${index === 0 ? 'first-place' : ''}`}
              >
                <div className="rank-badge">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}위`}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.username}</span>
                  <span className="player-score">{player.score}점</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="restart-button" onClick={handleRestart}>
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
