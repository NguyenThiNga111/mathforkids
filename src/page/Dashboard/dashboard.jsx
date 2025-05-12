import Navbar from "../../component/Navbar";
import { useState } from "react";
import "./dashboard.css"; // Import file CSS

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("October");

  return (
    <div className="container">
      <Navbar />
      <div className="container-content">
        <h1 className="container-title">Dashboard</h1>

        {/* Statistics Cards */}
        <div className="stats-container">
          {/* Card 1: Total User */}
          <div className="stat-card">
            <div className="card-content">
              <h3 className="card-title">Total User</h3>
              <p className="card-value">40,689</p>
              <p className="card-trend up">
                <span className="trend-icon">↑</span> 8.5% Up from yesterday
              </p>
            </div>
            <div className="card-icon" style={{ backgroundColor: "#dbeafe" }}>
              <svg
                className="w-6 h-6"
                fill="#93c5fd"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>

          {/* Card 2: Total Student */}
          <div className="stat-card">
            <div className="card-content">
              <h3 className="card-title">Total Student</h3>
              <p className="card-value">10,293</p>
              <p className="card-trend up">
                <span className="trend-icon">↑</span> 1.3% Up from past week
              </p>
            </div>
            <div className="card-icon" style={{ backgroundColor: "#fef3c7" }}>
              <svg
                className="w-6 h-6"
                fill="#fcd34d"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
              </svg>
            </div>
          </div>

          {/* Card 3: Statistics in each class */}
          <div className="stat-card">
            <div className="card-content">
              <h3 className="card-title">Statistics in each class</h3>
              <p className="card-value">$89,000</p>
              <p className="card-trend down">
                <span className="trend-icon">↓</span> 4.3% Down from past week
              </p>
            </div>
            <div className="card-icon" style={{ backgroundColor: "#d1fae5" }}>
              <svg
                className="w-6 h-6"
                fill="#34d399"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>

          {/* Card 4: Statistics for each lesson */}
          <div className="stat-card">
            <div className="card-content">
              <h3 className="card-title">Statistics for each lesson</h3>
              <p className="card-value">2040</p>
              <p className="card-trend up">
                <span className="trend-icon">↑</span> 1.8% Up from past week
              </p>
            </div>
            <div className="card-icon" style={{ backgroundColor: "#fed7aa" }}>
              <svg
                className="w-6 h-6"
                fill="#fb923c"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332-.477-4.5-1.253"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          {/* Chart 1: Statistics User */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">STATISTICS USER</h3>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-select"
              >
                <option>October</option>
                <option>September</option>
                <option>August</option>
              </select>
            </div>
            <div className="chart-placeholder">
              <p>Chart for User Statistics (64.364.77 peak)</p>
            </div>
          </div>

          {/* Chart 2: Statistics Student */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">STATISTICS STUDENT</h3>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-select"
              >
                <option>October</option>
                <option>September</option>
                <option>August</option>
              </select>
            </div>
            <div className="chart-placeholder">
              <p>Chart for Student Statistics (64.364.77 peak)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;