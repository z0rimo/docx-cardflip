# Docx-CardFlip (Flashcard App)

이 프로젝트는 JSON 데이터를 기반으로 플래시카드를 학습할 수 있는 깔끔하고 직관적인 웹 앱입니다. 모바일 환경에 최적화되어 있으며, 스와이프 제스처와 카드 뒤집기 애니메이션을 제공합니다.

[Live Demo 보기](https://z0rimo.github.io/docx-cardflip/)

---

## ✨ 주요 기능

- **대화형 플래시카드**: 클릭/탭으로 앞뒤를 전환하며 학습할 수 있습니다.
- **모바일 최적화**: 스와이프(좌/우)를 통해 이전/다음 카드로 편리하게 이동합니다.
- **해설 모드**: 필요한 경우 '해설 보기' 버튼을 통해 정답에 대한 추가 설명을 확인할 수 있습니다.
- **빠른 이동 (Jump to)**: 특정 번호의 카드로 바로 이동할 수 있는 입력 창을 지원합니다.
- **진행도 표시**: 상단 프로그레스 바를 통해 학습량을 실시간으로 확인합니다.

---

## 🛠 사용 방법 (카드 데이터 수정)

본인만의 퀴즈 데이터를 넣으려면 `public/flashcards.json` 파일을 수정하면 됩니다.

### 데이터 형식 (Example)
```json
[
  {
    "question": "React의 핵심 원칙은?",
    "subQuestion": "데이터 흐름에 관한 질문입니다.",
    "answer": "단방향 데이터 바인딩",
    "explanation": "부모 컴포넌트에서 자식 컴포넌트로 데이터가 흐르는 구조를 가집니다.",
    "options": ["1. 단방향", "2. 양방향", "3. 무방향"]
  }
]
```

---

## 시작하기

```
git clone [https://github.com/z0rimo/docx-cardflip.git](https://github.com/z0rimo/docx-cardflip.git)
```

패키지 설치
```
npm install
```

로컬 실행
```
npm run dev
```

---

## 기술 스택
- **Framework**: React (TypeScript)
- **Styling**: CSS3 (3D Perspective, Flexbox, Clamp)
- **Icons**: Lucide-React
- **Deployment**: GitHub Pages
