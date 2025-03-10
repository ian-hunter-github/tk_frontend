import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { aiService } from "../services/ai";
import { projectsService } from "../services/projectsService";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProjectGoal, setNewProjectGoal] = useState("");
  const [newProjectNotes, setNewProjectNotes] = useState("");
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [acceptedCriteria, setAcceptedCriteria] = useState(new Set());

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsService.getAll();
      setProjects(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const generateSuggestions = async () => {
    if (!newProjectGoal.trim()) {
      alert("Please enter a project goal");
      return;
    }

    setIsGenerating(true);
    try {
      const suggestions = await aiService.generateCriteria(newProjectGoal);
      suggestions.mustHave = suggestions.mustHave.map((c) => ({
        ...c,
        id: Date.now() + Math.random(),
      }));
      suggestions.want = suggestions.want.map((c) => ({
        ...c,
        id: Date.now() + Math.random(),
      }));
      setAiSuggestions(suggestions);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptCriterion = (type, id) => {
    setAcceptedCriteria((prev) => new Set([...prev, `${type}-${id}`]));
  };

  const handleRejectCriterion = (type, id) => {
    const criteriaSet = new Set(acceptedCriteria);
    criteriaSet.delete(`${type}-${id}`);
    setAcceptedCriteria(criteriaSet);
  };

  const handleAcceptAll = () => {
    const allIds = [
      ...aiSuggestions.mustHave.map((c) => `must-${c.id}`),
      ...aiSuggestions.want.map((c) => `want-${c.id}`),
    ];
    setAcceptedCriteria(new Set(allIds));
  };

  const handleRejectAll = () => {
    setAcceptedCriteria(new Set());
  };

  const handleCreateProject = async () => {
    if (!newProjectGoal.trim()) {
      alert("Please enter a project goal");
      return;
    }

    if (aiSuggestions) {
      const acceptedMustHave = aiSuggestions.mustHave.filter((c) =>
        acceptedCriteria.has(`must-${c.id}`)
      );
      const acceptedWant = aiSuggestions.want.filter((c) =>
        acceptedCriteria.has(`want-${c.id}`)
      );

      if (acceptedMustHave.length === 0 && acceptedWant.length === 0) {
        alert("Please accept at least one criterion before creating the project");
        return;
      }
    }

    setLoading(true);
   try {
     const projectData = {
       title: newProjectGoal, // Use 'title' instead of 'name'
       description: newProjectNotes,
       criteria: aiSuggestions
         ? {
             mustHave: aiSuggestions.mustHave.filter((c) =>
               acceptedCriteria.has(`must-${c.id}`)
             ),
             want: aiSuggestions.want.filter((c) =>
               acceptedCriteria.has(`want-${c.id}`)
             ),
           }
         : null,
     };

     const data = await projectsService.create(projectData);
     console.log('Projects before update:', projects); // Debugging
     setProjects([...projects, data]);
     console.log('Projects after update:', projects); // Debugging
     setNewProjectGoal("");
     setNewProjectNotes("");
     setShowNewProjectForm(false);
     setAiSuggestions(null);
     setAcceptedCriteria(new Set());
     await fetchProjects();
   } catch (error) {
     alert(error.message);
   } finally {
     setLoading(false);
   }
 };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Projects</h2>
        <button
          onClick={() => setShowNewProjectForm(!showNewProjectForm)}
          className="primary-button create-project-button"
        >
          {showNewProjectForm ? "Cancel" : "+"}
        </button>
      </div>

      {showNewProjectForm && (
        <div className="new-project-form">
          <div className="form-section">
            <input
              type="text"
              placeholder="What decision do you need to make? (e.g., 'Which house to buy')"
              value={newProjectGoal}
              onChange={(e) => setNewProjectGoal(e.target.value)}
              disabled={loading || isGenerating}
            />
            <textarea
              placeholder="Additional notes or context"
              value={newProjectNotes}
              onChange={(e) => setNewProjectNotes(e.target.value)}
              disabled={loading || isGenerating}
            />
            {!aiSuggestions && (
              <button
                onClick={generateSuggestions}
                disabled={loading || isGenerating || !newProjectGoal.trim()}
                className="button button-secondary"
              >
                {isGenerating ? "Generating Suggestions..." : "Get AI Suggestions"}
              </button>
            )}
          </div>

          {aiSuggestions && (
            <div className="ai-suggestions">
              <div className="warning-banner">
                Please review and accept/reject the AI-suggested criteria before
                proceeding
              </div>

              <div className="bulk-actions">
                <button onClick={handleAcceptAll} className="button button-secondary">
                  Accept All
                </button>
                <button onClick={handleRejectAll} className="button button-secondary">
                  Reject All
                </button>
              </div>

              <div className="criteria-sections">
                <div className="criteria-section">
                  <h3>Must-Have Criteria</h3>
                  {aiSuggestions.mustHave.map((criteria) => (
                    <div
                      key={criteria.id}
                      className={`criteria-item ${
                        acceptedCriteria.has(`must-${criteria.id}`) ? "" : "pending"
                      }`}
                    >
                      <div className="criteria-content">
                        <strong>{criteria.name}</strong>
                        <p>{criteria.definition}</p>
                      </div>
                      <div className="criteria-actions">
                        {acceptedCriteria.has(`must-${criteria.id}`) ? (
                          <button
                            onClick={() => handleRejectCriterion("must", criteria.id)}
                            className="button button-danger"
                          >
                            Reject
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptCriterion("must", criteria.id)}
                            className="button"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="criteria-section">
                  <h3>Want Criteria</h3>
                  {aiSuggestions.want.map((criteria) => (
                    <div
                      key={criteria.id}
                      className={`criteria-item ${
                        acceptedCriteria.has(`want-${criteria.id}`) ? "" : "pending"
                      }`}
                    >
                      <div className="criteria-content">
                        <strong>{criteria.name}</strong>
                        <p>{criteria.definition}</p>
                        <span className="weight">Weight: {criteria.weight}</span>
                      </div>
                      <div className="criteria-actions">
                        {acceptedCriteria.has(`want-${criteria.id}`) ? (
                          <button
                            onClick={() => handleRejectCriterion("want", criteria.id)}
                            className="button button-danger"
                          >
                            Reject
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptCriterion("want", criteria.id)}
                            className="button"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="warning-banner">
                Please review and accept/reject the AI-suggested criteria before
                proceeding
              </div>
            </div>
          )}

          <button
            onClick={handleCreateProject}
            disabled={loading || isGenerating}
            className="button"
          >
            Create Project
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : error ? (
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={fetchProjects} className="retry-button">Retry</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="no-projects">No projects found.</div>
          ) : (
            projects.map((project) => (
              <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                <div className="project-card-content">
                  <h3>{project.title}</h3> {/* Use project.title */}
                  <p>{project.description}</p>
                  <div className="project-status">
                    {project.criteria && (
                      <span className="status-badge ai-suggested">
                        AI-Suggested Criteria
                      </span>
                    )}
                    {project.form_schema && (
                      <span className="status-badge">Form Schema Defined</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            margin-top: 20px; /* Add margin to separate from header */
        }

 .dashboard-header {
    display: flex;
    align-items: center; /* Vertically center items */
    margin-bottom: 30px;
}

.dashboard-header h2 {
      margin-right: auto; /* Push the h2 to the left */
}

    .create-project-button {
      font-size: 2rem;
      line-height: 1;
      padding: 0.25rem 0.75rem;
    }

        .primary-button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .primary-button:hover {
          background-color: #0056b3;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px 0;
        }

    @media (min-width: 768px) {
      .projects-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .projects-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1280px) {
      .projects-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

        .project-card {
          background-color: #fff9e6;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .project-card-content {
          padding: 20px;
        }

        .project-card h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.25rem;
        }

        .project-card p {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .project-status {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          background-color: #e9ecef;
          color: #495057;
        }

        .status-badge.ai-suggested {
          background-color: #cce5ff;
          color: #004085;
        }

        .error-container {
          text-align: center;
          padding: 20px;
          background-color: #fff3f3;
          border-radius: 8px;
          margin: 20px 0;
        }

        .retry-button {
          padding: 8px 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }

        .retry-button:hover {
          background-color: #c82333;
        }

        .no-projects {
          text-align: center;
          padding: 40px;
          background-color: #f8f9fa;
          border-radius: 8px;
          grid-column: 1 / -1;
          color: #6c757d;
        }

        .new-project-form {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-section input,
        .form-section textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-section textarea {
          min-height: 100px;
          resize: vertical;
        }

        .button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          background-color: #007bff;
          color: white;
        }

        .button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .button-secondary {
          background-color: #6c757d;
        }

        .button-danger {
          background-color: #dc3545;
        }

        .warning-banner {
          background-color: #fff3cd;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          margin: 15px 0;
          text-align: center;
        }

        .criteria-sections {
          display: grid;
          gap: 20px;
          margin: 20px 0;
        }

        .criteria-item {
          background-color: white;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #ddd;
          margin-bottom: 10px;
        }

        .criteria-item.pending {
          background-color: #f8f9fa;
        }

        .criteria-content {
          margin-bottom: 10px;
        }

        .criteria-actions {
          display: flex;
          justify-content: flex-end;
        }

        .bulk-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
