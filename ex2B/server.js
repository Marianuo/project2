const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Connect to SQLite database
const dbPath = path.join(__dirname, 'db', 'rtfilms.db');
const db = new sqlite3.Database(dbPath);

// Serve static files from public directory (movie.html, movie.js, movie.css)
app.use(express.static(path.join(__dirname, 'public')));

// JSON to get movie data by film code
app.get('/film', async (req, res) => {
  const { film } = req.query;
  if (!film) {
    return res.status(400).json({ error: 'Missing movie code in query string' });
  }

  try {
    const [filmTitle, filmDetails, filmRating, filmYear, reviews, cast, filmScore] = await Promise.all([
      getFilmNameByCode(film),
      getFilmDetails(film),
      getFilmRating(film),
      getFilmYear(film),
      getReviews(film),
      getFilmCast(film),
      getFilmScore(film)
    ]);

    res.json({
      filmTitle,
      filmDetails,
      filmRating,
      filmYear,
      reviews,
      cast,
      filmScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching film data' });
  }
});

// Helper functions

function getFilmNameByCode(film) {
  return new Promise((resolve, reject) => {
    db.get('SELECT Title FROM Films WHERE FilmCode = ?', [film], (err, row) => {
      if (err) reject(err);
      else if (!row) reject(new Error('Film not found'));
      else resolve(row.Title);
    });
  });
}

function getFilmRating(film) {
  return new Promise((resolve, reject) => {
    db.get('SELECT Score FROM Films WHERE FilmCode = ?', [film], (err, row) => {
      if (err) reject(err);
      else if (!row) reject(new Error('Film not found'));
      else resolve(row.Score);
    });
  });
}

function getFilmScore(film) {
  return new Promise((resolve, reject) => {
    db.get('SELECT Score FROM Films WHERE FilmCode = ?', [film], (err, row) => {
      if (err) reject(err);
      else resolve(row.Score);
    });
  });
}

function getFilmDetails(film) {
  return new Promise((resolve, reject) => {
    db.all('SELECT Attribute, Value FROM FilmDetails WHERE FilmCode = ?', [film], (err, rows) => {
      if (err) reject(err);
      else {
        const details = {};
        rows.forEach(row => {
          const key = row.Attribute.toLowerCase();
          details[key] = key === 'starring'
            ? row.Value.split(',').map(actor => actor.trim())
            : row.Value;
        });
        resolve(details);
      }
    });
  });
}

function getFilmYear(film) {
  return new Promise((resolve, reject) => {
    db.get('SELECT Year FROM Films WHERE FilmCode = ?', [film], (err, row) => {
      if (err) reject(err);
      else if (!row) reject(new Error('Film not found'));
      else resolve(row.Year);
    });
  });
}

function getReviews(film) {
  return new Promise((resolve, reject) => {
    db.all('SELECT ReviewerName, Affiliation, ReviewText FROM Reviews WHERE FilmCode = ?', [film], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getFilmCast(film) {
  return new Promise((resolve, reject) => {
    db.get('SELECT Value FROM FilmDetails WHERE FilmCode = ? AND Attribute = "Cast"', [film], (err, row) => {
      if (err) reject(err);
      else resolve(row?.Value?.split(',').map(actor => actor.trim()) || []);
    });
  });
}

app.get('/film=:filmCode', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movie.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});