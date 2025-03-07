import { useState, useEffect } from "react";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:5333";

export default function Leaderboard({ initialRegion }) {
  const [region, setRegion] = useState(initialRegion);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`${API_URL}/fetchLeaderboard?start=1&limit=100&region=${region}`);
        const result = await response.json();
        setLeaderboardData(result.results || result.data || []);
      } catch (err) {
        setError("Failed to load leaderboard data.");
      }
    }
    fetchLeaderboard();
  }, [region]);

  function handleRegionChange(event) {
    setRegion(event.target.value);
  }

  function sortTableByColumn(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    // current sort for this column (default to asc)
    const currentOrder = table.getAttribute(`data-sort-${columnIndex}`) || "asc";
    // toggle
    const newOrder = currentOrder === "asc" ? "desc" : "asc";
    // sort
    rows.sort((rowA, rowB) => {
      const cellA = rowA.children[columnIndex].textContent.trim();
      const cellB = rowB.children[columnIndex].textContent.trim();
      // define values of whats to be compared
      const numericA = parseFloat(cellA);
      const numericB = parseFloat(cellB);
      const isNumeric = !isNaN(numericA) && !isNaN(numericB);
      // if numeric is true, make new order changed when clicked
      if (isNumeric) {
        return newOrder === "asc" ? numericA - numericB : numericB - numericA;
        //else, make new order when clicked for strings  
        } else {
        const comparison = cellA.localeCompare(cellB);
        return newOrder === "asc" ? comparison : -comparison;
      }
    });
    // set new order
    table.setAttribute(`data-sort-${columnIndex}`, newOrder);
    rows.forEach((row) => tbody.appendChild(row));
  }
  useEffect(() => {
    // attach onclick listener once
    const headers = document.querySelectorAll(".leaderboardTh");
    headers.forEach((th, index) => {
      th.onclick = () => sortTableByColumn("leaderboard", index);
    });
  }, []);

  return (
    <div>
      <div className="region-selector">
        <label>Sort Top 100 By Region:</label>
        <select
          id="regionSelector"
          value={region}
          onChange={handleRegionChange}
        >
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
              <td className="leaderboardTd">{player.account_id}</td>
              <td className="leaderboardTd">{player.wins}</td>
              <td className="leaderboardTd">{player.matches_played}</td>
              <td className="leaderboardTd">{((player.wins / player.matches_played) * 100).toFixed(2)}%</td>
              <td className="leaderboardTd">
                {player.region_mode === "Row"
                  ? "North America"
                  : player.region_mode === "SouthAmerica"
                  ? "South America"
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
