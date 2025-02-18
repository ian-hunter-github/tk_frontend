import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/auth';

import { config } from '../config';

function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { session } = await authService.getSession();
        const response = await fetch(`${config.API_URL}/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const data = await response.json();
        setProject(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div>
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      
      <div className="project-workflow">
        <h3>Project Setup Steps</h3>
        <div className="workflow-steps">
          <div className="workflow-step">
            <h4>1. Define Criteria</h4>
            <p>Set up Must-Have and Want criteria for evaluation</p>
            <Link to={`/projects/${id}/criteria`} className="button">
              {project.criteria ? 'Edit Criteria' : 'Define Criteria'}
            </Link>
          </div>

          <div className="workflow-step">
            <h4>2. Create Input Form</h4>
            <p>Design the form for collecting alternative details</p>
            <Link to={`/projects/${id}/form`} className="button">
              {project.form_schema ? 'Edit Form' : 'Create Form'}
            </Link>
          </div>

          <div className="workflow-step">
            <h4>3. Evaluate Alternatives</h4>
            <p>Add and evaluate alternatives based on criteria</p>
            <Link
              to={`/projects/${id}/evaluate`}
              className={`button ${(!project.criteria || !project.form_schema) ? 'disabled' : ''}`}
              onClick={(e) => {
                if (!project.criteria || !project.form_schema) {
                  e.preventDefault();
                }
              }}
              title={!project.criteria ? 'Define criteria first' : !project.form_schema ? 'Create input form first' : ''}
            >
              Start Evaluation
            </Link>
          </div>
        </div>
      </div>

      <div className="project-sections">
        <section>
          <h3>Must-Have Criteria</h3>
          {project.criteria?.must_have ? (
            <ul>
              {project.criteria.must_have.map((criteria, index) => (
                <li key={index}>
                  <strong>{criteria.name}</strong>
                  {criteria.description && <p>{criteria.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No must-have criteria defined yet.</p>
          )}
        </section>

        <section>
          <h3>Want Criteria</h3>
          {project.criteria?.want ? (
            <ul>
              {project.criteria.want.map((criteria, index) => (
                <li key={index}>
                  <strong>{criteria.name}</strong> (Weight: {criteria.weight})
                  {criteria.description && <p>{criteria.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No want criteria defined yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProjectView;
