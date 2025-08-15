import { useRef, useState } from 'react';

const IDS = ['dan','adam','ariel','ricci','shaun','brad','matty'];

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);

  const importFile = async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const data = JSON.parse(text);
    const qs = (data.questions||[]).map(q => ({
      quote: q.quote,
      options: q.options.map(normalize),
      answer: normalize(q.answer),
    }));
    setQuestions(qs);
    setI(0); setScore(0); setDone(false);
  };

  const normalize = s => {
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

  const current = questions[i];

  const choose = id => {
    if (!current) return;
    if (id === current.answer) setScore(s => s + 1);
    const n = i + 1;
    if (n >= questions.length) setDone(true);
    setI(n);
  };

  return (
    <div className="container">
      <h1>TRANScesspool Trivia</h1>
      <p className="muted">{questions.length ? `${questions.length} questions ready` : 'Import the questions JSON to get started.'}</p>

      <div className="row">
        <button className="btn primary" onClick={() => fileRef.current?.click()}>Import Questions JSON</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={importFile} style={{display:'none'}}/>
      </div>

      {!questions.length && <div className="card">Waiting for questions…</div>}

      {!!questions.length && !done && (
        <div className="grid">
          <div className="row" style={{justifyContent:'space-between'}}>
            <strong>Score: {score}</strong>
            <span>Q {Math.min(i + 1, questions.length)} / {questions.length}</span>
          </div>

          <div className="card">
            <h3>Who said:</h3>
            <p className="quote">“{current?.quote}”</p>
            <div className="grid">
              {current?.options.map(pid => (
                <button key={pid} className="option" onClick={() => choose(pid)}>
                  <img className="avatar" src={`/avatars/${pid}.jpg`} onError={(e)=>{e.currentTarget.src='/avatars/fallback.jpg'}} alt={pid}/>
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

function label(id){
  switch(id){
    case 'dan': return 'Dan';
    case 'adam': return 'Adam Mandelbaum';
    case 'ariel': return 'Ariel Shaffir (Chels)';
    case 'ricci': return 'Ricci Plotkin';
    case 'shaun': return 'Shaun Plotkin';
    case 'brad': return 'Brad Silberg (Bird)';
    case 'matty': return 'Matthew Jones (Matty)';
    default: return id;
  }
}
