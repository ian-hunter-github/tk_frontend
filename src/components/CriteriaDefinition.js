import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { criteriaService } from '../services/criteriaService';
import { aiService } from "../services/ai";
import { config } from "../config";

function CriteriaDefinition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [criteriaList, setCriteriaList] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(
          `${config.NETLIFY_FUNC_URL}/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }

        const data = await response.json();
        setProject(data);
        setCriteriaList(
          data.criteria && data.criteria.length > 0
            ? data.criteria
            : [{ id: crypto.randomUUID(), definition: "", weight: 1 }]
        );
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProject();
  }, [id]);

  const addCriteria = () => {
    setCriteriaList([
      ...criteriaList,
      { id: crypto.randomUUID(), definition: "", weight: 1 },
    ]);
  };

  const updateCriteria = (id, field, value) => {
    setCriteriaList(
      criteriaList.map((criteria) =>
        criteria.id === id ? { ...criteria, [field]: value } : criteria
      )
    );
  };

  const removeCriteria = (id) => {
    setCriteriaList(criteriaList.filter((criteria) => criteria.id !== id));
  };

  const generateCriteria = async () => {
    if (!project?.name) return;

    setIsGenerating(true);
    try {
      const suggestions = await aiService.generateCriteria(project.name);
      const newCriteria = suggestions.map((criteria) => ({
        id: crypto.randomUUID(),
        definition: criteria.definition,
        weight: criteria.weight || 1,
      }));
      setCriteriaList(newCriteria);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validCriteria = criteriaList.filter((c) => c.definition.trim());
      if (validCriteria.length === 0) {
        throw new Error("At least one criterion is required");
      }

      // Use criteriaService.create to handle the API call
      await criteriaService.create(id, validCriteria);

      navigate(`/projects/${id}`);
    } catch (error) {
      setError(error.message);
    }
  };

    return (
    <div className="criteria-form">
      <div className="criteria-header">
        <h2>Define Decision Criteria</h2>
        {project && (
          <button
            type="button"
            onClick={generateCriteria}
            disabled={isGenerating || !project.name}
            className="button button-secondary"
          >
            {isGenerating ? "Generating..." : "Get AI Suggestions"}
          </button>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <section className="criteria-section">
          <h3>Criteria</h3>
          {criteriaList.map((criteria) => (
            <div key={criteria.id}>
              <input
                type="text"
                placeholder="Definition"
                value={criteria.definition}
                onChange={(e) =>
                  updateCriteria(criteria.id, "definition", e.target.value)
                }
              />
              <input
                type="number"
                min="1"
                max="10"
                value={criteria.weight}
                onChange={(e) =>
                  updateCriteria(
                    criteria.id,
                    "weight",
                    parseInt(e.target.value, 10)
                  )
                }
              />
              <button type="button" onClick={() => removeCriteria(criteria.id)}>
                Remove
              </button>
            </div>
          ))}

          <div key={"new_criteria"}>
            <input type="text" placeholder="Definition" value="" />
            <input type="number" min="1" max="10" />
          </div>
          <button type="button" onClick={addCriteria}>
            Add Criteria
          </button>
        </section>
        <button type="submit">Save Criteria</button>
      </form>
    </div>
  );
}

export default CriteriaDefinition;
