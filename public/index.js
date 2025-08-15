// pages/index.js
import { useEffect, useRef, useState } from 'react';

// --- helpers ---
const normalize = (s = '') => {
  const x = s.toLowerCase();
  if (x.includes('matt')) return 'matty';
  if (x.includes('ariel') || x.includes('chels')) return 'ariel';
  if (x.includes('adam')) return 'adam';
  if (x.includes('shaun')) return 'shaun';
  if (x.includes('ricci')) return 'ricci';
  if (x.includes('silberg') || x.includes('bird') || x.includes('brad')) return 'brad';
  if (x.includes('dan')) return 'dan';
  return x.replaceAll(' ', '');
};

const label = (id) => {
  switch (id) {
    case 'dan':   return 'Dan';
    case 'adam':  return 'Adam Mandelbaum';
    case 'ariel': return 'Ariel Shaffir (Chels)';
    case 'ricci': return 'Ricci Plotkin';
    case 'shaun': return 'Shaun Plotkin';
    case 'brad':  return 'Brad Silberg (Bird)';
    case 'matty': return 'Matthew Jones (Matty)';
    default:      return id;
  }
};

export default function Home() {
  const [questions, setQuestions] = useState([]); // {quote, options[id], answer[id]}[]
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  // --- Auto-load bundled JSON from /public on first load ---
  useEffect(() => {
    (async () => {
      try {
        // Make sure your JSON file is at: public/transcesspool_trivia_questions_v2.json
        const res = await fetch('/transcesspool_trivia_questions_v2.json', { cache: 'no-store' });
        if (!res.ok) {
          // No default file found -> keep waiting for manual import
          return;
        }
        const data = await res.json();
        const raw = Array.isArray(data?.questions) ? data.questions : [];
        const qs = raw.map(q => ({
          quote: q.quote,
          options: (q.options || []).map(normalize),
          answer: normalize(q.answer || '')
        }));
        if (qs.length) {
          setQuestions(qs);
          setI(0); setScore(0); setDone(false);
        }
      } catch (e) {
        // Fail quietly; user can still import manually
        console.warn('Autoload failed:', e);
      }
    })();
  }, []);

  // --- Manual import as fallback / for updates ---
  const onPickFile = () => fileRef.current?.click();
  const onFileChange = async (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const raw = Array.isArray(data?.questions) ? data.questions : [];
      if (!raw.length) throw new Error('No questions[] found in JSON');
      const qs = raw.map(q => ({
        quote: q.quote,
        options: (q.options || []).map(normalize),
        answer: normalize(q.answer || '')
      }));
      setQuestions(qs);
      setI(0); setScore(0); setDone(false);
    } catch (err) {
      setError(err?.message || 'Import failed');
    } finally {
      e.target.value = ''; // allow re-import of same file
    }
  };

  const current = questions[i];

  const choose = (id) => {
    if (!current) return;
    if (id === current.answer) setScore(s => s + 1);
    const n = i + 1;
    if (n >= questions.length) setDone(true);
    setI(n);
  };

  return (
    <div className="container">
      <h1>TRANScesspool Trivia</h1>
      {questions.length
        ? <p className="muted">{questions.length} questions ready</p>
        : <p className="muted">Import the questions JSON to get started.</p>}

      <div className="row" style={{ marginBottom: 16 }}>
        <button className="btn btn primary" onClick={onPickFile}>Import Questions JSON</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={onFileChange} style={{ display: 'none' }} />
      </div>

      {error && (
        <div className="card" style={{ borderColor: '#fecaca', background: '#fff1f2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {!questions.length && (
        <div className="card">Waiting for questions…</div>
      )}

      {!!questions.length && !done && (
        <div className="grid">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div><strong>Score:</strong> {score}</div>
            <div>Q {Math.min(i + 1, questions.length)} / {questions.length}</div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Who said:</h3>
            <p className="quote">“{current?.quote}”</p>

            <div className="grid">
              {current?.options.map(pid => (
                <button key={pid} className="option" onClick={() => choose(pid)}>
                  <img
                    className="avatar"
                    src={`/avatars/${pid}.jpg`}
                    alt={label(pid)}
                    onError={(e) => { e.currentTarget.src = '/avatars/fallback.jpg'; }}
                  />
                  <span className="label">{label(pid)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="card">
          <h2>Game over</h2>
          <p>You scored {score}/{questions.length}.</p>
          <button className="btn" onClick={() => { setI(0); setScore(0); setDone(false); }}>Play again</button>
        </div>
      )}
    </div>
  );
}
