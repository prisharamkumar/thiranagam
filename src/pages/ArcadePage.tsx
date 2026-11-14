import React, { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  Check,
  Clock,
  Compass,
  Flower2,
  HelpCircle,
  Layers,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
} from 'lucide-react';
import {
  CONSTELLATION_NODES,
  FLASHCARDS,
  MEMORY_PAIRS,
  QUIZ_QUESTIONS,
} from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { ArcadeGameId } from '../types';

const GAMES_META: {
  id: ArcadeGameId;
  title: string;
  subtitle: string;
  reward: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'quick-quiz',
    title: 'Quick Quiz',
    subtitle: '5 calm scenario questions with explanations',
    reward: '+5 Blossoms',
    icon: Brain,
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    subtitle: 'Pair 6 cognitive UX terms with definitions',
    reward: '+6 Blossoms',
    icon: Layers,
  },
  {
    id: 'flashcard-quest',
    title: 'Flashcard Quest',
    subtitle: 'Flip active recall cards at your own pace',
    reward: '+4 Blossoms',
    icon: Sparkles,
  },
  {
    id: 'beat-the-clock',
    title: 'Beat the Clock',
    subtitle: '45-second rapid terminology sprint',
    reward: '+6 Blossoms',
    icon: Clock,
  },
  {
    id: 'boss-battle',
    title: 'Topic Boss Battle',
    subtitle: 'Resolve The Attention Bottleneck in 3 rounds',
    reward: '+8 Blossoms · +1 Tome',
    icon: Swords,
  },
  {
    id: 'daily-mystery',
    title: 'Daily Mystery',
    subtitle: 'Deduce the cognitive law from a campus clue',
    reward: '+4 Blossoms',
    icon: HelpCircle,
  },
  {
    id: 'constellations',
    title: 'Concept Constellations',
    subtitle: 'Explore linked mental-model nodes',
    reward: '+3 Blossoms',
    icon: Compass,
  },
];

