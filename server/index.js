const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const db = require("./database");
const redisClient = require("./redisClient");

// Express Server Setup
const app = express();
const port = 4321;

app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type", "Authorization"] }));

// Check MySQL Connection on Startup
async function testMySQLConnection() {
    try {
        const [rows] = await db.execute("SELECT 1");
        console.log("✅ MySQL Connected Successfully!");
    } catch (err) {
        console.error("❌ MySQL Connection Failed:", err);
    }
}

// Server status endpoint
app.get("/", (req, res) => {
    res.send("✅ Server is Up!");
});

// Fetch Leaderboard with Redis Caching
app.get("/fetchLeaderboard", async (req, res) => {
    const { start, limit } = req.query;
    const startInt = parseInt(start) || 0;
    const limitInt = parseInt(limit) || 10;

    if (startInt < 0 || limitInt <= 0) {
        return res.status(400).json({ error: "Invalid start or limit value" });
    }

    const cacheKey = `leaderboard:${startInt}:${limitInt}`;

    try {
        redisClient.get(cacheKey, async (err, cachedData) => {
            if (err) console.error("❌ Redis Error:", err);
            
            if (cachedData) {
                console.log("🔥 Cache Hit: Data fetched from Redis");
                return res.json({ source: "redis", data: JSON.parse(cachedData) });
            }

            console.log("❌ Cache Miss: Fetching from MySQL...");
            const query = `
                SELECT account_id, region_mode, leaderboard_rank, wins, matches_played, 
                       kills, deaths, assists, ranked_badge_level, ranked_rank, ranked_subrank
                FROM player_stats
                LIMIT ? OFFSET ?;
            `;
            const [rows] = await db.execute(query, [limitInt, startInt]);

            redisClient.set(cacheKey, JSON.stringify(rows), "EX", 3600);

            res.json({ source: "mysql", data: rows });
        });
    } catch (err) {
        console.error("🚨 Internal server error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Store Leaderboard Data from External API
app.get("/storeLeaderboard", async (req, res) => {
    try {
        const response = await axios.get("https://analytics.deadlock-api.com/v2/leaderboard?start=1&limit=1000");
        const data = response.data;

        for (const player of data) {
            const query = `
                INSERT INTO player_stats (account_id, region_mode, leaderboard_rank, wins, matches_played, kills, deaths, assists, ranked_badge_level, ranked_rank, ranked_subrank)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                wins = VALUES(wins), matches_played = VALUES(matches_played), kills = VALUES(kills), deaths = VALUES(deaths), 
                assists = VALUES(assists), ranked_badge_level = VALUES(ranked_badge_level), ranked_rank = VALUES(ranked_rank), 
                ranked_subrank = VALUES(ranked_subrank);
            `;

            const values = [
                player.account_id,
                player.region_mode,
                player.leaderboard_rank,
                player.wins,
                player.matches_played,
                player.kills,
                player.deaths,
                player.assists,
                player.ranked_badge_level,
                player.ranked_rank,
                player.ranked_subrank
            ];

            try {
                await db.execute(query, values);
            } catch (err) {
                console.error("❌ Error inserting data for account_id:", player.account_id, err);
            }
        }

        res.send("✅ Data stored successfully");
    } catch (error) {
        console.error("🚨 Error fetching API data:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard data." });
    }
});

// Start Server
app.listen(port, async () => {
    console.log(`🚀 Server running at http://localhost:${port}`);

    // Confirm MySQL Connection when Server Starts
    await testMySQLConnection();
});
