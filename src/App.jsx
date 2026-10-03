import React, { useMemo, useState } from "react";

const linked = (a, b) => a % b === 0 || b % a === 0;
const numbers = Array.from({ length: 100 }, (_, i) => i + 1);

export default function App() {
  const [route, setRoute] = useState([]);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(0);
  const [message, setMessage] = useState("Choose any number to begin.");
  const [wrong, setWrong] = useState(null);

  const current = route.length ? route[route.length - 1] : null;
  const legalMoves = useMemo(() => {
    if (current === null) return [];
    return numbers.filter(
      (n) => n !== current && !route.includes(n) && linked(current, n)
    );
  }, [current, route]);

  const trapped = route.length > 0 && legalMoves.length === 0;
  const gameOver = lives === 0 || trapped;

  function selectNumber(n) {
    if (gameOver || route.includes(n)) return;

    if (current === null) {
      setRoute([n]);
      setBest((value) => Math.max(value, 1));
      setMessage(`${n} selected. Find an unused factor or multiple.`);
      return;
    }

    if (!linked(current, n)) {
      const remaining = lives - 1;
      setLives(remaining);
      setWrong(n);
      setMessage(
        remaining > 0
          ? `${n} is not a factor or multiple of ${current}. ${remaining} chance${remaining === 1 ? "" : "s"} left.`
          : "Game over. You have used all three chances."
      );
      window.setTimeout(() => setWrong(null), 500);
      return;
    }

    const next = [...route, n];
    setRoute(next);
    setBest((value) => Math.max(value, next.length));
    const onward = numbers.filter(
      (x) => x !== n && !next.includes(x) && linked(n, x)
    );
    setMessage(
      onward.length
        ? "Correct. Choose the next factor or multiple."
        : `Game over. No valid moves remain from ${n}.`
    );
  }

  function reset() {
    setRoute([]);
    setLives(3);
    setMessage("Choose any number to begin.");
    setWrong(null);
  }

  function undo() {
    if (!route.length || gameOver) return;
    setRoute(route.slice(0, -1));
    setMessage("Last correct move undone.");
  }

  return (
    <main className="app-shell">
      <div className="app">
        <header className="header">
          <div>
            <div className="eyebrow">Number Route</div>
            <h1>Divisibility Challenge</h1>
            <p>Pick a factor or multiple. You have three chances.</p>
          </div>
          <div className="best-card"><span>Best</span><strong>{best}</strong></div>
        </header>

        <section className="status-card">
          <div className="status-grid">
            <div><span>Current</span><strong className="cyan">{current ?? "–"}</strong></div>
            <div><span>Chances</span><div className="hearts">{"♥".repeat(lives)}<i>{"♥".repeat(3 - lives)}</i></div></div>
            <div><span>Removed</span><strong>{route.length}</strong></div>
          </div>
          <div className={`message ${gameOver ? "ended" : ""}`}>
            {trapped ? `Game over. No valid moves remain from ${current}.` : message}
          </div>
        </section>

        <section className="board-card">
          <div className="board-heading"><h2>Board</h2><span>Unused numbers are not marked as valid or invalid</span></div>
          <div className="board">
            {numbers.map((n) => {
              const used = route.includes(n);
              const active = n === current;
              const bad = n === wrong;
              return (
                <button
                  key={n}
                  disabled={used || gameOver}
                  onClick={() => selectNumber(n)}
                  className={`${active ? "active" : ""} ${used && !active ? "used" : ""} ${bad ? "wrong" : ""}`}
                >{n}</button>
              );
            })}
          </div>
        </section>

        <div className="controls">
          <button className="secondary" onClick={undo} disabled={!route.length || gameOver}>Undo</button>
          <button className="primary" onClick={reset}>New game</button>
        </div>

        <section className="route-card">
          <h2>Your route</h2>
          <p>{route.length ? route.join(" → ") : "No numbers selected yet."}</p>
        </section>
      </div>
    </main>
  );
}
