"""
유튜브 플레이리스트 파서
- 플레이리스트 URL을 받아서 영상 정보를 추출
- CSV 파일로 저장 (title, artist, youtube_url, genre, hint, start_time)
"""

import csv
import re
import sys
import argparse
from pathlib import Path

try:
    from yt_dlp import YoutubeDL
except ImportError:
    print("yt-dlp가 설치되어 있지 않습니다.")
    print("설치 명령어: pip install yt-dlp")
    sys.exit(1)


def parse_title(title: str) -> tuple[str, str]:
    """
    영상 제목에서 가수와 노래 제목을 추출
    
    일반적인 패턴:
    - "가수 - 노래제목"
    - "노래제목 - 가수"
    - "가수 '노래제목'"
    - "[MV] 가수 - 노래제목"
    - "가수 - 노래제목 (Official MV)"
    """
    # 불필요한 태그 제거
    clean_title = title
    
    # [MV], (MV), [Official], (Official), [Lyrics], (Lyrics) 등 제거
    patterns_to_remove = [
        r'\[MV\]', r'\(MV\)', r'\[M/V\]', r'\(M/V\)',
        r'\[Official\s*(Music\s*)?(Video)?\]', r'\(Official\s*(Music\s*)?(Video)?\)',
        r'\[Lyrics?\]', r'\(Lyrics?\)',
        r'\[가사\]', r'\(가사\)',
        r'\[Audio\]', r'\(Audio\)',
        r'\[Live\]', r'\(Live\)',
        r'\[HD\]', r'\(HD\)',
        r'\[4K\]', r'\(4K\)',
        r'\[Official\s*Audio\]', r'\(Official\s*Audio\)',
        r'\[Official\s*Lyric\s*Video\]', r'\(Official\s*Lyric\s*Video\)',
    ]
    
    for pattern in patterns_to_remove:
        clean_title = re.sub(pattern, '', clean_title, flags=re.IGNORECASE)
    
    # 앞뒤 공백 및 중복 공백 제거
    clean_title = ' '.join(clean_title.split()).strip()
    
    artist = ""
    song_title = clean_title
    
    # 패턴 1: "가수 - 노래제목" 또는 "노래제목 - 가수"
    if ' - ' in clean_title:
        parts = clean_title.split(' - ', 1)
        # 첫 번째 부분이 가수일 가능성이 높음
        artist = parts[0].strip()
        song_title = parts[1].strip()
    
    # 패턴 2: "가수 | 노래제목"
    elif ' | ' in clean_title:
        parts = clean_title.split(' | ', 1)
        artist = parts[0].strip()
        song_title = parts[1].strip()
    
    # 패턴 3: "가수 '노래제목'" 또는 "가수 「노래제목」"
    elif "'" in clean_title or "'" in clean_title or "「" in clean_title:
        match = re.match(r"(.+?)\s*[''「](.+?)[''」]", clean_title)
        if match:
            artist = match.group(1).strip()
            song_title = match.group(2).strip()
    
    # 추가 정리: 괄호 안의 부가 정보 제거 (feat. 제외)
    # 예: "노래제목 (Remix)" -> "노래제목"
    song_title = re.sub(r'\s*\([^)]*(?<!feat\.)(?<!Feat\.)(?<!featuring)[^)]*\)\s*$', '', song_title)
    
    return song_title.strip(), artist.strip()


