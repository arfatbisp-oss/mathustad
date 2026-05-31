// @ts-nocheck
import { useState, useRef } from 'react';

const TOPICS = [
  { id: 'natural', name: 'Natural Numbers', urduName: 'قدرتی اعداد' },
  { id: 'integers', name: 'Integers', urduName: 'صحیح اعداد' },
  { id: 'fractions', name: 'Fractions', urduName: 'کسور' },
  { id: 'hcf_lcm', name: 'HCF and LCM', urduName: 'م م ا اور ل م م' },
  { id: 'bodmas', name: 'BODMAS', urduName: 'ترتیب عملیات' },
  { id: 'percentage', name: 'Percentage', urduName: 'فیصد' },
];

const QUESTIONS = {
  natural: [
    {
      q: 'Write all natural numbers between 15 and 25.',
      marks: 2,
      difficulty: 'Easy',
    },
    {
      q: 'Is zero a natural number? Explain with reason.',
      marks: 2,
      difficulty: 'Easy',
    },
    {
      q: 'Write the successor and predecessor of 999.',
      marks: 2,
      difficulty: 'Easy',
    },
    {
      q: 'Which is the smallest whole number? Is it also a natural number?',
      marks: 3,
      difficulty: 'Medium',
    },
  ],
  integers: [
    {
      q: 'Arrange in ascending order: -5, 3, -1, 0, 7, -9',
      marks: 2,
      difficulty: 'Easy',
    },
    { q: 'Add: (-12) + (+8) + (-3)', marks: 2, difficulty: 'Easy' },
    { q: 'Subtract: (-15) - (-6)', marks: 2, difficulty: 'Easy' },
    {
      q: 'Multiply: (-4) multiplied by (-7) multiplied by (+2)',
      marks: 3,
      difficulty: 'Medium',
    },
  ],
  fractions: [
    { q: 'Simplify 36/48 to lowest terms.', marks: 2, difficulty: 'Easy' },
    { q: 'Add: 2/3 + 3/4 + 1/6', marks: 3, difficulty: 'Medium' },
    {
      q: 'Subtract: 5 and 3/4 minus 2 and 1/3',
      marks: 3,
      difficulty: 'Medium',
    },
    {
      q: 'Arrange in descending order: 3/4, 2/3, 5/6, 7/12',
      marks: 4,
      difficulty: 'Hard',
    },
  ],
  hcf_lcm: [
    {
      q: 'Find HCF of 24 and 36 by prime factorization.',
      marks: 3,
      difficulty: 'Medium',
    },
    { q: 'Find LCM of 12, 18 and 24.', marks: 3, difficulty: 'Medium' },
    {
      q: 'Two bells ring every 15 and 20 minutes. If they ring together at 8am, when will they next ring together?',
      marks: 4,
      difficulty: 'Hard',
    },
  ],
  bodmas: [
    {
      q: 'Simplify: 8 + 4 multiplied by 3 minus 6 divided by 2',
      marks: 2,
      difficulty: 'Easy',
    },
    {
      q: 'Simplify: (15 minus 3) multiplied by 4 plus 8 divided by 2',
      marks: 3,
      difficulty: 'Medium',
    },
    {
      q: 'Simplify: 5 + [3 multiplied by {8 minus (4 + 1)}]',
      marks: 4,
      difficulty: 'Hard',
    },
  ],
  percentage: [
    { q: 'Convert 3/5 into percentage.', marks: 2, difficulty: 'Easy' },
    { q: 'Find 35 percent of 240.', marks: 2, difficulty: 'Easy' },
    {
      q: 'A shirt costs Rs. 800. After 15 percent discount, what is the price?',
      marks: 3,
      difficulty: 'Medium',
    },
    {
      q: 'Price increased from Rs. 500 to Rs. 600. Find percentage increase.',
      marks: 4,
      difficulty: 'Hard',
    },
  ],
};

