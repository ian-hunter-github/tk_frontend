import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { aiService } from '../services/ai';
import { config } from '../config';

function CriteriaDefinition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [mustHaveCriteria, setMustHaveCriteria] = useState([{ id: Date.now(), name: '', description: '' }]);
  const [wantCriteria, setWantCriteria] = useState([{ id: Date.now(), name: '', description: '', weight: 1 }]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addMustHaveCriteria = () => {
    setMustHaveCriteria([...mustHaveCriteria, { id: Date.now(), name: '', description: '' }]);
  };

  const addWantCriteria = () => {
    setWantCriteria([...wantCriteria, { id: Date.now(), name: '', description: '', weight: 1 }]);
  };

  const updateMustHaveCriteria = (id, field, value) => {
    setMustHaveCriteria(mustHaveCriteria.map(criteria => 
      criteria.id === id ? { ...criteria, [field]: value } : criteria
    ));
  };

  const updateWantCriteria = (id, field, value) => {
    setWantCriteria(wantCriteria.map(criteria => 
      criteria.id === id ? { ...criteria, [field]: value } : criteria
    ));
  };

  const removeMustHaveCriteria = (id) => {
    if (mustHaveCriteria.length > 1) {
      setMustHaveCriteria(mustHaveCriteria.filter(criteria => criteria.id !== id));
    }
  };

  const removeWantCriteria = (id) => {
    setWantCriteria(wantCriteria.filter(criteria => criteria.id !== id));
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { session } = await authService.getSession();
        const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
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
      }
    };

    fetchProject();
  }, [id]);

  const generateCriteria = async () => {
    if (!project?.name) return;
    
    setIsGenerating(true);
    try {
      const suggestions = await aiService.generateCriteria(project.name);
      
      // Convert AI suggestions to our format with IDs
      const newMustHave = suggestions.mustHave.map(criteria => ({
        id: Date.now() + Math.random(),
        ...criteria
      }));
      
      const newWant = suggestions.want.map(criteria => ({
        id: Date.now() + Math.random(),
        ...criteria
      }));

      setMustHaveCriteria(newMustHave);
      setWantCriteria(newWant);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate Must-Have criteria
      const validMustHave = mustHaveCriteria.filter(c => c.name.trim());
      if (validMustHave.length === 0) {
        throw new Error('At least one Must-Have criteria is required');
      }

      // Filter out empty criteria
      const validWant = wantCriteria.filter(c => c.name.trim());

      const { session } = await authService.getSession();
      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}/criteria`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mustHave: validMustHave,
          want: validWant
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save criteria');
      }

      navigate(`/projects/${id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
            {isGenerating ? 'Generating...' : 'Get AI Suggestions'}
          </button>
        )}
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <section className="criteria-section">
          <h3>Must-Have Criteria</h3>
          <p>These are mandatory requirements. Alternatives that don't meet these criteria will be disqualified.</p>
          {mustHaveCriteria.map((criteria, index) => (
            <div key={criteria.id} className="criteria-item">
              <input
                type="text"
                placeholder="Criteria Name"
                value={criteria.name}
                onChange={(e) => updateMustHaveCriteria(criteria.id, 'name', e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Description"
                value={criteria.description}
                onChange={(e) => updateMustHaveCriteria(criteria.id, 'description', e.target.value)}
                disabled={loading}
              />
              {mustHaveCriteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMustHaveCriteria(criteria.id)}
                  disabled={loading}
                  className="button button-danger"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={addMustHaveCriteria} 
            disabled={loading}
            className="button button-secondary"
          >
            Add Must-Have Criteria
          </button>
        </section>

        <section className="criteria-section">
          <h3>Want Criteria</h3>
          <p>These are desired attributes. Each will be scored and weighted to calculate the final score.</p>
          {wantCriteria.map((criteria) => (
            <div key={criteria.id} className="criteria-item">
              <input
                type="text"
                placeholder="Criteria Name"
                value={criteria.name}
                onChange={(e) => updateWantCriteria(criteria.id, 'name', e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Description"
                value={criteria.description}
                onChange={(e) => updateWantCriteria(criteria.id, 'description', e.target.value)}
                disabled={loading}
              />
              <input
                type="number"
                min="1"
                max="10"
                value={criteria.weight}
                onChange={(e) => updateWantCriteria(criteria.id, 'weight', parseInt(e.target.value, 10))}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => removeWantCriteria(criteria.id)}
                disabled={loading}
                className="button button-danger"
              >
                Remove
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={addWantCriteria} 
            disabled={loading}
            className="button button-secondary"
          >
            Add Want Criteria
          </button>
        </section>

        <button 
          type="submit" 
          disabled={loading}
          className="button"
        >
          Save Criteria
        </button>
      </form>
    </div>
  );
}

export default CriteriaDefinition;
