import { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

const App = () => {
  const [chart, setChart] = useState(null);
  const [status, setStatus] = useState("Enter a city and load forecast.");

  useEffect(() => {
    return () => chart?.destroy();
  }, [chart]);

  const fetchWeather = async city => {
    if (!API_KEY || API_KEY.includes("YOUR_")) {
      setStatus("Add your OpenWeatherMap API key in App.jsx.");
      return null;
    }
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`);
    if (!response.ok) throw new Error("Unable to fetch weather data.");
    return response.json();
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const city = event.target.city.value.trim();
    if (!city) return;
    setStatus("Loading forecast...");

    try {
      const data = await fetchWeather(city);
      if (!data) return;
      const labels = data.list.slice(0, 8).map(item => item.dt_txt.replace(" ", "\n"));
      const temps = data.list.slice(0, 8).map(item => item.main.temp - 273.15);
      const ctx = document.getElementById("weatherChart").getContext("2d");
      if (chart) chart.destroy();
      const newChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{ label: "�C", data: temps, borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.2)", tension: 0.3 }]
        },
        options: { responsive: true }
      });
      setChart(newChart);
      setStatus(`Weather loaded for ${data.city.name}.`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="app-shell">
      <h1>Weather Chart</h1>
      <form onSubmit={handleSubmit}>
        <input name="city" placeholder="City name" />
        <button>Load</button>
      </form>
      <canvas id="weatherChart" width="640" height="320"></canvas>
      <p>{status}</p>
    </main>
  );
};

export default App;
