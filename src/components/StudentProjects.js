import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import Header from './Header';
import Footer from './Footer';
import './styles/StudentProjects.css'; 

const StudentProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    project_url: '',
    image_url: ''
  });
  const [editingProject, setEditingProject] = useState(null); 

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      
      if (!API_ENDPOINTS.PROJECTS) {
          throw new Error("PROJECTS API endpoint is not defined in config.");
      }
      const response = await fetch(API_ENDPOINTS.PROJECTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (e) {
      console.error("Failed to fetch projects:", e);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingProject) {
      setEditingProject(prev => ({ ...prev, [name]: value }));
    } else {
      setNewProject(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found.');
      return;
    }

    if (!newProject.title || !newProject.description) {
        alert('Project Title and Description are required.');
        return;
    }

     // Ensure PROJECTS endpoint exists in config before posting
    if (!API_ENDPOINTS.PROJECTS) {
        setError("PROJECTS API endpoint is not defined in config.");
        return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.PROJECTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Refresh projects list after adding
      fetchProjects();
      // Reset form and hide
      setNewProject({ title: '', description: '', technologies: '', project_url: '', image_url: '' });
      setShowAddForm(false);
    } catch (e) {
      console.error("Failed to add project:", e);
      setError('Failed to add project. Please try again.');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setError(null);
    const token = localStorage.getItem('token');
     if (!token) {
      setError('Authentication token not found.');
      return;
    }

    if (!editingProject.title || !editingProject.description) {
        alert('Project Title and Description are required.');
        return;
    }

    
    if (!API_ENDPOINTS.PROJECTS) {
        setError("PROJECTS API endpoint is not defined in config.");
        return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.PROJECTS}/${editingProject.project_id}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProject)
      });

       if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchProjects();
      setEditingProject(null); 
    } catch (e) {
      console.error("Failed to update project:", e);
      setError('Failed to update project. Please try again.');
    }
  };


  const handleDeleteProject = async (projectId) => {
    
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    setError(null);
    const token = localStorage.getItem('token');
     if (!token) {
      setError('Authentication token not found.');
      return;
    }

    
    if (!API_ENDPOINTS.PROJECTS) {
        setError("PROJECTS API endpoint is not defined in config.");
        return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

       if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchProjects();
    } catch (e) {
      console.error("Failed to delete project:", e);
      setError('Failed to delete project. Please try again.');
    }
  };

  const renderProjectForm = (projectData, handleSubmit, cancelAction) => (
    <form onSubmit={handleSubmit} className="project-form">
      <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
      <div className="form-field">
        <label>Title</label>
        <input type="text" name="title" value={projectData.title} onChange={handleInputChange} required />
      </div>
      <div className="form-field">
        <label>Description</label>
        <textarea name="description" value={projectData.description} onChange={handleInputChange} required />
      </div>
      <div className="form-field">
        <label>Technologies Used (comma-separated)</label>
        <input type="text" name="technologies" value={projectData.technologies || ''} onChange={handleInputChange} />
      </div>
      <div className="form-field">
        <label>Project URL (Optional)</label>
        <input type="url" name="project_url" value={projectData.project_url || ''} onChange={handleInputChange} />
      </div>
      <div className="form-field">
        <label>Image URL (Optional)</label>
        <input type="url" name="image_url" value={projectData.image_url || ''} onChange={handleInputChange} />
      </div>
      <div className="form-buttons">
        <button type="submit" className="button-primary">Save Project</button>
        <button type="button" onClick={cancelAction} className="button-secondary">Cancel</button>
      </div>
    </form>
  );


  return (
    <>
      <Header userType="student" />
      <div className="projects-container">
        <h2>My Projects</h2>

        {error && <p className="error-message">{error}</p>}

        {!showAddForm && !editingProject && (
          <button onClick={() => setShowAddForm(true)} className="button-primary add-project-button">
            Add New Project
          </button>
        )}

        {showAddForm && renderProjectForm(newProject, handleAddProject, () => setShowAddForm(false))}

        {editingProject && renderProjectForm(editingProject, handleUpdateProject, () => setEditingProject(null))}


        {isLoading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          
          <p>You haven&#39;t added any projects yet.</p>
        ) : (
          <div className="projects-list">
            {projects.map(project => (
              <div key={project.project_id} className="project-card">
                {project.image_url && <img src={project.image_url} alt={project.title} className="project-image" />}
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.technologies && <p><strong>Technologies:</strong> {project.technologies}</p>}
                {project.project_url && <a href={project.project_url} target="_blank" rel="noopener noreferrer">View Project</a>}
                 <div className="project-actions">
                   <button onClick={() => setEditingProject(project)} className="button-edit">Edit</button>
                   <button onClick={() => handleDeleteProject(project.project_id)} className="button-delete">Delete</button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default StudentProjects;