export default function App() {
  const [urdu, setUrdu] = useState(false);
  const [screen, setScreen] = useState('topics'); // topics | questions | solution
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [solved, setSolved] = useState(0);

  const questions = selectedTopic ? QUESTIONS[selectedTopic.id] || [] : [];

  function stopSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setCurrentStep(-1);
  }

  function speakSteps(stepsArr, index) {
    if (!stepsArr || index >= stepsArr.length) {
      setSpeaking(false);
      setCurrentStep(-1);
      return;
    }
    const step = stepsArr[index];
    const text =
      step.title +
      '. ' +
      step.explanation +
      (step.result ? '. The answer is: ' + step.result : '');
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = urdu ? 'ur-PK' : 'en-US';
    utter.rate = urdu ? 0.8 : 0.88;
    utter.pitch = 1.1;
    setCurrentStep(index);
    setSpeaking(true);
    utter.onend = function () {
      setTimeout(function () {
        speakSteps(stepsArr, index + 1);
      }, 500);
    };
    utter.onerror = function () {
      speakSteps(stepsArr, index + 1);
    };
    window.speechSynthesis.speak(utter);
  }

  async function solve(q) {
    setSelectedQ(q);
    setSteps([]);
    setCurrentStep(-1);
    stopSpeech();
    setLoading(true);
    setScreen('solution');

    const systemEn = `You are a warm encouraging Pakistani math teacher for Class 7 students.
For the question, respond ONLY with a JSON array. Each item has:
- "title": step name like "Step 1: Understand"
- "explanation": 2-3 friendly sentences as if talking to a 12-year-old. Use words like "Great!", "Remember!", "Watch carefully!".
- "result": short math result for this step

Last item title must be "Remember This!" with a memory tip.
Return ONLY valid JSON array, nothing else.`;

    const systemUr = `آپ ایک مہربان پاکستانی ریاضی کے استاد ہیں جو کلاس 7 کے طالب علم کو پڑھاتے ہیں۔
صرف JSON array میں جواب دیں۔ ہر item میں:
- "title": قدم کا نام
- "explanation": 2-3 آسان اردو جملے جیسے 12 سال کے بچے کو سمجھا رہے ہوں
- "result": اس قدم کا مختصر جواب

آخری item کا title "یاد رکھیں!" ہو۔
صرف valid JSON array واپس کریں۔`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: urdu ? systemUr : systemEn,
          messages: [{ role: 'user', content: 'Question: ' + q.q }],
        }),
      });
      const data = await res.json();
      let text = data.content && data.content[0] ? data.content[0].text : '[]';
      text = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(text);
      setSteps(parsed);
      setSolved(function (s) {
        return s + 1;
      });
      setTimeout(function () {
        speakSteps(parsed, 0);
      }, 600);
    } catch (e) {
      setSteps([
        {
          title: 'Error',
          explanation: 'Could not load. Please check internet and try again.',
          result: '',
        },
      ]);
    }
    setLoading(false);
  }

  const diffColor = function (d) {
    return d === 'Easy' ? '#16a34a' : d === 'Medium' ? '#d97706' : '#dc2626';
  };
  const diffBg = function (d) {
    return d === 'Easy' ? '#dcfce7' : d === 'Medium' ? '#fef3c7' : '#fee2e2';
  };

  // ─── HEADER ───────────────────────────────────────────────
  const Header = function () {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d, #166534)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {screen !== 'topics' && (
            <button
              onClick={function () {
                stopSpeech();
                if (screen === 'solution') setScreen('questions');
                else setScreen('topics');
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: 32,
                height: 32,
                borderRadius: 8,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ←
            </button>
          )}
          <div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
              {urdu ? 'ریاضی استاد' : 'Math Ustad'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>
              {urdu ? 'کلاس 7 — پنجاب بورڈ' : 'Class 7 — Punjab Board'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '4px 10px',
              color: 'white',
              fontSize: 11,
            }}
          >
            ✅ {solved}
          </div>
          <div
            onClick={function () {
              stopSpeech();
              setUrdu(function (u) {
                return !u;
              });
            }}
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: '5px 12px',
              color: 'white',
              fontSize: 12,
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {urdu ? '🇵🇰 اردو' : '🇬🇧 EN'}
          </div>
        </div>
      </div>
    );
  };

  // ─── SCREEN 1: TOPICS ─────────────────────────────────────
  if (screen === 'topics') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f0fdf4',
          fontFamily: 'Georgia, serif',
        }}
      >
        <Header />
        <div style={{ padding: '20px 16px' }}>
          <div style={{ fontSize: 22, marginBottom: 4, textAlign: 'center' }}>
            👨‍🏫
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#14532d',
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            {urdu ? 'موضوع منتخب کریں' : 'Select a Topic'}
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#4b7c5d',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {urdu
              ? 'باب اول: اعداد اور عملیات'
              : 'Chapter 1: Numbers and Operations'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOPICS.map(function (t) {
              return (
                <div
                  key={t.id}
                  onClick={function () {
                    setSelectedTopic(t);
                    setScreen('questions');
                  }}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: '16px 18px',
                    border: '1px solid #dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: '#14532d',
                      }}
                    >
                      {urdu ? t.urduName : t.name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}
                    >
                      {QUESTIONS[t.id] ? QUESTIONS[t.id].length : 0}{' '}
                      {urdu ? 'سوالات' : 'questions'}
                    </div>
                  </div>
                  <div style={{ fontSize: 18, color: '#16a34a' }}>›</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN 2: QUESTIONS ──────────────────────────────────
  if (screen === 'questions') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f0fdf4',
          fontFamily: 'Georgia, serif',
        }}
      >
        <Header />
        <div style={{ padding: '16px' }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#14532d',
              marginBottom: 14,
            }}
          >
            {urdu ? selectedTopic.urduName : selectedTopic.name}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map(function (q, i) {
              return (
                <div
                  key={i}
                  onClick={function () {
                    solve(q);
                  }}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: '14px 16px',
                    border: '1px solid #dcfce7',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: '#14532d',
                        lineHeight: 1.6,
                        flex: 1,
                      }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                        Q{i + 1}.{' '}
                      </span>
                      {q.q}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: 10,
                          color: diffColor(q.difficulty),
                          background: diffBg(q.difficulty),
                        }}
                      >
                        {q.difficulty}
                      </span>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>
                        {q.marks}m
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#16a34a',
                      fontSize: 12,
                    }}
                  >
                    <span>🎙️</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {urdu ? 'استاد سے سنیں' : 'Hear teacher explain'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN 3: SOLUTION ───────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0fdf4',
        fontFamily: 'Georgia, serif',
      }}
    >
      <Header />

      {selectedQ && (
        <div
          style={{
            margin: '14px 16px 0',
            padding: '12px 14px',
            background: 'white',
            borderRadius: 12,
            border: '1px solid #dcfce7',
            fontSize: 13,
            color: '#14532d',
            lineHeight: 1.6,
          }}
        >
          <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Q: </span>
          {selectedQ.q}
        </div>
      )}

      {speaking && (
        <div
          style={{
            margin: '12px 16px 0',
            padding: '10px 14px',
            background: '#15803d',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#86efac',
              }}
            ></div>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              {urdu ? 'استاد بول رہے ہیں...' : 'Teacher is speaking...'}
            </span>
          </div>
          <button
            onClick={stopSpeech}
            style={{
              padding: '4px 12px',
              borderRadius: 10,
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 'bold',
            }}
          >
            ⏹ {urdu ? 'روکیں' : 'Stop'}
          </button>
        </div>
      )}

      <div style={{ padding: '12px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🏫</div>
            <div style={{ color: '#4b7c5d', fontSize: 14 }}>
              {urdu
                ? 'استاد وضاحت تیار کر رہے ہیں...'
                : 'Teacher is preparing explanation...'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map(function (step, i) {
              const isActive = currentStep === i;
              return (
                <div
                  key={i}
                  style={{
                    background: isActive ? '#f0fdf4' : 'white',
                    borderRadius: 14,
                    border: '2px solid ' + (isActive ? '#16a34a' : '#dcfce7'),
                    padding: '14px 14px',
                    transition: 'all 0.3s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: isActive ? '#15803d' : '#374151',
                      }}
                    >
                      {isActive ? '🔊 ' : '📌 '}
                      {step.title}
                    </div>
                    <button
                      onClick={function () {
                        stopSpeech();
                        setTimeout(function () {
                          speakSteps(steps, i);
                        }, 200);
                      }}
                      style={{
                        fontSize: 10,
                        padding: '3px 10px',
                        borderRadius: 10,
                        border: '1px solid #dcfce7',
                        background: isActive ? '#15803d' : 'white',
                        color: isActive ? 'white' : '#9ca3af',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {urdu ? 'دہرائیں' : 'Replay'}
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#374151',
                      lineHeight: 1.8,
                      direction: urdu ? 'rtl' : 'ltr',
                      textAlign: urdu ? 'right' : 'left',
                    }}
                  >
                    {step.explanation}
                  </div>
                  {step.result && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#dcfce7',
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: '#15803d',
                      }}
                    >
                      {step.result}
                    </div>
                  )}
                </div>
              );
            })}

            {!speaking && steps.length > 0 && (
              <button
                onClick={function () {
                  speakSteps(steps, 0);
                }}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: '#15803d',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                🔊 {urdu ? 'دوبارہ سنیں' : 'Listen Again'}
              </button>
            )}

            {steps.length > 0 && (
              <button
                onClick={function () {
                  stopSpeech();
                  setScreen('questions');
                }}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 12,
                  border: '2px solid #dcfce7',
                  background: 'white',
                  color: '#15803d',
                  fontSize: 13,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ← {urdu ? 'دوسرا سوال' : 'Back to Questions'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
