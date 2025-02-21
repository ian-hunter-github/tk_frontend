import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { aiService } from "../services/ai";
import { config } from "../config";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Track error state
  const [newProjectGoal, setNewProjectGoal] = useState("");
  const [newProjectNotes, setNewProjectNotes] = useState("");
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [acceptedCriteria, setAcceptedCriteria] = useState(new Set());

  const fetchProjects = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found. Please sign in again.");
        return;
      }
      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to fetch projects";
        throw new Error(errorMessage);
      }

      const data = await response.json();
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
      // Add IDs to criteria for tracking acceptance
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
      // Get accepted criteria
      const acceptedMustHave = aiSuggestions.mustHave.filter((c) =>
        acceptedCriteria.has(`must-${c.id}`)
      );
      const acceptedWant = aiSuggestions.want.filter((c) =>
        acceptedCriteria.has(`want-${c.id}`)
      );

      if (acceptedMustHave.length === 0 && acceptedWant.length === 0) {
        alert(
          "Please accept at least one criterion before creating the project"
        );
        return;
      }
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProjectGoal,
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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      setProjects([...projects, data]);
      setNewProjectGoal("");
      setNewProjectNotes("");
      setShowNewProjectForm(false);
      setAiSuggestions(null);
      setAcceptedCriteria(new Set());
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => setShowNewProjectForm(!showNewProjectForm)}>
        {showNewProjectForm ? "Cancel" : "Create New Project"}
      </button>

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
                {isGenerating
                  ? "Generating Suggestions..."
                  : "Get AI Suggestions"}
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
                <button
                  onClick={handleAcceptAll}
                  className="button button-secondary"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="button button-secondary"
                >
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
                        acceptedCriteria.has(`must-${criteria.id}`)
                          ? ""
                          : "pending"
                      }`}
                    >
                      <div className="criteria-content">
                        <strong>{criteria.name}</strong>
                        <p>{criteria.description}</p>
                      </div>
                      <div className="criteria-actions">
                        {acceptedCriteria.has(`must-${criteria.id}`) ? (
                          <button
                            onClick={() =>
                              handleRejectCriterion("must", criteria.id)
                            }
                            className="button button-danger"
                          >
                            Reject
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleAcceptCriterion("must", criteria.id)
                            }
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
                        acceptedCriteria.has(`want-${criteria.id}`)
                          ? ""
                          : "pending"
                      }`}
                    >
                      <div className="criteria-content">
                        <strong>{criteria.name}</strong>
                        <p>{criteria.description}</p>
                        <span className="weight">
                          Weight: {criteria.weight}
                        </span>
                      </div>
                      <div className="criteria-actions">
                        {acceptedCriteria.has(`want-${criteria.id}`) ? (
                          <button
                            onClick={() =>
                              handleRejectCriterion("want", criteria.id)
                            }
                            className="button button-danger"
                          >
                            Reject
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleAcceptCriterion("want", criteria.id)
                            }
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
        <div>
          <p>Error: {error}</p>
          <button onClick={fetchProjects}>Retry</button>
        </div>
      ) : (
        <ul className="projects-list">
          {projects.length === 0 ? (
            <li>No projects found.</li>
          ) : (
            projects.map((project) => (
              <li key={project.id}>
                <Link to={`/projects/${project.id}`}>
                  <h3>{project.name}</h3>
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
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
