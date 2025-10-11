import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './IntroPage.css';

function IntroPage() {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      // 게임 시작 API 호출
      await axios.post('/api/game/start');
      navigate('/game');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('게임 시작에 실패했습니다.');
    }
  };

  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1 className="intro-title">🎵 노래 맞추기 🎵</h1>
        <p className="intro-subtitle">치지직 스트리머와 함께하는 음악 퀴즈</p>
        <button className="start-button" onClick={handleStart}>
          게임 시작
        </button>
      </div>
    </div>
  );
}

export default IntroPage;
