import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL; // Load API URL

console.log("VITE_API_URL:", API_URL); // Debugging statement

function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);
        setData(data.message);
      })
      .catch((error) => console.error("Error fetching API:", error));
  }, []);

  return (
    <div>
      <h1>Netlify + Firebase App</h1>
      <p>{data ? data : "Loading..."}</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
