# 인스타툰 크리에이터

인스타그램용 툰(webtoon) 컨텐츠를 쉽게 만들 수 있는 웹 애플리케이션입니다.

## 📋 현재 구현 상태

### ✅ Phase 1 & 2 완료 (기본 UI & 이미지 편집)
- ✅ 프로젝트 생성 및 관리
- ✅ 캔버스 크기 선택 (1080x1080, 1080x1350)
- ✅ 3단계 워크플로우
- ✅ 이미지 업로드
- ✅ 드래그로 요소 이동
- ✅ 리사이즈 핸들로 크기 조절
- ✅ 텍스트 추가 및 스타일링
- ✅ 레이어 관리 (순서 변경, 삭제)

### 🚧 Phase 3-7 예정
- ⏳ Firebase 연동 (Phase 3)
- ⏳ 회원가입/로그인 (Phase 4)
- ⏳ 프로젝트 저장 (Phase 5)
- ⏳ 이미지 클라우드 저장 (Phase 6)
- ⏳ AI 이미지 생성 (Phase 7)

## 🚀 설치 방법

### 1. Node.js 설치 확인
```bash
node -v
npm -v
```
없다면 https://nodejs.org 에서 LTS 버전 다운로드

### 2. 프로젝트 폴더로 이동
```bash
cd instatoon-creator
```

### 3. 패키지 설치
```bash
npm install
```

### 4. 개발 서버 실행
```bash
npm start
```

브라우저가 자동으로 열리고 `http://localhost:3000` 에서 실행됩니다.

## 💡 사용 방법

### 1️⃣ 프로젝트 생성
1. 좌측 사이드바에서 "새 프로젝트" 클릭
2. 캔버스 크기 선택 (정사각형 또는 세로형)
3. "프로젝트 생성" 클릭

### 2️⃣ 캐릭터/배경 추가 (Step 1-2)
1. "이미지 직접 업로드" 선택
2. 이미지 파일 선택
3. 캔버스에 이미지가 추가됨
4. "단계 완료" 클릭하여 다음 단계로

### 3️⃣ 이미지 편집
- **이동**: 이미지를 클릭한 채로 드래그
- **크기 조절**: 이미지 모서리의 파란 점을 드래그
- **선택**: 이미지를 클릭하면 파란 테두리 표시

### 4️⃣ 텍스트 추가 (Step 3)
1. 텍스트 유형 선택 (제목/부제목/본문/말풍선)
2. 텍스트 입력
3. 글꼴 크기, 색상, 정렬 설정
4. "텍스트 추가" 클릭

### 5️⃣ 레이어 관리
우측 하단 "레이어" 패널에서:
- **↑ ↓**: 레이어 순서 변경
- **×**: 레이어 삭제
- 레이어 클릭: 해당 요소 선택

## 📁 프로젝트 구조

```
instatoon-creator/
├── public/
│   └── index.html              # HTML 템플릿
├── src/
│   ├── components/             # React 컴포넌트
│   │   ├── Sidebar.js         # 좌측 사이드바
│   │   ├── WorkflowSteps.js   # 상단 단계 표시
│   │   ├── Canvas.js          # 캔버스 및 요소
│   │   ├── CharacterPanel.js  # 캐릭터 생성 패널
│   │   ├── BackgroundPanel.js # 배경 생성 패널
│   │   ├── TextPanel.js       # 텍스트 패널
│   │   ├── LayersPanel.js     # 레이어 패널
│   │   └── CanvasSizeModal.js # 캔버스 크기 모달
│   ├── services/              # API 서비스 (예정)
│   ├── firebase/              # Firebase 설정 (예정)
│   ├── styles/
│   │   └── App.css           # 전역 스타일
│   ├── App.js                # 메인 앱
│   └── index.js              # 엔트리 포인트
├── package.json              # 프로젝트 설정
└── README.md                # 이 파일
```

## 🎨 주요 기능 설명

### Canvas 컴포넌트
- 모든 요소(이미지, 텍스트)를 표시
- 드래그로 위치 변경
- 리사이즈 핸들로 크기 조절

### 상태 관리
- `projects`: 모든 프로젝트 목록
- `activeProject`: 현재 작업 중인 프로젝트
- `canvasElements`: 캔버스의 모든 요소
- `selectedElement`: 현재 선택된 요소

### 데이터 구조

**프로젝트:**
```javascript
{
  id: 1,
  name: "여름 캠페인 인스타툰",
  date: "2025.01.02",
  canvasSize: "1080x1080",
  elements: [...]
}
```

**요소:**
```javascript
{
  id: 1736234567890,
  type: "image" | "text",
  content: "..." | { content, fontSize, color, ... },
  x: 100,
  y: 100,
  width: 200,
  height: 200
}
```

## 🔧 다음 개발 단계 (Phase 3-7)

### Phase 3: Firebase 연동
```bash
npm install firebase
```
- Firebase 프로젝트 생성
- 인증 설정
- Firestore 데이터베이스 설정

### Phase 4: 회원 기능
- 회원가입
- 로그인/로그아웃
- 사용자 프로필

### Phase 5: 프로젝트 저장
- Firestore에 프로젝트 저장
- 프로젝트 불러오기
- 프로젝트 수정/삭제

### Phase 6: 이미지 저장
- Firebase Storage 연동
- 이미지 업로드
- URL 저장

### Phase 7: AI 이미지 생성
- OpenAI DALL-E API 연동
- 프롬프트 기반 이미지 생성
- 레퍼런스 이미지 활용

## 💰 예상 비용

**현재 (Phase 1-2):**
- 개발 비용: **무료**
- 호스팅: 로컬 실행만 (무료)

**Phase 3-7 완료 후:**
- Firebase (무료 플랜): 무료
- OpenAI API: 월 $10-50 (사용량에 따라)
- 호스팅 (Netlify/Vercel): 무료

## 🐛 문제 해결

### 포트 3000이 이미 사용 중
```bash
# 다른 포트로 실행
PORT=3001 npm start
```

### npm install 오류
```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 브라우저가 자동으로 열리지 않음
수동으로 브라우저에서 `http://localhost:3000` 접속

## 📝 개발 팁

### 코드 수정시 자동 새로고침
- 파일 저장하면 자동으로 브라우저 새로고침
- React Fast Refresh 덕분에 상태 유지

### 개발자 도구 활용
- F12로 개발자 도구 열기
- Console에서 에러 확인
- React Developer Tools 설치 권장

## 🎓 학습 자료

- React 공식 문서: https://react.dev
- Firebase 문서: https://firebase.google.com/docs
- 생활코딩 React: https://opentutorials.org
- 노마드코더: https://nomadcoders.co

## 📞 문의

개발 중 문제가 생기면:
1. 에러 메시지 확인
2. Console 로그 확인
3. README 문제 해결 섹션 참고

---

**현재 버전**: Phase 1-2 완료  
**마지막 업데이트**: 2025.01.03
