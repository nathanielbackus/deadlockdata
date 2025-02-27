//TODO PUSH TO DROPLET

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const db = require('./database');
const redisClient = require('./redisClient');

// Express Server Setup
const app = express();
const port = process.env.PORT || 5333;

app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type", "Authorization"] }));

// Server status endpoint
app.get("/", (req, res) => {
    res.send("Server is Up");
});

// Fetch Leaderboard with Redis Caching
app.get('/fetchLeaderboard', async (req, res) => {
    const { start, limit } = req.query;
  
    // Convert start and limit to integers (default to 0 and 10 if not provided)
    const startInt = parseInt(start) || 0;
    const limitInt = parseInt(limit) || 10;
  
    // Validate query params to ensure they are non-negative
    if (startInt < 0 || limitInt <= 0) {
        return res.status(400).json({ error: 'Invalid start or limit value' });
    }
  
    const region = req.query.region || 'all';
    const cacheKey = `leaderboard:${startInt}:${limitInt}:${region}`;
  
    try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log('Cache Hit, data fetched from Redis server');
            return res.json({ data: JSON.parse(cachedData) });
        } else {
            const query = `
                SELECT * FROM player_stats
                ${region !== 'all' ? `WHERE region_mode = ${db.escape(region)}` : ''}
                LIMIT ${db.escape(limitInt)} OFFSET ${db.escape(startInt)};
            `;
  
            db.execute(query, async (err, rows, fields) => {
                if (err) {
                    console.error('Error retrieving data:', err);
                    return res.status(500).json({ error: 'Error retrieving data from database' });
                }
  
                console.log('Cache Miss, data fetched from MYSQL server');
                await redisClient.set(cacheKey, JSON.stringify(rows));
  
                res.json({ data: rows });
            });
        }
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/storeLeaderboard', async (req, res) => {
    try {
        console.log('Fetching leaderboard data from API...');
        const response = await axios.get('https://analytics.deadlock-api.com/v2/leaderboard?start=1&limit=10000');
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: 'No leaderboard data received' });
        }

        console.log('Received leaderboard data:', data.length, 'entries');

        const query = `
            INSERT INTO player_stats (account_id, region_mode, leaderboard_rank, wins, matches_played, kills, deaths, assists, ranked_badge_level, ranked_rank, ranked_subrank)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            wins = VALUES(wins), 
            matches_played = VALUES(matches_played), 
            kills = VALUES(kills), 
            deaths = VALUES(deaths), 
            assists = VALUES(assists), 
            ranked_badge_level = VALUES(ranked_badge_level), 
            ranked_rank = VALUES(ranked_rank), 
            ranked_subrank = VALUES(ranked_subrank);
        `;

        for (const player of data) {
            const values = [
                player.account_id || 0,
                player.region_mode || 'unknown',
                player.leaderboard_rank || 0,
                player.wins || 0,
                player.matches_played || 0,
                player.kills || 0,
                player.deaths || 0,
                player.assists || 0,
                player.ranked_badge_level || 0,
                player.ranked_rank || 'unknown',
                player.ranked_subrank || 'unknown'
            ];

            try {
                await db.promise().execute(query, values);
            } catch (err) {
                console.error('Error inserting data for account_id:', player.account_id, err);
            }
        }

        console.log('Data stored successfully');
        res.json('Data stored successfully');
    } catch (error) {
        console.error('Error fetching API data:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
});

app.listen(port, async () => {
    console.log(`Node/Express Server is Up......\nPort: localhost:${port}`);
});
