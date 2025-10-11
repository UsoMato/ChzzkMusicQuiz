import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  url: string;
  playing?: boolean;
  controls?: boolean;
  onEnded?: () => void;
}

function YouTubePlayer({ url, playing = false, controls = false, onEnded }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = useRef<any>(null);

  // YouTube Video ID 추출
  const getVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(url);

  useEffect(() => {
    // YouTube IFrame API 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (playerInstanceRef.current) {
      if (playing) {
        playerInstanceRef.current.playVideo();
      } else {
        playerInstanceRef.current.pauseVideo();
      }
    }
  }, [playing]);

  const initializePlayer = () => {
    if (!videoId) return;

    playerInstanceRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: playing ? 1 : 0,
        controls: controls ? 1 : 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED && onEnded) {
            onEnded();
          }
        },
      },
    });
  };

  if (!videoId) {
    return <div>유효하지 않은 YouTube URL입니다.</div>;
  }

  return (
    <div className="youtube-player-container">
      <div id="youtube-player" ref={playerRef}></div>
    </div>
  );
}

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default YouTubePlayer;
