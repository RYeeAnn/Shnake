import './App.scss';
import { useState, useEffect, useCallback, useMemo } from 'react';

function App() {
  const gridSize = 20;
  const headerHeight = 2; // Reserve top 2 rows for header
  const gameSpeed = 150;
  
  const directions = useMemo(() => ({
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    INPLACE: { x: 0, y: 0 }
  }), []);

  // Fixed useState - should be numbers, not arrays
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved) : 0;
  });
  
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 8 }); // Start below header
  const [direction, setDirection] = useState('INPLACE');
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Generate random food position that avoids header area and snake
  const generateFood = useCallback((currentSnake = snake) => {
    let attempts = 0;
    
    while (attempts < 100) {
      const newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * (gridSize - headerHeight)) + headerHeight // Ensure y >= headerHeight
      };
      
      const isOccupied = currentSnake.some(segment => 
        segment.x === newFood.x && segment.y === newFood.y
      );
      
      if (!isOccupied) {
        return newFood;
      }
      
      attempts++;
    }
    
    // Fallback position if all attempts fail
    return {
      x: Math.floor(gridSize / 2),
      y: Math.floor((gridSize - headerHeight) / 2) + headerHeight
    };
  }, [snake, gridSize, headerHeight]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          restartGame();
        }
        return;
      }

      if (!gameStarted && (e.key === ' ' || e.key === 'Enter')) {
        setGameStarted(true);
        setDirection('RIGHT'); // Start moving right
        return;
      }

      if (!gameStarted) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver, gameStarted]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || direction === 'INPLACE') return;

    const gameInterval = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        
        head.x += directions[direction].x;
        head.y += directions[direction].y;

        // Check wall collision
        if (head.x < 0 || head.x >= gridSize || head.y < headerHeight || head.y >= gridSize) {
          setGameOver(true);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 1;
          setScore(newScore);
          
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameInterval);
  }, [gameStarted, gameOver, direction, directions, food, score, highScore, generateFood]);

  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 8 });
    setDirection('INPLACE');
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="container">
      <div className="game-wrapper">
        <div className="game-board">
          {/* Header */}
          <div className="game-header">
            <div className="score">Score: {score}</div>
            <div className="high-score">Best: {highScore}</div>
          </div>

          {/* Game Area */}
          <div className="game-area">
            {/* Snake segments - Always visible for debugging */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
                style={{
                  left: `${(segment.x / gridSize) * 100}%`,
                  top: `${((segment.y - headerHeight) / (gridSize - headerHeight)) * 100}%`,
                  opacity: gameStarted ? 1 : 0.5
                }}
              />
            ))}

            {/* Food - Always visible for debugging */}
            <div
              className="food"
              style={{
                left: `${(food.x / gridSize) * 100}%`,
                top: `${((food.y - headerHeight) / (gridSize - headerHeight)) * 100}%`,
                opacity: gameStarted ? 1 : 0.5
              }}
            />

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="game-overlay">
                <div className="game-over">
                  <h2>Game Over!</h2>
                  <p>Score: {score}</p>
                  {score === highScore && score > 0 && (
                    <p className="new-record">🎉 New High Score! 🎉</p>
                  )}
                  <button onClick={restartGame} className="restart-btn">
                    Play Again
                  </button>
                  <p className="controls-hint">Press SPACE or ENTER to restart</p>
                </div>
              </div>
            )}

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
              <div className="game-overlay">
                <div className="start-screen">
                  <h1>🐍 Shnake</h1>
                  <div className="instructions">
                    <p>Use arrow keys or WASD to control the snake</p>
                    <p>Eat the red food to grow and score points</p>
                    <p>Don't hit the walls or yourself!</p>
                  </div>
                  <button onClick={() => {setGameStarted(true); setDirection('RIGHT');}} className="start-btn">
                    Start Game
                  </button>
                  <p className="controls-hint">Press SPACE or ENTER to start</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
