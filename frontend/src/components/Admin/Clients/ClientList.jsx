import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../../utils/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiMail,
  FiPhone,
  FiBriefcase,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./ClientList.css";

function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getClients();

      console.log("📊 Client API Response:", response.data); // DEBUG LOG

      // Check what the actual response structure is
      let clientsData = [];

      if (response.data && response.data.data) {
        // If response has data.data (array of clients)
        clientsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // If response.data is directly an array
        clientsData = response.data;
      } else if (response.data && response.data.clients) {
        // If response has data.clients
        clientsData = response.data.clients;
      }

      console.log("📋 Extracted clients data:", clientsData);

      // Transform data to match frontend expectations
      const transformedClients = clientsData.map((client) => {
        // If client has a userId populated with user data
        const userData = client.userId || client.user || {};

        return {
          _id: client._id,
          name:
            userData.name ||
            client.name ||
            client.contactPerson?.name ||
            "No Name",
          email:
            userData.email ||
            client.email ||
            client.companyEmail ||
            client.contactPerson?.email ||
            "No Email",
          phone:
            userData.phone ||
            client.phone ||
            client.companyPhone ||
            client.contactPerson?.phone ||
            "",
          company: client.companyName || client.company || "No Company",
          companyName: client.companyName,
          clientId: client.clientId,
          status: client.isActive ? "active" : "inactive",
          avatar: userData.avatar,
          address: client.address || {},
          // Add projects count if available
          projectsCount: client.projects?.length || client.totalProjects || 0,
        };
      });

      console.log("🔄 Transformed clients:", transformedClients);
      setClients(transformedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(
      (client) =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredClients(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await adminAPI.deleteClient(id);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    }
  };

  const handleEdit = (id) => {
    toast.info("Edit functionality coming soon");
  };

  if (loading) {
    return (
      <div className="client-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-list">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage your client accounts</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/clients/add")}
        >
          <FiPlus /> Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search clients by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Client Stats */}
      <div className="client-stats">
        <div className="stat-item">
          <span className="stat-label">Total Clients</span>
          <span className="stat-value">{clients.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active</span>
          <span className="stat-value stat-success">
            {clients.filter((c) => c.status === "active").length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inactive</span>
          <span className="stat-value stat-warning">
            {clients.filter((c) => c.status === "inactive").length}
          </span>
        </div>
      </div>

      {/* Client Grid */}
      {filteredClients.length > 0 ? (
        <div className="client-grid">
          {filteredClients.map((client) => (
            <div key={client._id} className="client-card">
              <div className="client-card-header">
                <div className="client-avatar">
                  {client.avatar ? (
                    <img src={client.avatar} alt={client.name} />
                  ) : (
                    <span>{client.name?.charAt(0) || "C"}</span>
                  )}
                </div>
                <div className="admin-client-actions">
                  <button
                    className="admin-action-btn admin-edit-btn"
                    onClick={() => handleEdit(client._id)}
                    title="Edit"
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </button>
                  <button
                    className="admin-action-btn admin-delete-btn"
                    onClick={() => handleDelete(client._id, client.name)}
                    title="Delete"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="client-info">
                <h3>{client.name}</h3>
                {client.company && (
                  <p className="client-company">
                    <FiBriefcase /> {client.company}
                  </p>
                )}

                <div className="client-contact">
                  <div className="contact-item">
                    <FiMail />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="contact-item">
                      <FiPhone />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="client-footer">
                <span className={`status-badge ${client.status || "active"}`}>
                  {client.status || "Active"}
                </span>
                {client.projectsCount !== undefined && (
                  <span className="projects-count">
                    {client.projectsCount}{" "}
                    {client.projectsCount === 1 ? "Project" : "Projects"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <FiBriefcase />
          </div>
          <h3>No Clients Found</h3>
          <p>
            {searchTerm
              ? "No clients match your search criteria"
              : "Start by adding your first client"}
          </p>
          {!searchTerm && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/clients/add")}
            >
              <FiPlus /> Add First Client
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientList;
