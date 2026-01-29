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
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./EmployeeList.css";

function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredEmployees(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await adminAPI.deleteEmployee(id);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  const handleEdit = (id) => {
    toast.info("Edit functionality coming soon");
  };

  if (loading) {
    return (
      <div className="employee-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-list">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Manage your team members</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/employees/add")}
        >
          <FiPlus /> Add Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search employees by name, email, or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Employee Stats */}
      <div className="employee-stats">
        <div className="stat-item">
          <span className="stat-label">Total Employees</span>
          <span className="stat-value">{employees.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active</span>
          <span className="stat-value stat-success">
            {employees.filter((e) => e.status === "active").length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inactive</span>
          <span className="stat-value stat-danger">
            {employees.filter((e) => e.status === "inactive").length}
          </span>
        </div>
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="employee-grid">
          {filteredEmployees.map((employee) => (
            <div key={employee._id} className="employee-card">
              <div className="employee-card-header">
                <div className="employee-avatar">
                  {employee?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="admin-employee-actions">
                  <button
                    className="admin-action-btn admin-edit-btn"
                    onClick={() => handleEdit(employee._id)}
                    title="Edit"
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </button>
                  <button
                    className="admin-action-btn admin-delete-btn"
                    onClick={() => handleDelete(employee._id, employee.name)}
                    title="Delete"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="employee-info">
                <h3>{employee.name}</h3>
                <p className="employee-position">
                  {employee.position || "Employee"}
                </p>

                <div className="employee-contact">
                  <div className="contact-item">
                    <FiMail />
                    <span>{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="contact-item">
                      <FiPhone />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="employee-footer">
                <span className={`status-badge ${employee.status || "active"}`}>
                  {employee.status || "Active"}
                </span>
                {employee.joinDate && (
                  <span className="join-date">
                    Joined: {new Date(employee.joinDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <FiPlus />
          </div>
          <h3>No Employees Found</h3>
          <p>
            {searchTerm
              ? "No employees match your search criteria"
              : "Start by adding your first employee"}
          </p>
          {!searchTerm && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/employees/add")}
            >
              <FiPlus /> Add First Employee
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmployeeList;
