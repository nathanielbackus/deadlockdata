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
        const newRegion = event.target.value;
        setRegion(newRegion);
    }

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/public/scripts/tableSort.js";
        script.async = true;
        script.onload = () => {
            document.querySelectorAll(".leaderboardTh").forEach((th, index) => {
                th.addEventListener("click", () => sortTableByColumn("leaderboard", index));
            });
        };
        document.body.appendChild(script);
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
                            <td className="leaderboardTd">{player.account_id}</td>
                            <td className="leaderboardTd">{player.wins}</td>
                            <td className="leaderboardTd">{player.matches_played}</td>
                            <td className="leaderboardTd">{((player.wins / player.matches_played) * 100).toFixed(2)}%</td>
                            <td className="leaderboardTd">{player.region_mode === "Row" ? "North America" : player.region_mode === "SouthAmerica" ? "South America" : player.region_mode}</td>
                            <td className="leaderboardTd">{player.ranked_rank} + {player.ranked_subrank}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
