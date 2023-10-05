import './App.scss';
import { useState, useEffect } from 'react';

function App() {

  const gridSize = 20;
  const directions = {
    UP:     { x: 0, y: -1, },
    DOWN:   { x: 0, y: 1 },
    LEFT:   { x: -1, y: 0 },
    RIGHT:  { x: 1, y: 0 },
    INPLACE: {x: 0, y: 0 }
};

const [score, setScore] = useState([]);
const [highscore, setHighScore] = useState([]); 
const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
const [food, setFood] = useState({ x: 5, y: 5 });
const [direction, setDirection] = useState('INPLACE');





useEffect(() => {
  const handleKeyPress = e => {
    switch(e.key) {
      case 'ArrowUp':
        setDirection('UP');
        break;
      case 'ArrowDown':
        setDirection('DOWN');
        break;
      case 'ArrowLeft':
        setDirection('LEFT');
        break;
      case 'ArrowRight':
        setDirection('RIGHT');
        break;
      default:
        break;
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);

useEffect(() => {
  const gameInterval = setInterval(() => {
    moveSnake();
  }, 100); // Adjust for speed

  return () => clearInterval(gameInterval);
}, [snake, direction]);





const moveSnake = () => {
  const newSnake = snake.map(segment => ({ ...segment })); // Clone current snake
  const head = Object.assign({}, newSnake[0]); // Get current head
  head.x += directions[direction].x;
  head.y += directions[direction].y;
  
  newSnake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    // If the snake eats food
    const newScore = score + 1;
    setScore(newScore);
    if (newScore > highscore) {
      setHighScore(newScore);
    }
    placeFood();
  } else {
    newSnake.pop();
  }

  // Check for collision with self or wall
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some(s => s.x === head.x && s.y === head.y)) {
    // End game
    setSnake([{ x: 10, y: 10 }]);
    setDirection('INPLACE');
    setScore(0);
  } else {
    setSnake(newSnake);
  }
};





const placeFood = () => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) {
      break;
    }
  }
  setFood(newFood);
};




return (
  <div className="container">
    <div className="box">
      <div className="box__header">
        <div className="box__header--score">Score: {score}</div>
        <div className="box__header--highscore">High score: {highscore}</div>
      </div>

      <div className="box__content">
        {snake.map((segment, index) => (
          <div 
            className="snake-segment" 
            key={index} 
            style={{ left: `${segment.x * 3.75}vmin`, top: `${segment.y * 3.75}vmin` }}
          ></div>
        ))}
        <div 
          className="food" 
          style={{ left: `${food.x * 3.75}vmin`, top: `${food.y * 3.75}vmin` }}
        ></div>
      </div>
    </div>
  </div>
);

}

export default App;
