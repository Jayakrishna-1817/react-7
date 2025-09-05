import React, { useState, useEffect } from "react";
import "./App.css";

const shuffleCards = () => {
  const nums = [...Array(8).keys()]; 
  const cards = [...nums, ...nums]   
    .sort(() => Math.random() - 0.5) 
    .map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false
    }));
  return cards;
};

export default function MemoryGame() {
  const [cards, setCards] = useState(shuffleCards);
  const [flippedCards, setFlippedCards] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState(
    () => localStorage.getItem("bestTime") || null
  );
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let timer;
    if (!gameOver) {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameOver]);

  const handleCardClick = (card) => {
    if (disabled || card.flipped || card.matched) return;

    const flipped = [...flippedCards, card];
    setCards((prev) =>
      prev.map((c) =>
        c.id === card.id ? { ...c, flipped: true } : c
      )
    );

    if (flipped.length === 2) {
      setDisabled(true);
      setTimeout(() => checkMatch(flipped), 800);
    }
    setFlippedCards(flipped);
  };

  const checkMatch = ([first, second]) => {
    if (first.value === second.value) {
      setCards((prev) =>
        prev.map((c) =>
          c.value === first.value ? { ...c, matched: true } : c
        )
      );
    } else {
      setCards((prev) =>
        prev.map((c) =>
          c.id === first.id || c.id === second.id
            ? { ...c, flipped: false }
            : c
        )
      );
    }
    setFlippedCards([]);
    setDisabled(false);
  };

  useEffect(() => {
    if (cards.every((c) => c.matched)) {
      setGameOver(true);
      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem("bestTime", time);
      }
    }
  }, [cards, time, bestTime]);

  const restartGame = () => {
    setCards(shuffleCards);
    setFlippedCards([]);
    setDisabled(false);
    setTime(0);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <h1>Memory Game</h1>
      <div>
        <span>Time: {time}s</span>{' '}
        {bestTime && <span>Best: {bestTime}s</span>}
      </div>
      <div className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card${card.flipped || card.matched ? " flipped" : ""}`}
            onClick={() => handleCardClick(card)}
          >
            {card.flipped || card.matched ? card.value : "?"}
          </div>
        ))}
      </div>
      <button id="restart" onClick={restartGame}>
        Restart Game
      </button>
    </div>
  );
}