const express = require('express');
const app = express();
const PORT = 3001;
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const JOKE_API_URL = 'https://witzapi.de/api/joke/';

let jokes = [
    { id: 1, content: 'Martin kann kochen! xD', ratings: [], avgRating: 5 },
];

app.get('/joke', async (req, res) => {
    try {
        const response = await axios.get(JOKE_API_URL);
        if (response.data && response.data[0].text) {
            const fetchedJokeContent = response.data[0].text;

            let existingJoke = jokes.find(j => j.content === fetchedJokeContent);

            if (!existingJoke) {
                existingJoke = {
                    id: jokes.length + 1,
                    content: fetchedJokeContent,
                    ratings: [],
                    avgRating: 0
                };
                jokes.push(existingJoke);
            }

            res.json(existingJoke);
        } else {
            res.status(500).json({ error: "Failed to fetch joke from external API" });
        }
    } catch (error) {
        console.error("Error fetching joke:", error);
        res.status(500).json({ error: "Failed to fetch joke from external API" });
    }
});

app.post('/rate/:id', (req, res) => {
    const id = Number(req.params.id);
    const rating = req.body.rating;
    const joke = jokes.find(j => j.id === id);

    if (joke) {
        joke.ratings.push(rating);
        joke.avgRating = joke.ratings.reduce((a, b) => a + b, 0) / joke.ratings.length;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/top-jokes', (req, res) => {
    const ratedJokes = jokes.filter(j => j.ratings.length > 0);
    ratedJokes.sort((a, b) => b.avgRating - a.avgRating);
    res.json(ratedJokes.slice(0, 10));
});

app.post('/add-joke', (req, res) => {
    const newJokeContent = req.body.content;
    if (newJokeContent) {
        const newJoke = {
            id: jokes.length + 1,
            content: newJokeContent,
            ratings: [],
            avgRating: 0
        };
        jokes.push(newJoke);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Content required" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
