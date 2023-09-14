// Einbindung von nötigen Paketen, die für die App gebraucht werden.
const express = require('express'); // Das Haupt-Express-Paket, um einen Webserver zu starten.
const app = express(); // Erstellen einer neuen Express-App.
const PORT = process.env.PORT || 3001; // Der Port, auf dem unser Server lauschen wird.
const cors = require('cors'); // Paket, das Cross-Origin-Requests ermöglicht (z.B. wenn das Frontend auf einem anderen Server läuft).
const axios = require('axios'); // Paket für HTTP-Requests (um z.B. Daten von einer anderen API zu holen).
const bodyParser = require('body-parser'); // Paket, um eingehende Request-Bodies zu analysieren.

// Konfiguration von Middleware (Funktionen, die jede Anfrage bearbeiten, bevor sie an unsere Endpunkte weitergeleitet wird).
app.use(bodyParser.json()); // Analysiert JSON im Request-Body.
app.use(cors()); // Erlaubt Cross-Origin-Requests.
app.use(express.json()); // Erlaubt das Parsen von JSON-Body-Daten.

// Die URL der externen Witz-API.
const JOKE_API_URL = 'https://witzapi.de/api/joke/';

// Eine anfängliche Liste von Witzen.
let jokes = [
    { id: 1, content: 'Martin kann kochen! xD', ratings: [], avgRating: 5 },
];

// Endpoint, um einen Witz von der externen API zu holen.
app.get('/joke', async (req, res) => {
    try {
        // Anfrage an die externe Witz-API.
        const response = await axios.get(JOKE_API_URL);
        // Wenn die Antwort Daten enthält...
        if (response.data && response.data[0].text) {
            const fetchedJokeContent = response.data[0].text;

            // Überprüfen, ob der Witz bereits in unserer Liste ist.
            let existingJoke = jokes.find(j => j.content === fetchedJokeContent);

            // Wenn der Witz nicht vorhanden ist, wird er hinzugefügt.
            if (!existingJoke) {
                existingJoke = {
                    id: jokes.length + 1,
                    content: fetchedJokeContent,
                    ratings: [],
                    avgRating: 0
                };
                jokes.push(existingJoke);
            }

            // Senden des Witzes als Antwort.
            res.json(existingJoke);
        } else {
            // Bei einem Fehler mit der externen API wird eine Fehlerantwort gesendet.
            res.status(500).json({ error: "Abruf von externer API fehlgeschlagen" });
        }
    } catch (error) {
        // Bei einem anderen Fehler wird ebenfalls eine Fehlerantwort gesendet.
        console.error("Error beim Abruf von joke:", error);
        res.status(500).json({ error: "Abruf von externer API fehlgeschlagen" });
    }
});

// Endpoint, um einen Witz zu bewerten.
app.post('/rate/:id', (req, res) => {
    const id = Number(req.params.id); // Die ID des Witzes aus der URL holen.
    const rating = req.body.rating; // Die Bewertung aus dem Request-Body holen.
    const joke = jokes.find(j => j.id === id); // Den entsprechenden Witz finden.

    // Wenn der Witz gefunden wird...
    if (joke) {
        joke.ratings.push(rating); // Bewertung zur "Liste der Bewertungen" der Witze hinzufügen.
        // Berechne das Durchschnittsrating.
        joke.avgRating = joke.ratings.reduce((a, b) => a + b, 0) / joke.ratings.length;
        res.json({ success: true });
    } else {
        // Wenn der Witz nicht gefunden wird, sende eine Fehlerantwort.
        res.json({ success: false });
    }
});

// Endpoint, um die Top-10-Witze zu holen.
app.get('/top-jokes', (req, res) => {
    const ratedJokes = jokes.filter(j => j.ratings.length > 0); // Filtere nur bewertete Witze.
    // Sortiere Witze nach Durchschnittsbewertung.
    ratedJokes.sort((a, b) => b.avgRating - a.avgRating);
    // Sende die Top 10 Witze als Antwort.
    res.json(ratedJokes.slice(0, 10));
});

// Endpoint, um einen neuen Witz hinzuzufügen.
app.post('/add-joke', (req, res) => {
    const newJokeContent = req.body.content; // Den Inhalt des neuen Witzes aus dem Request-Body holen.
    // Wenn ein Inhalt vorhanden ist...
    if (newJokeContent) {
        const newJoke = {
            id: jokes.length + 1,
            content: newJokeContent,
            ratings: [],
            avgRating: 0
        };
        jokes.push(newJoke); // Den neuen Witz zur Liste hinzufügen.
        res.json({ success: true });
    } else {
        // Wenn kein Inhalt vorhanden ist, sende eine Fehlerantwort.
        res.status(400).json({ error: "Eingabe erforderlich!" });
    }
});

// Starten des Servers auf dem angegebenen Port.
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
