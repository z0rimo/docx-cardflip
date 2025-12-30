import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, ArrowLeft } from "lucide-react";
import "./App.css";

type Card = {
  question: string;
  subQuestion?: string;
  answer: string;
  explanation?: string;
  options?: string[];
};

type SetItem = {
  id: string;
  title: string;
  fileName: string;
  desc?: string;
};

const SETS: SetItem[] = [
  { id: "ncp200", title: "NCP 200", fileName: "ncp200.json", desc: "Overview / Compute / Storage" },
  { id: "ncp202", title: "NCP 202", fileName: "ncp202.json", desc: "Network / Media / Database / Management / Analytics" },
  { id: "ncp207", title: "NCP 207", fileName: "ncp207.json", desc: "Troubleshooting" },
];

function buildUrl(fileName: string) {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedFile = fileName.startsWith("/") ? fileName.slice(1) : fileName;
  return `${normalizedBase}${normalizedFile}`;
}

function FlashcardPlayer({
  title,
  dataUrl,
  onBack,
}: {
  title: string;
  dataUrl: string;
  onBack: () => void;
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [disableFlipAnim, setDisableFlipAnim] = useState(false);
  const [gotoValue, setGotoValue] = useState('');

  // swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        setCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowExplanation(false);

        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const valid = (data as Card[]).filter((c) => c?.question && c?.answer);
        setCards(valid);
      } catch (e: any) {
        setLoadError(e?.message ?? "카드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    loadCards();
  }, [dataUrl]);

  const total = cards.length;
  const progress = useMemo(() => {
    if (total === 0) return 0;
    return ((currentIndex + 1) / total) * 100;
  }, [currentIndex, total]);

  const resetViewState = () => {
    setIsFlipped(false);
    setShowExplanation(false);
  };

  const goToIndexInstantFront = (nextIndex: number) => {
    setDisableFlipAnim(true);
    setIsFlipped(false);
    setShowExplanation(false);
    setCurrentIndex(nextIndex);
    requestAnimationFrame(() => {
      setDisableFlipAnim(false);
    });
  };

  const requestPrev = () => {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    if (isFlipped) {
      goToIndexInstantFront(prevIndex);
    } else {
      setCurrentIndex(prevIndex);
      resetViewState();
    }
  };

  const requestNext = () => {
    if (currentIndex >= total - 1) return;
    const nextIndex = currentIndex + 1;
    if (isFlipped) {
      goToIndexInstantFront(nextIndex);
    } else {
      setCurrentIndex(nextIndex);
      resetViewState();
    }
  };

  const requestReset = () => {
    setCurrentIndex(0);
    resetViewState();
  };

  const handleGotoCommit = () => {
    if (total <= 0) return;
    const n = Number(gotoValue);
    if (!Number.isFinite(n)) return;
    const target = Math.min(Math.max(Math.trunc(n), 1), total) - 1;
    setCurrentIndex(target);
    resetViewState();
    setGotoValue('');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) requestNext();
    if (distance < -minSwipeDistance) requestPrev();
  };

  if (isLoading) return <div className="fc-loading">로딩 중...</div>;
  if (loadError) return <div className="fc-loading">{loadError}</div>;
  if (!cards[currentIndex]) return <div className="fc-loading">카드가 없습니다.</div>;

  const card = cards[currentIndex];

  return (
    <div className="fc-page">
      <div className="fc-wrap">
        {/* 상단 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button
            type="button"
            onClick={onBack}
            className="fc-round-btn"
            style={{ width: "auto", padding: "8px 16px", borderRadius: 999, gap: 6, display: "flex" }}
          >
            <ArrowLeft size={18} />
            뒤로
          </button>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#1e293b" }}>{title}</div>
          <div style={{ width: 76 }}></div>
        </div>

        {/* 진행 바 */}
        <div className="fc-progress">
          <div className="fc-progress-info">
            <span>{Math.round(progress)}%</span>
            <span className="fc-sub">스와이프: 이전/다음 · 탭: 뒤집기</span>
          </div>
          <div className="fc-progress-bar-bg">
            <div className="fc-progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 카드 영역 */}
        <div className="fc-card-area">
          <div className="fc-card-perspective">
            <div
              className={`fc-card ${isFlipped ? 'is-flipped' : ''} ${disableFlipAnim ? 'no-flip-anim' : ''}`}
              onClick={() => setIsFlipped((v) => !v)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              role="button"
              tabIndex={0}
            >
              {/* FRONT */}
              <div className="fc-face fc-front">
                <div className="fc-face-layout">
                  <span className="fc-tag fc-tag--q">QUESTION {currentIndex + 1}</span>
                  <div className="fc-text" style={{ justifyContent: 'flex-start' }}>
                    <p className="fc-q">{card.question}</p>
                    {card.subQuestion && (
                      <p className="fc-sub-q">{card.subQuestion}</p>
                    )}
                    {card.options && (
                      <div className="fc-options">
                        {card.options.map((opt, i) => (
                          <div key={i} className="fc-option">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="fc-hint fc-hint--front">탭하여 뒤집기</span>
                </div>
              </div>

              {/* BACK */}
              <div className="fc-face fc-back">
                <div className="fc-face-layout">
                  <span className="fc-tag fc-tag--a">ANSWER</span>
                  <div className="fc-text" style={{ justifyContent: 'center' }}>
                    <p className="fc-a">{card.answer}</p>
                  </div>
                  <span className="fc-hint fc-hint--back">탭하여 뒤집기</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 영역 */}
        <div className="fc-bottom">
          {/* 해설 */}
          {isFlipped && card.explanation && (
            <div className="fc-explain">
              <button
                className="fc-explain-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExplanation((v) => !v);
                }}
              >
                {showExplanation ? '해설 숨기기' : '해설 보기'}
              </button>
              {showExplanation && <div className="fc-explain-box">{card.explanation}</div>}
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className="fc-controls">
            <button
              onClick={requestPrev}
              disabled={currentIndex === 0}
              className="fc-round-btn"
              type="button"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button onClick={requestReset} className="fc-round-btn" type="button" aria-label="Reset">
              <RotateCw size={20} />
            </button>
            <button
              onClick={requestNext}
              disabled={currentIndex === total - 1}
              className="fc-round-btn"
              type="button"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Goto 입력 */}
          <div className="fc-goto-row">
            <div className="fc-goto-left">
              <span className="fc-goto-count">
                <span className="fc-goto-now">[{currentIndex + 1}]</span>/{total}
              </span>
            </div>
            <div className="fc-goto-right">
              <div className="fc-goto-edit">
                <input
                  className="fc-goto-input"
                  type="number"
                  min={1}
                  max={total}
                  value={gotoValue}
                  onChange={(e) => setGotoValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGotoCommit();
                  }}
                  placeholder=""
                  aria-label="Go to card number"
                />
                <button className="fc-goto-go" type="button" onClick={handleGotoCommit} aria-label="Go">
                  ➜
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState<SetItem | null>(null);

  if (selected) {
    return (
      <FlashcardPlayer
        title={selected.title}
        dataUrl={buildUrl(selected.id)}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="fc-page">
      <div className="fc-wrap">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1e293b", marginBottom: 8 }}>
            문제 세트 선택
          </div>
          <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
            원하는 NCP 세트를 고르면 바로 학습 모드로 들어가요.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s)}
              style={{
                textAlign: "left",
                padding: 18,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", marginBottom: 6 }}>
                {s.title}
              </div>
              {s.desc && (
                <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>
                  {s.desc}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}