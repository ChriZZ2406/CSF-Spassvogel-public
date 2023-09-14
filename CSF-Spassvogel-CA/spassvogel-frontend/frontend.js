import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JokeViewer() {
  const [joke, setJoke] = useState(null);

  useEffect(() => {
    fetchJoke();
  }, []);

  const fetchJoke = () => {
    axios.get('http://localhost:3001/joke').then(response => {  // URL geändert
      setJoke(response.data);
    });
  };

  const handleRate = (rating) => {
    axios.post(`/rate/${joke.id}`, { rating }).then(() => {
      fetchJoke(); // Lade nach dem Bewerten einen neuen Witz
    });
  };

  return (
    <div>
      <p>{joke?.content}</p>
      <div>
        <button onClick={() => handleRate(1)}>1</button>
        <button onClick={() => handleRate(2)}>2</button>
        <button onClick={() => handleRate(3)}>3</button>
        <button onClick={() => handleRate(4)}>4</button>
        <button onClick={() => handleRate(5)}>5</button>
      </div>
    </div>
  );
}

function TopJokes() {
  const [topJokes, setTopJokes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/top-jokes').then(response => {  // URL geändert
      setTopJokes(response.data);
    });
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: '300px', height: '100%', overflowY: 'scroll' }}>
      <h2>Top 10 Witze</h2>
      {topJokes.map(j => <p key={j.id}>{j.content}</p>)}
    </div>
  );
}

function App() {
  return (
    <div>
      <JokeViewer />
      <TopJokes />
    </div>
  );
}

export default App;
