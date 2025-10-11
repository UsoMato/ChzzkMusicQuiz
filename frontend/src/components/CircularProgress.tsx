import './CircularProgress.css';

interface CircularProgressProps {
  progress: number;
  isPlaying: boolean;
}

function CircularProgress({ progress, isPlaying }: CircularProgressProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-progress">
      <svg width="200" height="200">
        {/* 배경 원 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="10"
        />
        {/* 진행 원 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4facfe" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>
        </defs>
      </svg>

      <div className="progress-content">
        {isPlaying ? (
          <div className="playing-icon">
            <div className="pause-icon">⏸</div>
            <p className="progress-text">일시정지</p>
          </div>
        ) : (
          <div className="paused-icon">
            <div className="play-icon">▶</div>
            <p className="progress-text">재생</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CircularProgress;
