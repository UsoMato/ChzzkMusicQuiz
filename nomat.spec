# -*- mode: python ; coding: utf-8 -*-
"""
노래 맞추기 게임 PyInstaller 스펙 파일
빌드 명령: pyinstaller nomat.spec
"""

import sys
import os

block_cipher = None

# 현재 디렉토리
spec_dir = os.path.dirname(os.path.abspath(SPEC))

a = Analysis(
    ['launcher.py'],
    pathex=[spec_dir],
    binaries=[],
    datas=[
        # frontend/dist 폴더를 번들에 포함
        ('frontend/dist', 'frontend/dist'),
    ],
    hiddenimports=[
        'main',
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'fastapi',
        'starlette',
        'pydantic',
        'chzzkpy',
        'chzzkpy.unofficial',
        'chzzkpy.unofficial.chat',
        'dotenv',
        'requests',
        'anyio',
        'anyio._backends',
        'anyio._backends._asyncio',
        'httptools',
        'websockets',
        'watchfiles',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='NoMatGame',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # GUI 앱이므로 콘솔 창 숨김
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # 아이콘 파일이 있으면 'icon.ico' 지정
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='NoMatGame',
)

# 빌드 출력 디렉토리 설정
# PyInstaller는 기본적으로 spec 파일 위치에 build/와 dist/ 폴더를 생성합니다.
