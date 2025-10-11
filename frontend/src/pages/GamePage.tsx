import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '../components/CircularProgress';
import YouTubePlayer from '../components/YouTubePlayer';
import './GamePage.css';

interface Song {
  id: number;
  youtube_url: string;
  genre: string;
  hint: string | null;
  artist: string;
}

function GamePage() {
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [duration] = useState(30); // 30초 재생
  const [hintDelay] = useState(15); // 15초 후 힌트 표시
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCurrentSong();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const loadCurrentSong = async () => {
    try {
      const response = await axios.get('/api/game/current-song');
      setSong(response.data);
      startPlaying();
    } catch (error) {
      console.error('Failed to load song:', error);
      alert('노래를 불러오는데 실패했습니다.');
    }
  };

  const startPlaying = () => {
    setIsPlaying(true);
    setProgress(0);
    setShowHint(false);

    // 진행바 타이머
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          stopPlaying();
          return 100;
        }
        return prev + (100 / duration);
      });
    }, 1000);

    // 힌트 타이머
    hintTimerRef.current = setTimeout(async () => {
      setShowHint(true);
      try {
        await axios.post('/api/game/show-hint');
      } catch (error) {
        console.error('Failed to show hint:', error);
      }
    }, hintDelay * 1000);
  };

  const stopPlaying = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
  };

  // 치지직 채팅 연동 placeholder
  // TODO: 실제 치지직 API 연동 구현
  useEffect(() => {
    // 치지직 채팅에서 정답이 들어오면 이 함수가 호출되어야 함
    const handleChatAnswer = async (username: string, answer: string) => {
      try {
        const response = await axios.post('/api/game/check-answer', null, {
          params: { username, answer }
        });

        if (response.data.is_correct) {
          stopPlaying();
          navigate('/answer');
        }
      } catch (error) {
        console.error('Failed to check answer:', error);
      }
    };

    // 치지직 채팅 이벤트 리스너 등록 (추후 구현)
    // chzzkChat.on('message', handleChatAnswer);

    return () => {
      // 치지직 채팅 이벤트 리스너 해제
      // chzzkChat.off('message', handleChatAnswer);
    };
  }, [navigate]);

  if (!song) {
    return (
      <div className="game-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-content">
        <h2 className="game-title">노래를 맞춰보세요!</h2>

        <div className="progress-container" onClick={handleTogglePlay}>
          <CircularProgress
            progress={progress}
            isPlaying={isPlaying}
          />
        </div>

        <div className="info-section">
          <div className="genre-info">
            <span className="label">장르:</span>
            <span className="value">{song.genre}</span>
          </div>

          {showHint && song.hint && (
            <div className="hint-info">
              <span className="label">힌트:</span>
              <span className="value">{song.hint}</span>
            </div>
          )}
        </div>

        <div className="chat-info">
          <p>💬 채팅으로 정답을 입력해주세요!</p>
          <p className="chat-subinfo">치지직 채팅 연동 대기 중...</p>
        </div>

        {/* 숨겨진 YouTube 플레이어 */}
        <div style={{ display: 'none' }}>
          <YouTubePlayer
            url={song.youtube_url}
            playing={isPlaying}
            onEnded={stopPlaying}
          />
        </div>
      </div>
    </div>
  );
}

export default GamePage;