def get_playlist_videos(playlist_url: str, verbose: bool = False) -> list[dict]:
    """
    유튜브 플레이리스트에서 영상 정보 추출
    """
    videos = []
    
    ydl_opts = {
        'quiet': not verbose,
        'no_warnings': not verbose,
        'extract_flat': True,  # 메타데이터만 추출 (다운로드 안 함)
        'force_generic_extractor': False,
    }
    
    print(f"플레이리스트 정보 가져오는 중: {playlist_url}")
    
    with YoutubeDL(ydl_opts) as ydl:
        try:
            result = ydl.extract_info(playlist_url, download=False)
            
            if result is None:
                print("플레이리스트 정보를 가져올 수 없습니다.")
                return videos
            
            # 단일 영상인 경우
            if 'entries' not in result:
                videos.append({
                    'title': result.get('title', ''),
                    'url': result.get('webpage_url', result.get('url', '')),
                    'uploader': result.get('uploader', result.get('channel', '')),
                    'duration': result.get('duration', 0),
                })
            else:
                # 플레이리스트인 경우
                entries = result.get('entries', [])
                total = len(entries)
                
                print(f"총 {total}개의 영상 발견")
                
                for i, entry in enumerate(entries, 1):
                    if entry is None:
                        continue
                    
                    video_id = entry.get('id', '')
                    video_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else entry.get('url', '')
                    
                    videos.append({
                        'title': entry.get('title', ''),
                        'url': video_url,
                        'uploader': entry.get('uploader', entry.get('channel', '')),
                        'duration': entry.get('duration', 0),
                    })
                    
                    if verbose:
                        print(f"  [{i}/{total}] {entry.get('title', 'Unknown')}")
                
        except Exception as e:
            print(f"오류 발생: {e}")
    
    return videos


def save_to_csv(videos: list[dict], output_path: str, include_uploader_as_artist: bool = True):
    """
    영상 정보를 CSV 파일로 저장
    
    CSV 형식: title, youtube_url, artist, genre, hint, start_time
    """
    fieldnames = ['title', 'youtube_url', 'artist', 'genre', 'hint', 'start_time']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for video in videos:
            # 제목에서 가수와 노래 제목 파싱
            parsed_title, parsed_artist = parse_title(video['title'])
            
            # 가수 정보: 파싱된 것 또는 업로더 이름 사용
            artist = parsed_artist
            if not artist and include_uploader_as_artist:
                artist = video.get('uploader', '')
            
            # 노래 제목이 비어있으면 원본 제목 사용
            title = parsed_title if parsed_title else video['title']
            
            writer.writerow({
                'title': title,
                'youtube_url': video['url'],
                'artist': artist,
                'genre': '',  # 사용자가 직접 입력
                'hint': '',   # 사용자가 직접 입력
                'start_time': 0,
            })
    
    print(f"\n✅ CSV 파일 저장 완료: {output_path}")
    print(f"   총 {len(videos)}개의 영상 정보가 저장되었습니다.")


def main():
    parser = argparse.ArgumentParser(
        description='유튜브 플레이리스트를 CSV 파일로 변환합니다.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python playlist_parser.py "https://www.youtube.com/playlist?list=PLxxxxx"
  python playlist_parser.py "https://www.youtube.com/playlist?list=PLxxxxx" -o my_songs.csv
  python playlist_parser.py "https://www.youtube.com/playlist?list=PLxxxxx" -v
        """
    )
    
    parser.add_argument('url', help='유튜브 플레이리스트 URL')
    parser.add_argument('-o', '--output', default='songs.csv', help='출력 CSV 파일 경로 (기본값: songs.csv)')
    parser.add_argument('-v', '--verbose', action='store_true', help='상세 출력 모드')
    parser.add_argument('--no-uploader', action='store_true', help='업로더 이름을 가수로 사용하지 않음')
    
    args = parser.parse_args()
    
    # 플레이리스트 URL 검증
    if 'youtube.com' not in args.url and 'youtu.be' not in args.url:
        print("⚠️ 경고: 유튜브 URL이 아닌 것 같습니다.")
    
    # 영상 정보 가져오기
    videos = get_playlist_videos(args.url, verbose=args.verbose)
    
    if not videos:
        print("❌ 영상을 찾을 수 없습니다.")
        sys.exit(1)
    
    # CSV로 저장
    save_to_csv(videos, args.output, include_uploader_as_artist=not args.no_uploader)
    
    print("\n📝 CSV 파일을 열어서 다음 항목을 확인/수정하세요:")
    print("   - title: 노래 제목 (정답으로 인정될 텍스트)")
    print("   - artist: 가수/아티스트")
    print("   - genre: 장르 (선택)")
    print("   - hint: 힌트 (선택)")
    print("   - start_time: 재생 시작 시간 (초)")


if __name__ == "__main__":
    main()
