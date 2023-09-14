// Importiert notwendige Funktionen und Bibliotheken von React und axios.
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importiert die zugehörige CSS-Datei für Stildefinitionen.

// Die Hauptkomponente der Anwendung.
function App() {
    // Verwaltet den Zustand des neuen Witzes mit useState.
    const [newJoke, setNewJoke] = useState('');

    // Diese Funktion wird aufgerufen, wenn der Nutzer im Textfeld tippt.
    const handleInputChange = (event) => {
        setNewJoke(event.target.value);
    };

    // Diese Funktion wird aufgerufen, um einen neuen Witz hinzuzufügen.
    const addJoke = (event) => {
        event.preventDefault(); // Verhindert die Standard-Formularübermittlung.

        // Sendet den neuen Witz an den Server.
        axios.post('http://localhost:3001/add-joke', {
            content: newJoke
        })
            .then(response => {
                // Bei Erfolg führt es den folgenden Code aus.
                console.log(response.data); // Zeigt die Antwort des Servers in der Konsole an.
                setNewJoke(''); // Löscht den Text im Textfeld.
            });
    };

    // Gibt das zu rendernde JSX zurück.
    return (
        <div className="App"> 
            {/* Hauptcontainer der App. */}
            <JokeViewer /> 
            {/* Ruft die JokeViewer-Komponente auf. */}
            <div className="whBox1"> 
                {/* Container für den Witz-Eingabebereich. */}
                <textarea value={newJoke} onChange={handleInputChange} placeholder="Neuen Witz eingeben" className="txtin1"/>
                {/* Eingabefeld für Witze. */}
                <button onClick={addJoke} className="btn1">Witz hinzufügen</button> 
                {/* Button, um den Witz hinzuzufügen. */}
            </div>
        </div>
    );
}

// Eine zusätzliche Komponente, um Witze anzuzeigen.
function JokeViewer() {
    // Initialisiert die verschiedenen Zustände für die Komponente.
    const [joke, setJoke] = useState(null); // Zustand für den aktuellen Witz.
    const [topJokes, setTopJokes] = useState([]); // Zustand für die besten Witze.
    const [error, setError] = useState(null); // Zustand für Fehlermeldungen.
    const [showTopJokesPopup, setShowTopJokesPopup] = useState(false); // Zustand, um das Popup für die Top-Witze anzuzeigen.
    const [hoverRating, setHoverRating] = useState(0); // Zustand für die Sternbewertung.

    // Funktion, um einen zufälligen Witz vom Server abzurufen.
    const fetchJoke = () => {
        axios.get('http://localhost:3001/joke')
            .then(response => {
                setJoke(response.data); // Setzt den abgerufenen Witz als aktuellen Witz.
                setError(null); // Setzt den Fehlerzustand zurück.
            })
            .catch(err => {
                setError("Ein Fehler ist aufgetreten beim Laden des Witzes."); // Setzt eine Fehlermeldung.
                console.error(err); // Gibt den Fehler in der Konsole aus.
            });
    };

    // Funktion, um die Top-Witze vom Server abzurufen.
    const fetchTopJokes = () => {
        axios.get('http://localhost:3001/top-jokes')
            .then(response => {
                setTopJokes(response.data); // Setzt die abgerufenen Top-Witze.
                setError(null); // Setzt den Fehlerzustand zurück.
            })
            .catch(err => {
                setError("Ein Fehler ist aufgetreten beim Laden der Top-Witze."); // Setzt eine Fehlermeldung.
                console.error(err); // Gibt den Fehler in der Konsole aus.
            });
    };

    // Funktion, um den aktuellen Witz zu bewerten.
    const handleRate = (rating) => {
        if (joke && joke.id) {
            axios.post(`http://localhost:3001/rate/${joke.id}`, { rating }) // Sendet die Bewertung zum Server.
                .then(() => {
                    fetchJoke(); // Ruft einen neuen Witz ab.
                    fetchTopJokes(); // Ruft die Top-Witze erneut ab.
                });
        }
    };

    // Funktion, die aufgerufen wird, wenn der Benutzer über die Sterne fährt.
    const handleMouseOver = (rating) => {
        setHoverRating(rating); // Setzt den hoverRating-Zustand auf den aktuellen Stern.
    };

    // Ruft die Funktionen fetchJoke und fetchTopJokes auf, wenn die Komponente geladen wird.
    useEffect(() => {
        fetchJoke();       
        fetchTopJokes();
    }, []);

    // Gibt das zu rendernde JSX zurück.
    return (
        <div> {/* Der Code in dieser Funktion bezieht sich auf die Darstellung von Witzen, Sternbewertung und Top-Witzen. */}
            <div className="Box">
                <div className="MidBox">
                    <div className="Text">
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {joke && <p>{joke.content}</p>}
                    </div>
                </div>
            </div>
            <button onClick={fetchJoke} className="btn1">Neuen Witz abrufen</button>
            <button onClick={() => setShowTopJokesPopup(true)} className="btn1">Top Witze anzeigen</button>

            {/* Hier wird die Sternebewertung angezeigt */}
            {joke && (
                <div>
                    {[1, 2, 3, 4, 5].map(num => (
                        <span 
                            key={num}
                            onMouseOver={() => handleMouseOver(num)} // Neu hinzugefügt für die Sternebewertung
                            onMouseLeave={() => setHoverRating(0)} // Neu hinzugefügt für die Sternebewertung
                            onClick={() => handleRate(num)} // Neu hinzugefügt für die Sternebewertung
                            className={`star ${num <= hoverRating ? 'filled' : ''}`} // Neu hinzugefügt für die Sternebewertung
                        >★</span>
                    ))}
                </div>
            )}

            {showTopJokesPopup && (
                <div className="popup">
                    <button onClick={() => setShowTopJokesPopup(false)} className="btn3">Schließen</button>
                    <h2>Top Witze</h2>
                    <ol>
                        {topJokes.map((j, index) =>
                            <li key={index}>
                                {j.content}
                                <br/>
                                (Bewertung: {j.avgRating ? j.avgRating.toFixed(2) : "Nicht bewertet"})
                                <br/>
                                <br/>
                            </li>
                        )}
                    </ol>
                </div>
            )}
        </div>
    );
}

    // Exportiert die Hauptkomponente, damit sie in anderen Dateien verwendet werden kann.    
    export default App;