export const ArcadePage: React.FC = () => {
  const { resources, quizAttempts, recordArcadeResult, profile } = useAppState();
  const [activeGame, setActiveGame] = useState<ArcadeGameId>('quick-quiz');
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs text-[var(--sp-ink-muted)]">
            Learning Arcade · Active Recall & Concept Play · {profile.subjects[0] ?? 'Core Pathway'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--sp-ink)] mt-1">
            Playful Mastery Studio
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--sp-ink-muted)] tabular-nums">
          <span className="flex items-center gap-1.5 font-medium text-[var(--sp-ink)]">
            <Flower2 className="w-4 h-4 text-[var(--sp-secondary)]" aria-hidden="true" />
            <span>{resources.blossoms} Meadow Blossoms</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{resources.tomes} Ancient Tomes</span>
        </div>
      </header>

      {rewardBanner && (
        <div
          role="status"
          className="rounded-2xl bg-[var(--sp-secondary-soft)] border border-[var(--sp-secondary)] px-5 py-3 flex items-center justify-between gap-4 text-sm text-[var(--sp-ink)]"
        >
          <span className="font-medium">{rewardBanner}</span>
          <button
            type="button"
            onClick={() => setRewardBanner(null)}
            className="text-xs font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mini-Game Selector Grid */}
      <section aria-label="Mini-game selector" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {GAMES_META.map((game) => {
          const Icon = game.icon;
          const selected = activeGame === game.id;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                setActiveGame(game.id);
                setRewardBanner(null);
              }}
              aria-pressed={selected}
              className={`p-4 rounded-2xl border text-left transition-colors flex flex-col justify-between ${
                selected
                  ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] border-[var(--sp-accent)]'
                  : 'bg-[var(--sp-surface)] text-[var(--sp-ink)] border-[var(--sp-border)] hover:bg-[var(--sp-surface-muted)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Icon
                    className={`w-4 h-4 ${selected ? 'opacity-90' : 'text-[var(--sp-accent)]'}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-[11px] font-medium ${
                      selected ? 'opacity-85' : 'text-[var(--sp-secondary)]'
                    }`}
                  >
                    {game.reward}
                  </span>
                </div>
                <h2 className="font-display text-base font-semibold">{game.title}</h2>
                <p
                  className={`text-xs mt-1 leading-snug ${
                    selected ? 'opacity-85' : 'text-[var(--sp-ink-muted)]'
                  }`}
                >
                  {game.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Active Playable Arena + Recent Attempts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6">
          {activeGame === 'quick-quiz' && (
            <QuickQuizArena
              onComplete={(score, total) => {
                recordArcadeResult('Quick Quiz · Cognitive Systems', score, total, 5);
                setRewardBanner(`Quiz complete (${score}/${total}). Earned +5 Meadow Blossoms!`);
              }}
            />
          )}
          {activeGame === 'memory-match' && (
            <MemoryMatchArena
              onComplete={(moves) => {
                recordArcadeResult('Memory Match · UX Terms', 6, 6, 6);
                setRewardBanner(`Matched all 6 pairs in ${moves} moves. Earned +6 Meadow Blossoms!`);
              }}
            />
          )}
          {activeGame === 'flashcard-quest' && (
            <FlashcardQuestArena
              onComplete={(mastered, total) => {
                recordArcadeResult('Flashcard Quest', mastered, total, 4);
                setRewardBanner(`Finished ${total} flashcards. Earned +4 Meadow Blossoms!`);
              }}
            />
          )}
          {activeGame === 'beat-the-clock' && (
            <BeatTheClockArena
              onComplete={(score, total) => {
                recordArcadeResult('Beat the Clock Sprint', score, total, 6);
                setRewardBanner(`Sprint finished with ${score} correct answers. Earned +6 Meadow Blossoms!`);
              }}
            />
          )}
          {activeGame === 'boss-battle' && (
            <BossBattleArena
              onVictory={() => {
                recordArcadeResult('Boss Battle · Attention Bottleneck', 3, 3, 8, 1);
                setRewardBanner(
                  'Victory! You resolved The Attention Bottleneck and earned +8 Meadow Blossoms & +1 Ancient Tome!'
                );
              }}
            />
          )}
          {activeGame === 'daily-mystery' && (
            <DailyMysteryArena
              onSolve={() => {
                recordArcadeResult('Daily Mystery Riddle', 1, 1, 4);
                setRewardBanner('Mystery solved! Earned +4 Meadow Blossoms.');
              }}
            />
          )}
          {activeGame === 'constellations' && (
            <ConstellationsArena
              onExploreAll={() => {
                recordArcadeResult('Concept Constellations', 5, 5, 3);
                setRewardBanner('Mapped all 5 constellation concepts! Earned +3 Meadow Blossoms.');
              }}
            />
          )}
        </div>

        <aside className="xl:col-span-4 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
            Recent Arcade Sessions
          </h2>
          <div className="space-y-2.5">
            {quizAttempts.slice(0, 6).map((attempt) => (
              <div
                key={attempt.id}
                className="p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[var(--sp-ink)] block truncate">
                    {attempt.gameTitle}
                  </span>
                  <span className="text-[11px] text-[var(--sp-ink-muted)]">{attempt.dateLabel}</span>
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums text-[var(--sp-accent)] shrink-0">
                  {attempt.score}/{attempt.total}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

/* --- Interactive Sub-Games --- */

const QuickQuizArena: React.FC<{ onComplete: (score: number, total: number) => void }> = ({
  onComplete,
}) => {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[idx];

  const handleChoose = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    if (optIdx === q.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (idx + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
      onComplete(score, QUIZ_QUESTIONS.length);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  if (finished) {
    return (
      <div className="py-8 text-center space-y-4">
        <p className="text-xs text-[var(--sp-secondary)] font-semibold">Quick Quiz Complete</p>
        <h3 className="font-display text-3xl font-semibold text-[var(--sp-ink)] tabular-nums">
          {score} / {QUIZ_QUESTIONS.length} Correct
        </h3>
        <p className="text-sm text-[var(--sp-ink-muted)] max-w-md mx-auto">
          Your score has been recorded in Insights and your Meadow Blossoms were added to Whispering Willow Grove.
        </p>
        <button
          type="button"
          onClick={() => {
            setIdx(0);
            setSelected(null);
            setScore(0);
            setFinished(false);
          }}
          className="px-5 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-sm font-semibold inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Play Another Round</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs text-[var(--sp-ink-muted)] tabular-nums">
        <span>
          Question {idx + 1} of {QUIZ_QUESTIONS.length} · {q.topic}
        </span>
        <span>Score: {score}</span>
      </div>

      <h3 className="font-display text-xl font-semibold text-[var(--sp-ink)] leading-snug">
        {q.question}
      </h3>

      <div className="space-y-2.5">
        {q.options.map((opt, optIdx) => {
          const isChosen = selected === optIdx;
          const isCorrect = optIdx === q.correctIndex;
          let style =
            'bg-[var(--sp-canvas)] border-[var(--sp-border)] text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]';
          if (selected !== null) {
            if (isCorrect) {
              style = 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]';
            } else if (isChosen) {
              style = 'bg-[var(--sp-danger-soft)] border-[var(--sp-danger)] text-[var(--sp-ink)]';
            }
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleChoose(optIdx)}
              disabled={selected !== null}
              className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-colors ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="p-4 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--sp-ink-muted)] leading-relaxed">{q.explanation}</p>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold shrink-0"
          >
            {idx + 1 >= QUIZ_QUESTIONS.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

const MemoryMatchArena: React.FC<{ onComplete: (moves: number) => void }> = ({ onComplete }) => {
  type CardItem = { uid: string; pairId: string; text: string };

  const buildDeck = () => {
    const raw: CardItem[] = [];
    MEMORY_PAIRS.forEach((p) => {
      raw.push({ uid: `${p.id}-t`, pairId: p.id, text: p.term });
      raw.push({ uid: `${p.id}-m`, pairId: p.id, text: p.match });
    });
    return raw.sort((a, b) => a.uid.localeCompare(b.uid));
  };

  const [cards, setCards] = useState<CardItem[]>(() => {
    const d = buildDeck();
    return [d[3], d[8], d[1], d[10], d[5], d[0], d[11], d[4], d[7], d[2], d[9], d[6]];
  });
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const handleFlip = (card: CardItem) => {
    if (flipped.length >= 2 || flipped.includes(card.uid) || matchedPairs.includes(card.pairId)) {
      return;
    }
    const nextFlipped = [...flipped, card.uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const first = cards.find((c) => c.uid === nextFlipped[0]);
      const second = cards.find((c) => c.uid === nextFlipped[1]);
      if (first && second && first.pairId === second.pairId) {
        const nextMatched = [...matchedPairs, first.pairId];
        setMatchedPairs(nextMatched);
        setFlipped([]);
        if (nextMatched.length === MEMORY_PAIRS.length) {
          onComplete(moves + 1);
        }
      } else {
        window.setTimeout(() => setFlipped([]), 850);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
            Memory Match · Cognitive UX Concepts
          </h3>
          <p className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
            Pairs found: {matchedPairs.length}/{MEMORY_PAIRS.length} · Moves: {moves}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCards([...cards].sort(() => Math.random() - 0.5));
            setFlipped([]);
            setMatchedPairs([]);
            setMoves(0);
          }}
          className="px-3 py-1.5 rounded-lg border border-[var(--sp-border)] text-xs font-medium text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]"
        >
          Shuffle
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isRevealed = flipped.includes(card.uid) || matchedPairs.includes(card.pairId);
          const isMatched = matchedPairs.includes(card.pairId);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card)}
              className={`min-h-[96px] p-3 rounded-xl border text-center flex items-center justify-center transition-colors ${
                isMatched
                  ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]'
                  : isRevealed
                  ? 'bg-[var(--sp-secondary-soft)] border-[var(--sp-secondary)] text-[var(--sp-ink)]'
                  : 'bg-[var(--sp-surface-muted)] border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
              }`}
            >
              <span className="text-xs font-medium leading-snug">
                {isRevealed ? card.text : 'Reveal Card'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FlashcardQuestArena: React.FC<{ onComplete: (mastered: number, total: number) => void }> = ({
  onComplete,
}) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [gotItCount, setGotItCount] = useState(0);
  const [done, setDone] = useState(false);

  const card = FLASHCARDS[idx];

  const handleRate = (knewIt: boolean) => {
    const nextGot = knewIt ? gotItCount + 1 : gotItCount;
    setGotItCount(nextGot);
    if (idx + 1 >= FLASHCARDS.length) {
      setDone(true);
      onComplete(nextGot, FLASHCARDS.length);
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  };

  if (done) {
    return (
      <div className="py-8 text-center space-y-4">
        <h3 className="font-display text-2xl font-semibold text-[var(--sp-ink)] tabular-nums">
          Deck Complete · {gotItCount}/{FLASHCARDS.length} Mastered
        </h3>
        <button
          type="button"
          onClick={() => {
            setIdx(0);
            setFlipped(false);
            setGotItCount(0);
            setDone(false);
          }}
          className="px-5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold"
        >
          Review Deck Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[var(--sp-ink-muted)] tabular-nums">
        <span>
          Card {idx + 1} of {FLASHCARDS.length} · {card.tag}
        </span>
        <span>Mastered: {gotItCount}</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full min-h-[190px] p-6 rounded-2xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex flex-col items-center justify-center text-center hover:opacity-95 transition-opacity"
      >
        <span className="text-[11px] text-[var(--sp-secondary)] font-medium mb-2">
          {flipped ? 'Definition & Application' : 'Concept Prompt (Click to Flip)'}
        </span>
        <span className="font-display text-xl sm:text-2xl font-semibold text-[var(--sp-ink)] max-w-lg leading-snug">
          {flipped ? card.back : card.front}
        </span>
      </button>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => handleRate(false)}
          className="px-4 py-2 rounded-xl border border-[var(--sp-border)] text-xs font-medium text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)]"
        >
          Needs Review
        </button>
        <button
          type="button"
          onClick={() => handleRate(true)}
          className="px-5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Got It</span>
        </button>
      </div>
    </div>
  );
};

const BeatTheClockArena: React.FC<{ onComplete: (score: number, total: number) => void }> = ({
  onComplete,
}) => {
  const [active, setActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const items = useMemo(() => [...QUIZ_QUESTIONS, ...QUIZ_QUESTIONS], []);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setActive(false);
          onComplete(score, Math.max(1, answered));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, score, answered, onComplete]);

  const startSprint = () => {
    setScore(0);
    setAnswered(0);
    setIdx(0);
    setSecondsLeft(45);
    setActive(true);
  };

  if (!active && secondsLeft === 45) {
    return (
      <div className="py-8 text-center space-y-4">
        <h3 className="font-display text-2xl font-semibold text-[var(--sp-ink)]">
          Beat the Clock · 45s Sprint
        </h3>
        <p className="text-sm text-[var(--sp-ink-muted)] max-w-md mx-auto">
          Answer as many Cognitive UX questions as you comfortably can in 45 seconds.
        </p>
        <button
          type="button"
          onClick={startSprint}
          className="px-6 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-sm font-semibold"
        >
          Start 45s Sprint
        </button>
      </div>
    );
  }

  if (!active && secondsLeft === 0) {
    return (
      <div className="py-8 text-center space-y-4">
        <h3 className="font-display text-2xl font-semibold text-[var(--sp-ink)] tabular-nums">
          Time’s Up · {score} Correct out of {answered}
        </h3>
        <button
          type="button"
          onClick={startSprint}
          className="px-5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold"
        >
          Run Sprint Again
        </button>
      </div>
    );
  }

  const current = items[idx % items.length];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold tabular-nums">
        <span className="text-[var(--sp-warm)]">Time Left: {secondsLeft}s</span>
        <span className="text-[var(--sp-accent)]">Score: {score}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)]">{current.question}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {current.options.map((opt, optIdx) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (optIdx === current.correctIndex) setScore((s) => s + 1);
              setAnswered((a) => a + 1);
              setIdx((i) => i + 1);
            }}
            className="p-3 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:bg-[var(--sp-accent-soft)] text-left text-xs font-medium text-[var(--sp-ink)]"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const BossBattleArena: React.FC<{ onVictory: () => void }> = ({ onVictory }) => {
  const encounters = [
    {
      prompt:
        'Round 1: A student opens their semester syllabus and freezes at 28 unsorted deadlines. What lowers extraneous load fastest?',
      choices: [
        'Show all 28 deadlines in flashing red banners',
        'Surface only this week’s 1 immediate microtask with progressive disclosure',
        'Ask them to memorize the full table before starting',
      ],
      correct: 1,
    },
    {
      prompt:
        'Round 2: Mid-study, a student remembers an email they forgot to send. Which strategy protects working memory?',
      choices: [
        'Switch tabs immediately and answer emails for 20 minutes',
        'Drop it into the Distraction Parking Lot and return to the current step',
        'Restart the entire 25-minute timer from scratch',
      ],
      correct: 1,
    },
    {
      prompt:
        'Round 3: A student takes a two-day rest after exams. How should a neuro-inclusive sanctuary respond?',
      choices: [
        'Preserve all grove progress and invite a gentle 2-minute warm-up',
        'Wilt their habitat plants to enforce guilt',
        'Lock intermediate modules until they double their study hours',
      ],
      correct: 0,
    },
  ];

  const [round, setRound] = useState(0);
  const [bossClarity, setBossClarity] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  if (won) {
    return (
      <div className="py-8 text-center space-y-4">
        <Shield className="w-9 h-9 text-[var(--sp-accent)] mx-auto" aria-hidden="true" />
        <h3 className="font-display text-2xl font-semibold text-[var(--sp-ink)]">
          The Attention Bottleneck Resolved
        </h3>
        <p className="text-sm text-[var(--sp-ink-muted)] max-w-md mx-auto">
          Clarity restored across all 3 scenarios. +8 Meadow Blossoms and +1 Ancient Tome added.
        </p>
        <button
          type="button"
          onClick={() => {
            setRound(0);
            setBossClarity(0);
            setNote(null);
            setWon(false);
          }}
          className="px-5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold"
        >
          Replay Challenge
        </button>
      </div>
    );
  }

  const enc = encounters[round];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--sp-secondary)]">
          Topic Boss Battle · The Attention Bottleneck
        </span>
        <span className="font-mono tabular-nums text-[var(--sp-accent)]">Clarity: {bossClarity}%</span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-[var(--sp-surface-muted)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--sp-secondary)] transition-all duration-300"
          style={{ width: `${bossClarity}%` }}
        />
      </div>

      <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)]">{enc.prompt}</h3>

      <div className="space-y-2">
        {enc.choices.map((c, i) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              if (i === enc.correct) {
                const nextClarity = Math.min(100, bossClarity + 34);
                setBossClarity(nextClarity);
                setNote(null);
                if (round + 1 >= encounters.length) {
                  setWon(true);
                  onVictory();
                } else {
                  setRound((r) => r + 1);
                }
              } else {
                setNote('That increases cognitive friction—try the calmer, lower-load option.');
              }
            }}
            className="w-full text-left p-3.5 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:bg-[var(--sp-secondary-soft)] text-sm font-medium text-[var(--sp-ink)]"
          >
            {c}
          </button>
        ))}
      </div>

      {note && <p className="text-xs text-[var(--sp-warm)] font-medium">{note}</p>}
    </div>
  );
};

const DailyMysteryArena: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const [showHint, setShowHint] = useState(false);
  const [guess, setGuess] = useState('');
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = guess.trim().toLowerCase();
    if (clean.includes('hick')) {
      setSolved(true);
      setFeedback('Correct! Hick’s Law explains logarithmic decision time as choices expand.');
      onSolve();
    } else {
      setFeedback('Not quite—think of the 1952 law linking number of menu choices to reaction time.');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-[var(--sp-secondary)]">Daily Cognitive Mystery</p>
      <h3 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
        “Doubling the buttons on a student dashboard slows down their first click—but in a gentle logarithmic curve rather than a straight line. Which UX law am I?”
      </h3>

      <button
        type="button"
        onClick={() => setShowHint((h) => !h)}
        className="text-xs font-medium text-[var(--sp-accent)] underline"
      >
        {showHint ? 'Hide Hint' : 'Show Hint'}
      </button>

      {showHint && (
        <p className="text-xs text-[var(--sp-ink-muted)] p-3 rounded-xl bg-[var(--sp-surface-muted)]">
          Hint: Named after British psychologist William Edmund ____ (1952).
        </p>
      )}

      {!solved && (
        <form onSubmit={handleCheck} className="flex items-center gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type the law name..."
            aria-label="Daily mystery answer"
            className="flex-1 px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold"
          >
            Check Answer
          </button>
        </form>
      )}

      {feedback && (
        <p
          className={`text-xs font-medium ${
            solved ? 'text-[var(--sp-accent)]' : 'text-[var(--sp-warm)]'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
};

const ConstellationsArena: React.FC<{ onExploreAll: () => void }> = ({ onExploreAll }) => {
  const [selectedId, setSelectedId] = useState(CONSTELLATION_NODES[0].id);
  const [visited, setVisited] = useState<string[]>([CONSTELLATION_NODES[0].id]);
  const [claimed, setClaimed] = useState(false);

  const selectedNode =
    CONSTELLATION_NODES.find((n) => n.id === selectedId) ?? CONSTELLATION_NODES[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (!visited.includes(id)) {
      const next = [...visited, id];
      setVisited(next);
      if (next.length === CONSTELLATION_NODES.length && !claimed) {
        setClaimed(true);
        onExploreAll();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
          Concept Constellations
        </h3>
        <p className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
          Explored {visited.length}/{CONSTELLATION_NODES.length} connected principles
        </p>
      </div>

      <div className="relative h-64 rounded-2xl bg-[#1E2D24] overflow-hidden border border-[var(--sp-border)]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {CONSTELLATION_NODES.map((node) =>
            node.links.map((targetId) => {
              const target = CONSTELLATION_NODES.find((n) => n.id === targetId);
              if (!target || node.id > target.id) return null;
              const activeEdge = node.id === selectedId || target.id === selectedId;
              return (
                <line
                  key={`${node.id}-${target.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={activeEdge ? '#E4DDF3' : 'rgba(255,255,255,0.22)'}
                  strokeWidth={activeEdge ? '0.9' : '0.5'}
                />
              );
            })
          )}
        </svg>

        {CONSTELLATION_NODES.map((node) => {
          const isSelected = node.id === selectedId;
          const isVisited = visited.includes(node.id);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleSelect(node.id)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute px-3 py-1.5 rounded-full text-xs font-medium transition-transform whitespace-nowrap ${
                isSelected
                  ? 'bg-[#FAF6EE] text-[#1B3428] scale-105 shadow-md'
                  : isVisited
                  ? 'bg-[#6F957C] text-white'
                  : 'bg-[#335C47] text-[#DDE9E0] border border-white/25'
              }`}
            >
              {node.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
        <span className="text-sm font-semibold text-[var(--sp-ink)] block">{selectedNode.label}</span>
        <p className="text-xs text-[var(--sp-ink-muted)] mt-1 leading-relaxed">
          {selectedNode.summary}
        </p>
      </div>
    </div>
  );
};
