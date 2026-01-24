import React, { createContext, useState, useContext } from 'react';
import { toast } from 'react-toastify';

// Create Project Context
const ProjectContext = createContext();

// Custom hook to use Project Context
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};

// Project Provider Component
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  });

  // Add project to local state
  const addProject = (project) => {
    setProjects((prev) => [project, ...prev]);
    toast.success('Project added successfully!');
  };

  // Update project in local state
  const updateProject = (projectId, updatedData) => {
    setProjects((prev) =>
      prev.map((project) =>
        project._id === projectId ? { ...project, ...updatedData } : project
      )
    );
    
    // Update selected project if it's the one being updated
    if (selectedProject?._id === projectId) {
      setSelectedProject((prev) => ({ ...prev, ...updatedData }));
    }
    
    toast.success('Project updated successfully!');
  };

  // Delete project from local state
  const deleteProject = (projectId) => {
    setProjects((prev) => prev.filter((project) => project._id !== projectId));
    
    // Clear selected project if it's the one being deleted
    if (selectedProject?._id === projectId) {
      setSelectedProject(null);
    }
    
    toast.success('Project deleted successfully!');
  };

  // Set projects (from API)
  const setProjectsList = (projectsList) => {
    setProjects(projectsList);
  };

  // Select a project
  const selectProject = (project) => {
    setSelectedProject(project);
  };

  // Clear selected project
  const clearSelectedProject = () => {
    setSelectedProject(null);
  };

  // Filter projects based on current filters
  const getFilteredProjects = () => {
    let filtered = [...projects];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((project) => project.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter((project) => project.priority === filters.priority);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name?.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          project.client?.name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
    });
  };

  // Get project statistics
  const getProjectStats = () => {
    const stats = {
      total: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      onHold: projects.filter((p) => p.status === 'on-hold').length,
      cancelled: projects.filter((p) => p.status === 'cancelled').length,
      highPriority: projects.filter((p) => p.priority === 'high').length,
      mediumPriority: projects.filter((p) => p.priority === 'medium').length,
      lowPriority: projects.filter((p) => p.priority === 'low').length,
    };
    return stats;
  };

  // Get project by ID
  const getProjectById = (projectId) => {
    return projects.find((project) => project._id === projectId);
  };

  // Update project progress
  const updateProjectProgress = (projectId, progress) => {
    updateProject(projectId, { progress });
  };

  // Update project status
  const updateProjectStatus = (projectId, status) => {
    updateProject(projectId, { status });
  };

  const value = {
    projects,
    selectedProject,
    loading,
    filters,
    setLoading,
    addProject,
    updateProject,
    deleteProject,
    setProjectsList,
    selectProject,
    clearSelectedProject,
    getFilteredProjects,
    updateFilters,
    resetFilters,
    getProjectStats,
    getProjectById,
    updateProjectProgress,
    updateProjectStatus,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;