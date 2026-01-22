import React, { useEffect, useState } from "react";
import "./CeoDashboard.css";
import Navbar from "../Navbar/Navbar.jsx";
import { fetchAPI } from "../../api/api";

const CeoDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [counts, setCounts] = useState({
    totalClients: 0,
    totalEmployees: 0,
    totalProjects: 0,
    runningProjects: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    // Fetch overview data from backend
    const loadOverview = async () => {
      try {
        const clients = await fetchAPI("clients");
        const employees = await fetchAPI("employees");
        const projects = await fetchAPI("projects");

        const completedProjects = projects.filter(
          (p) => p.status.toLowerCase() === "delivered"
        ).length;
        const runningProjects = projects.length - completedProjects;

        setCounts({
          totalClients: clients.length,
          totalEmployees: employees.length,
          totalProjects: projects.length,
          runningProjects,
          completedProjects,
        });
      } catch (err) {
        console.error(err);
      }
    };

    if (activeTab === "overview") loadOverview();
  }, [activeTab]);

  return (
    <>
      <Navbar />
      <div className="ceo-dashboard">
        {/* Header */}
        <div className="ceo-header">
          <h2>OfficeSphere</h2>
          <h3>CEO Dashboard - Syed Turab Ali Shah</h3>
        </div>

        {/* Tabs */}
        <div className="ceo-tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "active" : ""}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={activeTab === "projects" ? "active" : ""}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={activeTab === "completed" ? "active" : ""}
          >
            Completed Projects
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={activeTab === "clients" ? "active" : ""}
          >
            Clients
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={activeTab === "employees" ? "active" : ""}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={activeTab === "attendance" ? "active" : ""}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={activeTab === "reports" ? "active" : ""}
          >
            Reports
          </button>
        </div>

        {/* Content */}
        <div className="ceo-content">
          {activeTab === "overview" && (
            <div className="card-grid">
              <div className="card">Total Clients: {counts.totalClients}</div>
              <div className="card">Total Employees: {counts.totalEmployees}</div>
              <div className="card">Total Projects: {counts.totalProjects}</div>
              <div className="card">
                Projects In Progress: {counts.runningProjects}
              </div>
              <div className="card">
                Completed Projects: {counts.completedProjects}
              </div>
            </div>
          )}

          {activeTab === "projects" && <div>Projects tab content coming...</div>}
          {activeTab === "completed" && <div>Completed Projects content...</div>}
          {activeTab === "clients" && <div>Clients content...</div>}
          {activeTab === "employees" && <div>Employees content...</div>}
          {activeTab === "attendance" && <div>Attendance content...</div>}
          {activeTab === "reports" && <div>Reports content...</div>}
        </div>
      </div>
    </>
  );
};

export default CeoDashboard;
