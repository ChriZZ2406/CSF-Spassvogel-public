import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [joke, setJoke] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('flachwitze');

  const fetchJoke = () => {
    axios.get(`https://witzapi.de/api/joke/`, { params: { category: selectedCategory } })
      .then(response => {
        setJoke(response.data[0]);
      })
      .catch(error => {
        console.error("Ein Fehler ist aufgetreten beim Laden des Witzes:", error);
      });
  };

  useEffect(() => {
    fetchJoke();
  }, [selectedCategory]);

  return (
    <div>
      <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
        <option value="flachwitze">Flachwitze</option>
        <option value="lehrerwitze">Lehrerwitze</option>
        <option value="programmierwitze">Programmierwitze</option>
        {/* ... weitere Optionen */}
      </select>

      <button onClick={fetchJoke}>Witz abrufen</button>
      <p>{joke?.text}</p>
      {/* Bewertung und weitere Features können hier hinzugefügt werden */}
    </div>
  );
}

export default App;
