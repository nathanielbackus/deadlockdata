## DeadlockData - deadlockdata.gg
# Overview
DeadlockData is a web application built with the Astro JS framework, designed to present detailed statistics related to Deadlock characters, players, and items.

This project aims to provide fast, reliable, and structured data visualization for users interested in Deadlock analytics.

# Data Handling & Storage
- Data Source: Retrieved from deadlock-api.
- Storage: Initially stored in a MySQL database upon first retrieval.
- Caching: Frequently accessed data is cached using Redis to improve performance and reduce database load.

# Tech Stack
- Frontend: Astro JS, TailwindCSS
- Backend: Node.js, Express
- Database: MySQL
- Caching: Redis
- Hosting: Netlify (Frontend), VPS (Backend & Database)

# Features
Character Statistics: Win rates, pick rates, and performance trends.
Player Analytics: Match history, rankings, and leaderboard tracking.
Item Usage Data: Most-used items, effectiveness, and builds.
Optimized Performance: Uses MySQL + Redis for efficient data retrieval.
