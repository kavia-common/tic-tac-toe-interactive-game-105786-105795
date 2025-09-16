import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App is the root component for the Ocean Professional themed Tic Tac Toe game.
 * It renders a modern centered layout with header, board, status, and controls.
 */
function App() {
  return (
    <div className="ocean-app">
      <Header />
      <main className="ocean-main">
        <Game />
      </main>
      <Footer />
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Header renders the title and theme styling cues for the application.
 */
function Header() {
  return (
    <header className="ocean-header" aria-label="Tic Tac Toe Header">
      <div className="ocean-brand">
        <div className="ocean-logo" aria-hidden="true">◯×</div>
        <div className="ocean-title">
          <h1 className="title">Tic Tac Toe</h1>
          <p className="subtitle">Ocean Professional</p>
        </div>
      </div>
    </header>
  );
}

/**
 * PUBLIC_INTERFACE
 * Footer provides simple credits.
 */
function Footer() {
  return (
    <footer className="ocean-footer">
      <p className="footer-text">Built with React • Two players or vs Computer</p>
    </footer>
  );
}

/**
 * PUBLIC_INTERFACE
 * Game component encapsulates the game state and logic, supporting 2P and Vs Computer.
 * It renders the board, status, history, and control panel with Ocean Professional styling.
 */
function Game() {
  // 0..8 board cells; null, 'X', 'O'
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('HUMAN'); // 'HUMAN' | 'CPU'
  const [startingPlayer, setStartingPlayer] = useState('X'); // who starts each new game
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const current = history[stepNumber];
  const winnerInfo = useMemo(() => calculateWinner(current), [current]);
  const isBoardFull = useMemo(() => current.every((c) => c !== null), [current]);
  const gameOver = winnerInfo.winner !== null || isBoardFull;

  // If CPU mode and it's CPU's turn, compute and make a move automatically
  const isCpuTurn = mode === 'CPU' && !gameOver && ((startingPlayer === 'O' && xIsNext) || (startingPlayer === 'X' && !xIsNext));
  React.useEffect(() => {
    if (isCpuTurn) {
      const timeout = setTimeout(() => {
        const cpuMove = chooseBestMove(current, xIsNext ? 'X' : 'O');
        if (cpuMove !== -1) {
          handlePlay(cpuMove);
        }
      }, 400);
      return () => clearTimeout(timeout);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCpuTurn, current, xIsNext]);

  // PUBLIC_INTERFACE
  function handlePlay(index) {
    /**
     * Handles a player's move at index, updates history and toggles turns.
     */
    if (current[index] || gameOver) return;
    const next = current.slice();
    next[index] = xIsNext ? 'X' : 'O';
    const newHistory = history.slice(0, stepNumber + 1).concat([next]);
    setHistory(newHistory);
    setStepNumber(newHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function jumpTo(step) {
    /**
     * Jumps to a specific step in history, allowing time travel.
     */
    setStepNumber(step);
    setXIsNext(step % 2 === 0 ? startingPlayer === 'X' : startingPlayer !== 'X');
  }

  // PUBLIC_INTERFACE
  function startNewRound(nextStarter = startingPlayer) {
    /**
     * Starts a fresh round, preserving scores and mode.
     * nextStarter: 'X' or 'O'
     */
    setHistory([Array(9).fill(null)]);
    setStepNumber(0);
    setXIsNext(nextStarter === 'X');
    setStartingPlayer(nextStarter);
  }

  // PUBLIC_INTERFACE
  function resetMatch() {
    /**
     * Resets the entire match state: scores and board.
     */
    setScores({ X: 0, O: 0, draws: 0 });
    startNewRound('X');
  }

  // Update scores when game ends
  React.useEffect(() => {
    if (!gameOver) return;
    setScores((prev) => {
      if (winnerInfo.winner === 'X') return { ...prev, X: prev.X + 1 };
      if (winnerInfo.winner === 'O') return { ...prev, O: prev.O + 1 };
      return { ...prev, draws: prev.draws + 1 };
    });
  }, [gameOver, winnerInfo.winner]);

  // Status message
  const nextPlayer = xIsNext ? 'X' : 'O';
  const status = winnerInfo.winner
    ? `Winner: ${winnerInfo.winner}`
    : isBoardFull
    ? 'Draw'
    : `Next: ${nextPlayer}${mode === 'CPU' ? nextPlayer === startingPlayer ? ' (You)' : ' (CPU)' : ''}`;

  return (
    <section className="game-wrap">
      <div className="game-card">
        <div className="game-header">
          <h2 className="game-title">Play</h2>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        <ScoreBar scores={scores} />

        <div className="status" role="status" aria-live="polite">
          <span className={`badge ${winnerInfo.winner ? 'badge-win' : isBoardFull ? 'badge-draw' : 'badge-next'}`}>
            {status}
          </span>
        </div>

        <Board
          squares={current}
          onPlay={handlePlay}
          winningLine={winnerInfo.line}
          disabled={gameOver || (mode === 'CPU' && !isCpuTurn && ((startingPlayer === 'X' && !xIsNext) || (startingPlayer === 'O' && xIsNext)))}
        />

        <Controls
          onNewRound={() => startNewRound(startingPlayer)}
          onSwapStarter={() => startNewRound(startingPlayer === 'X' ? 'O' : 'X')}
          onResetMatch={resetMatch}
          mode={mode}
          onModeChange={setMode}
          startingPlayer={startingPlayer}
        />

        <History
          history={history}
          stepNumber={stepNumber}
          onJump={jumpTo}
        />
      </div>
    </section>
  );
}

/**
 * PUBLIC_INTERFACE
 * ModeToggle switches between Human vs Human and Human vs CPU modes.
 */
function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Game mode">
      <button
        className={`btn ${mode === 'HUMAN' ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => onChange('HUMAN')}
      >
        2 Players
      </button>
      <button
        className={`btn ${mode === 'CPU' ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => onChange('CPU')}
      >
        Vs Computer
      </button>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ScoreBar shows ongoing match scores for X, O, and draws.
 */
function ScoreBar({ scores }) {
  return (
    <div className="scorebar" aria-label="Score board">
      <div className="score score-x">
        <span className="label">X</span>
        <span className="value">{scores.X}</span>
      </div>
      <div className="score score-draw">
        <span className="label">Draw</span>
        <span className="value">{scores.draws}</span>
      </div>
      <div className="score score-o">
        <span className="label">O</span>
        <span className="value">{scores.O}</span>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Board renders the 3x3 grid with Ocean Professional styling.
 */
function Board({ squares, onPlay, winningLine, disabled }) {
  return (
    <div
      className={`board ${disabled ? 'is-disabled' : ''}`}
      role="grid"
      aria-label="Tic Tac Toe board"
    >
      {squares.map((value, i) => {
        const isWinningCell = winningLine?.includes(i);
        return (
          <Square
            key={i}
            value={value}
            onClick={() => onPlay(i)}
            highlight={!!isWinningCell}
            disabled={disabled || value !== null}
            ariaLabel={`Cell ${i + 1}${value ? `, ${value}` : ''}`}
          />
        );
      })}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Square renders a single cell in the board.
 */
function Square({ value, onClick, highlight, disabled, ariaLabel }) {
  return (
    <button
      className={`square ${highlight ? 'square-win' : ''} ${value === 'X' ? 'sq-x' : value === 'O' ? 'sq-o' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {value}
    </button>
  );
}

/**
 * PUBLIC_INTERFACE
 * Controls provide actions for new round, swap starter, and reset.
 */
function Controls({ onNewRound, onSwapStarter, onResetMatch, mode, onModeChange, startingPlayer }) {
  return (
    <div className="controls" aria-label="Game controls">
      <div className="controls-row">
        <button className="btn btn-secondary" onClick={onNewRound}>
          New Round
        </button>
        <button className="btn btn-outline" onClick={onSwapStarter}>
          Starter: {startingPlayer} (swap)
        </button>
        <button className="btn btn-danger" onClick={onResetMatch}>
          Reset Match
        </button>
      </div>
      <div className="controls-row alt">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * History provides move list and time-travel functionality.
 */
function History({ history, stepNumber, onJump }) {
  return (
    <div className="history" aria-label="Move history">
      <h3 className="history-title">History</h3>
      <div className="history-list">
        {history.map((_, move) => {
          const desc = move ? `Go to move #${move}` : 'Go to start';
          return (
            <button
              key={move}
              className={`btn btn-ghost history-btn ${move === stepNumber ? 'is-active' : ''}`}
              onClick={() => onJump(move)}
            >
              {desc}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Winner calculation and simple AI
 */

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diags
];

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /**
   * Returns winner info {winner: 'X' | 'O' | null, line: number[] | null}
   */
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

// PUBLIC_INTERFACE
function chooseBestMove(squares, player) {
  /**
   * Simple AI: 1) Win if possible, 2) Block opponent, 3) Take center,
   * 4) Take a corner, 5) Take any side.
   */
  const opponent = player === 'X' ? 'O' : 'X';

  // Try to win
  const winMove = findWinningMove(squares, player);
  if (winMove !== -1) return winMove;

  // Try to block opponent
  const blockMove = findWinningMove(squares, opponent);
  if (blockMove !== -1) return blockMove;

  // Take center
  if (!squares[4]) return 4;

  // Take a corner
  const corners = [0, 2, 6, 8].filter((i) => !squares[i]);
  if (corners.length) return randomPick(corners);

  // Take a side
  const sides = [1, 3, 5, 7].filter((i) => !squares[i]);
  if (sides.length) return randomPick(sides);

  return -1;
}

function findWinningMove(squares, player) {
  for (const [a, b, c] of LINES) {
    const line = [squares[a], squares[b], squares[c]];
    const filledByPlayer = line.filter((v) => v === player).length;
    const emptyIndices = [a, b, c].filter((idx) => squares[idx] === null);
    if (filledByPlayer === 2 && emptyIndices.length === 1) {
      return emptyIndices[0];
    }
  }
  return -1;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default App;
