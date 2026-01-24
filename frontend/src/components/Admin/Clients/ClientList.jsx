import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ClientList.css';

function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await adminAPI.deleteClient(id);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const handleEdit = (id) => {
    toast.info('Edit functionality coming soon');
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
        <button className="btn btn-primary" onClick={() => navigate('/admin/clients/add')}>
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
            {clients.filter(c => c.status === 'active').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inactive</span>
          <span className="stat-value stat-warning">
            {clients.filter(c => c.status === 'inactive').length}
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
                    <span>{client.name?.charAt(0) || 'C'}</span>
                  )}
                </div>
                <div className="client-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(client._id)}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(client._id, client.name)}
                    title="Delete"
                  >
                    <FiTrash2 />
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
                <span className={`status-badge ${client.status || 'active'}`}>
                  {client.status || 'Active'}
                </span>
                {client.projectsCount !== undefined && (
                  <span className="projects-count">
                    {client.projectsCount} {client.projectsCount === 1 ? 'Project' : 'Projects'}
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
              ? 'No clients match your search criteria'
              : 'Start by adding your first client'}
          </p>
          {!searchTerm && (
            <button className="btn btn-primary" onClick={() => navigate('/admin/clients/add')}>
              <FiPlus /> Add First Client
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientList;