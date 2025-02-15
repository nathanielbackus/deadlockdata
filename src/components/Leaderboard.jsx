import { useState, useEffect } from "react";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [cacheSource, setCacheSource] = useState("");
  console.log("1");

  useEffect(() => {
    console.log("2");

    const fetchData = async () => {
        console.log("3");

      try {
        const response = await fetch("http://localhost:4321/fetchLeaderboard?start=0&limit=10");
        const result = await response.json();

        console.log(result.source === "redis"
          ? "Cache Hit: Data fetched from Redis"
          : "Cache Miss: Data fetched from MySQL server"
        );

        setLeaderboardData(result.data);
        setCacheSource(result.source);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchData();
  }, []);

  console.log("4");

  return (
    <div>
      <h2>Leaderboard</h2>
      <p>Data Source: {cacheSource === "redis" ? "Redis Cache" : "MySQL"}</p>

      <ul>
        {leaderboardData.map((player) => (
          <li key={player.account_id}>
            {player.account_id}: {((player.wins / player.matches_played) * 100).toFixed(2)}% Win Rate
          </li>
        ))}
      </ul>
    </div>
  );
}
