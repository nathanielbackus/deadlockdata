import { useState, useEffect } from "react";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:5333";

export default function Leaderboard({ initialRegion }) {
  const [region, setRegion] = useState(initialRegion);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [error, setError] = useState(null);

  //1. fetch the data of players
  //2. get the data from the steam api using the account id + base
  //3. add the players name and avatar to a new object?
  //4. we map that new object over the leaderboard rows

  //old
  // useEffect(() => {
  //   async function fetchLeaderboard() {
  //     try {
  //       const response = await fetch(`${API_URL}/fetchLeaderboard?start=1&limit=100&region=${region}`);
  //       const result = await response.json();
  //       setLeaderboardData(result.results || result.data || []);
  //     } catch (err) {
  //       setError("Failed to load leaderboard data.");
  //     }
  //   }
  //   fetchLeaderboard();
  // }, [region]);

  //new
  useEffect(() => {
  async function fetchLeaderboard() {
    try {
      const response = await fetch(`${API_URL}/fetchLeaderboard?start=1&limit=100&region=${region}`);
      const result = await response.json();
      const leaderboardArray = result.results || result.data || [];

      // Fetch player names in parallel
      const updatedPlayers = await Promise.all(
        leaderboardArray.map(async (player) => {
          const playerData = await fetchPlayerData(player);
          return { 
            ...player, 
            playerName: playerData ? playerData.personaname : "Unknown Player" 
          };
        })
      );
      setLeaderboardData(updatedPlayers);
    } catch (err) {
      setError("Failed to load leaderboard data.");
    }
  }
  fetchLeaderboard();
}, [region]);



async function fetchPlayerData(player) {
  const base = BigInt("76561197960265728");
  const steam32 = BigInt(player.account_id);
  const steam64 = steam32 + base;
  
  try {
    const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=0D2FD14C4AFCE0C56C3E8CA3FA7B462F&steamids=${steam64}&format=json`);
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.response || !data.response.players || data.response.players.length === 0) {
      console.warn(`No player data found for SteamID: ${steam64}`);
      return null;
    }

    return data.response.players[0];
  } catch (err) {
    console.error(`Error fetching Steam data for SteamID: ${steam64} ->`, err);
    return null;
  }
}


  function handleRegionChange(event) {
    setRegion(event.target.value);
  }

  function sortTableByColumn(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const currentOrder = table.getAttribute(`data-sort-${columnIndex}`) || "asc";
    const newOrder = currentOrder === "asc" ? "desc" : "asc";

    rows.sort((rowA, rowB) => {
      const cellA = rowA.children[columnIndex].textContent.trim();
      const cellB = rowB.children[columnIndex].textContent.trim();
      const numericA = parseFloat(cellA);
      const numericB = parseFloat(cellB);
      const isNumeric = !isNaN(numericA) && !isNaN(numericB);

      if (isNumeric) {
        return newOrder === "asc" ? numericA - numericB : numericB - numericA;
      } else {
        const comparison = cellA.localeCompare(cellB);
        return newOrder === "asc" ? comparison : -comparison;
      }
    });

    table.setAttribute(`data-sort-${columnIndex}`, newOrder);
    rows.forEach((row) => tbody.appendChild(row));
  }

  useEffect(() => {
    const headers = document.querySelectorAll(".leaderboardTh");
    headers.forEach((th, index) => {
      th.onclick = () => sortTableByColumn("leaderboard", index);
    });
  }, [leaderboardData]);

  return (
    <div>
      <div className="region-selector">
        <label>Sort Top 100 By Region:</label>
        <select id="regionSelector" value={region} onChange={handleRegionChange}>
          <option value="all">All</option>
          <option value="Row">North America</option>
          <option value="SAmerica">South America</option>
          <option value="SEAsia">Southeast Asia</option>
          <option value="Oceania">Oceania</option>
          <option value="Europe">Europe</option>
          <option value="Russia">Russia</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="leaderboardTable" id="leaderboard">
        <thead>
          <tr>
            <th className="leaderboardTh">Account ID</th>
            <th className="leaderboardTh">Wins</th>
            <th className="leaderboardTh">Matches Played</th>
            <th className="leaderboardTh">Win Rate</th>
            <th className="leaderboardTh">Region</th>
            <th className="leaderboardTh">Badge Rank</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((player) => (
            <tr key={player.account_id}>
              <td className="leaderboardTd">
                <a href={`players/${player.account_id}`}>
                  {player.playerName} ({player.account_id})
                </a>
              </td>
              <td className="leaderboardTd">{player.wins}</td>
              <td className="leaderboardTd">{player.matches_played}</td>
              <td className="leaderboardTd">{((player.wins / player.matches_played) * 100).toFixed(2)}%</td>
              <td className="leaderboardTd">
                {player.region_mode === "Row"
                  ? "North America"
                  : player.region_mode === "SAmerica"
                  ? "South America"
                  : player.region_mode === "SEAsia"
                  ? "Southeast Asia"
                  : player.region_mode}
              </td>
              <td className="leaderboardTd">{player.ranked_rank} + {player.ranked_subrank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}