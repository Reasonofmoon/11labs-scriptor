<div align="center">

# ReadMaster AI

### AI-Powered Immersive Audio Tutoring Platform

텍스트를 붙여넣으면 AI가 대본을 생성하고, ElevenLabs TTS가 실감나는 오디오 강의로 변환합니다.
동화 낭독부터 수능 영어 지문 해설까지 -- 듣기만 해도 학습이 되는 오디오 튜터링.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs_TTS-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjUiIHk9IjMiIHdpZHRoPSIzIiBoZWlnaHQ9IjE4Ii8+PHJlY3QgeD0iMTYiIHk9IjMiIHdpZHRoPSIzIiBoZWlnaHQ9IjE4Ii8+PC9zdmc+&logoColor=white)](https://elevenlabs.io/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-A855F7?style=for-the-badge)](LICENSE)

</div>

---

## 🧠 Philosophy

> **"읽기는 수동적이다. 듣기는 능동적이다."**

기존 학습 도구는 텍스트를 보여주기만 합니다. ReadMaster AI는 텍스트를 **AI 튜터가 해설하는 오디오 드라마**로 변환합니다.
LLM이 교육학적으로 구조화된 대본을 생성하고, ElevenLabs의 감정 표현이 가능한 TTS가 실제 강사처럼 들리는 음성을 만들어냅니다.

| | 기존 TTS 도구 | 일반 AI 튜터 | **ReadMaster AI** |
|---|---|---|---|
| 텍스트 분석 | -- | LLM 요약 | LLM 시맨틱 청킹 + 대본 생성 |
| 음성 품질 | 로봇 음성 | 없음 | ElevenLabs 감정 TTS |
| 효과음(SFX) | -- | -- | 자동 삽입 (마법, 페이지 넘김 등) |
| 튜터 페르소나 | -- | 범용 챗봇 | 민희쌤(동화) / 달쌤(수능) |
| 실시간 시각화 | -- | -- | Web Audio API 파형 비주얼라이저 |
| 내보내기 | 단일 MP3 | -- | TXT / JSON / SRT 자막 |

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client · React 19 + Framer Motion"]
        UI[Page UI<br/>모드 선택 · 텍스트 입력 · 난이도 설정]
        VS[VoiceSelector<br/>ElevenLabs 음성 · 모델 선택]
        SD[ScriptDisplay<br/>실시간 하이라이트 스크롤]
        VIZ[Visualizer<br/>Canvas 파형 렌더링]
        SEQ[AudioSequencer<br/>순차 재생 · 프리페치 · 캐시]
    end

    subgraph Server["⚙️ Server · Next.js 16 API Routes"]
        SA[generateScriptAction<br/>Server Action]
        API_AUDIO[/api/generate-audio<br/>TTS 프록시]
        API_VOICE[/api/voices<br/>음성 목록 · 1h 캐시]
    end

    subgraph External["☁️ External APIs"]
        GEMINI[Google Gemini 2.5 Flash]
        GPT[OpenAI GPT-4o-mini<br/>폴백]
        ELEVEN[ElevenLabs TTS API]
    end

    subgraph Lib["📦 Core Library"]
        SG[script-generator<br/>시맨틱 청킹 엔진]
        AC[audio-cache<br/>Blob + URL 이중 캐시]
        AP[audio-player<br/>AudioContext · AnalyserNode]
        EX[export-utils<br/>TXT · JSON · SRT 내보내기]
    end

    UI --> SG
    SG --> SA
    SA --> GEMINI
    SA -.->|폴백| GPT
    SG -.->|LLM 실패 시| SG

    UI --> SEQ
    SEQ --> API_AUDIO
    API_AUDIO --> ELEVEN
    VS --> API_VOICE
    API_VOICE --> ELEVEN

    SEQ --> AC
    SEQ --> AP
    AP --> VIZ
    SEQ --> SD
    SEQ --> EX
```

---

## ✨ Layer Features & Wow Moments

### 📖 Story Mode -- 민희쌤과 떠나는 이야기 여행
- 동화/소설 텍스트를 붙여넣으면 **친근한 민희쌤 페르소나**가 해설하는 오디오 드라마로 변환
- `[giggles]`, `[whispers]`, `[excited]` 등 **감정 태그**를 TTS에 전달하여 실감나는 낭독
- 마법 반짝임, 페이지 넘김 등 **SFX 자동 삽입**으로 몰입감 극대화
- 에메랄드 그라데이션 테마 + 바운스 애니메이션

### 🎓 Exam Mode -- 달쌤의 1등급 수능 영어 분석
- 수능/모의고사 영어 지문을 붙여넣으면 **카리스마 달쌤 페르소나**가 구조 분석
- 빈칸 추론, 주제/요지, 글의 순서, 문장 삽입, 내용 일치, 어법/어휘 등 **6대 문제 유형** 지원
- 필자 의도 파악 포인트와 정답 단서를 **한국어로 해설** + 원문은 영어로 낭독
- 앰버 그라데이션 테마 + 학습 집중 UI

### 🎵 Audio Sequencer -- 끊김 없는 순차 재생
- 스크립트 아이템을 **순차적으로 재생**하며 현재 항목을 실시간 하이라이트
- **2-item Prefetch** -- 다음 2개 오디오를 미리 요청하여 버퍼링 없는 연속 재생
- **Blob + URL 이중 캐시** -- 같은 오디오를 재생성하지 않아 API 크레딧 절약
- ElevenLabs API 실패 시 **브라우저 SpeechSynthesis 자동 폴백** -- 재생이 멈추지 않음

### 📊 Real-time Visualizer -- 오디오를 눈으로 보다
- **Web Audio API AnalyserNode**로 주파수 데이터를 실시간 추출
- Canvas에 모드별 색상(에메랄드/앰버) 그라데이션 바 차트 렌더링
- 재생 중이 아닐 때는 정적 미니 파형 표시

### 📤 Multi-format Export -- 만들어진 콘텐츠를 활용하다
- **TXT** -- 번호 매긴 대본 텍스트 (인쇄용)
- **JSON** -- 스크립트 아이템 구조화 데이터 (타 시스템 연동, 2차 가공)
- **SRT** -- 실제 오디오 길이 기반 타임코드 자막 (영상 편집 소프트웨어 연동)

---

## 🚀 Getting Started

### Starter -- 5분 안에 로컬 실행

```bash
# 1. 클론
git clone https://github.com/Reasonofmoon/11labs-scriptor.git
cd 11labs-scriptor

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열고 최소 ELEVENLABS_API_KEY를 입력하세요

# 4. 개발 서버 실행
npm run dev
```

> `http://localhost:3000`에서 텍스트를 붙여넣고 **Generate Immersive Audio** 클릭!

### Professional -- LLM 대본 생성 활성화

```bash
# .env에 LLM API 키 추가 (둘 중 하나만 있어도 동작)
ELEVENLABS_API_KEY=your_elevenlabs_key     # 필수: TTS 음성 생성
GOOGLE_GEMINI_API_KEY=your_gemini_key      # 권장: Gemini 2.5 Flash AI 대본 생성
OPENAI_API_KEY=your_openai_key             # 선택: GPT-4o-mini 폴백
```

| 구성 | 동작 |
|---|---|
| ElevenLabs만 | TTS 음성 생성 + 내장 Mock 대본 (LLM 없이도 동작) |
| + Gemini | Gemini 2.5 Flash가 교육학적 대본을 자동 생성 |
| + OpenAI | Gemini 키가 없을 때 GPT-4o-mini로 폴백 |
| 모두 없음 | Mock 대본 + 브라우저 SpeechSynthesis 폴백 |

### Enterprise -- Vercel 프로덕션 배포

```bash
# Vercel CLI로 원클릭 배포
npx vercel

# 또는 GitHub 연동 자동 배포
# Vercel Dashboard > Import > Reasonofmoon/11labs-scriptor
# Environment Variables에 API 키 등록 후 Deploy
```

자세한 배포 가이드는 [`DEPLOY.md`](DEPLOY.md)를 참조하세요.

---

## ⚙️ Customization

| 항목 | 파일 | 설명 |
|---|---|---|
| 튜터 페르소나 | `src/app/actions.ts` | `systemPrompt`의 Persona 섹션 수정 |
| 기본 음성 ID | `src/app/api/generate-audio/route.ts` | `VOICE_ID_MINHEE`, `VOICE_ID_DAL` 상수 변경 |
| TTS 모델 목록 | `src/components/VoiceSelector.tsx` | `models` 배열에 새 모델 추가/제거 |
| 청킹 크기 | `src/lib/script-generator.ts` | `targetMinWords`, `targetMaxWords` 값 조정 |
| SFX 종류 | `src/lib/script-generator.ts` | Mock 대본의 SFX `content` 문자열 수정 |
| 테마 색상 | `src/app/page.tsx` | `themeColor`, `bgGradient` 변수 수정 |
| 다크/라이트 모드 | `src/app/globals.css` | CSS 변수 `--background`, `--foreground` |
| 난이도 레벨 | `src/lib/types.ts` | `DifficultyLevel` 유니온 타입에 레벨 추가 |
| 수능 문제 유형 | `src/lib/types.ts` | `ProblemType` 유니온 타입 확장 |

---

## 📁 Project Structure

```
11labs-scriptor/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # 메인 UI (모드 전환, 입력, 재생, 내보내기)
│   │   ├── actions.ts                # Server Action (Gemini/OpenAI 대본 생성)
│   │   ├── layout.tsx                # Geist 폰트, 메타데이터
│   │   ├── globals.css               # Tailwind v4 + 다크모드 CSS 변수
│   │   └── api/
│   │       ├── generate-audio/
│   │       │   └── route.ts          # ElevenLabs TTS 프록시 API
│   │       └── voices/
│   │           └── route.ts          # ElevenLabs 음성 목록 API (1시간 캐시)
│   ├── components/
│   │   ├── AudioSequencer.tsx        # 순차 재생 엔진 + 프리페치 + 폴백
│   │   ├── ScriptDisplay.tsx         # 실시간 하이라이트 대본 뷰 (Framer Motion)
│   │   ├── Visualizer.tsx            # Web Audio API 파형 시각화
│   │   └── VoiceSelector.tsx         # 음성 · 모델 드롭다운 셀렉터
│   └── lib/
│       ├── types.ts                  # Mode, DifficultyLevel, ScriptItem 타입 정의
│       ├── script-generator.ts       # 시맨틱 청킹 + Mock 대본 + LLM 연동
│       ├── llm-service.ts            # LLM 클라이언트 (Server Action으로 이관됨)
│       ├── audio-cache.ts            # Blob + ObjectURL 이중 캐시
│       ├── audio-player.ts           # HTMLAudioElement + AudioContext 래퍼
│       └── export-utils.ts           # TXT / JSON / SRT 내보내기 유틸
├── .env.example                      # 환경 변수 템플릿 (API 키 3종)
├── .gitignore                        # .env* 패턴으로 시크릿 보호
├── DEPLOY.md                         # Vercel 배포 가이드
├── package.json                      # Next.js 16, React 19, Framer Motion
└── tsconfig.json                     # TypeScript strict 설정
```

---

## 📊 Numbers

| 지표 | 값 |
|---|---|
| 소스 파일 | 14개 |
| 핵심 컴포넌트 | 4개 (AudioSequencer, ScriptDisplay, Visualizer, VoiceSelector) |
| API 라우트 | 2개 (`/api/generate-audio`, `/api/voices`) |
| 지원 TTS 모델 | 5종 (Eleven v3, Turbo v2.5, Flash v2.5, Multilingual v2, English v1) |
| 지원 LLM | 2종 (Gemini 2.5 Flash, GPT-4o-mini) + Mock 폴백 |
| 내보내기 포맷 | 3종 (TXT, JSON, SRT) |
| 학습 모드 | 2종 (Story Mode, Exam Mode) |
| 난이도 레벨 | 3단계 (Beginner, Intermediate, Advanced) |
| 수능 문제 유형 | 6종 |
| 프로덕션 의존성 | 7개 |

---

## 📋 Requirements

| 요구사항 | 버전 / 상세 |
|---|---|
| Node.js | 18.17+ |
| npm | 9+ |
| ElevenLabs API Key | **필수** -- TTS 음성 생성 ([elevenlabs.io](https://elevenlabs.io)) |
| Google Gemini API Key | 권장 -- AI 대본 생성 ([ai.google.dev](https://ai.google.dev)) |
| OpenAI API Key | 선택 -- Gemini 폴백 ([platform.openai.com](https://platform.openai.com)) |

---

## 🌐 i18n

| 요소 | 언어 |
|---|---|
| UI 레이블 및 헤더 | English |
| 튜터 해설 음성 | 한국어 (Korean) |
| 원문 낭독 | English |
| 에러 메시지 | English + 한국어 혼용 |

> 현재 한국어 학습자를 주요 타겟으로 설계되어 있습니다.
> `src/app/actions.ts`의 `systemPrompt`를 수정하면 일본어, 중국어 등 다른 언어 쌍으로 확장할 수 있습니다.

---

## 🤝 Contributing

1. 이 저장소를 **Fork**합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치를 Push합니다 (`git push origin feature/amazing-feature`)
5. **Pull Request**를 생성합니다

---

## 📄 License

MIT License -- 자유롭게 사용, 수정, 배포할 수 있습니다.

---

<div align="center">

**ReadMaster AI** -- 텍스트가 살아 숨쉬는 오디오 튜터링

Built with Next.js 16 · React 19 · ElevenLabs · Gemini 2.5 Flash

[Reasonofmoon](https://github.com/Reasonofmoon)

</div>
