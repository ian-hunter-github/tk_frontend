import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { aiService } from '../services/ai';
import { config } from '../config';

function AlternativeEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({});
  const [alternatives, setAlternatives] = useState([]);

  useEffect(() => {
    const fetchProjectData = async () => {
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

        // Fetch existing alternatives
        const altResponse = await fetch(`${config.API_URL}/projects/${id}/results`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!altResponse.ok) {
          throw new Error('Failed to fetch alternatives');
        }

        const altData = await altResponse.json();
        setAlternatives(altData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderFormField = (fieldName, field) => {
    switch (field.type) {
      case 'boolean':
        return (
          <select
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value === 'true')}
            disabled={loading}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, parseFloat(e.target.value))}
            disabled={loading}
          />
        );
      case 'select':
        return (
          <select
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            disabled={loading}
          >
            <option value="">Select...</option>
            {field.enum.map((value, index) => (
              <option key={value} value={value}>
                {field.enumNames?.[index] || value}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            disabled={loading}
          />
        );
      default:
        return (
          <input
            type="text"
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            disabled={loading}
          />
        );
    }
  };

  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First, get AI evaluation
      setIsEvaluating(true);
      const aiEvaluation = await aiService.evaluateAlternative(formData, {
        mustHave: project.criteria.must_have,
        want: project.criteria.want
      });

      // Submit alternative with AI evaluation
      const { session } = await authService.getSession();
      const response = await fetch(`${config.API_URL}/projects/${id}/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alternative: formData,
          evaluation: aiEvaluation
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit alternative');
      }

      const data = await response.json();
      setAlternatives([...alternatives, data]);
      setFormData({});
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setIsEvaluating(false);
    }
  };

  const handleNewCriteria = async () => {
    if (alternatives.length === 0) return;

    try {
      setLoading(true);
      const predictions = await Promise.all(
        alternatives.map(alt => 
          aiService.predictScores(
            alt.data,
            project.criteria,
            alt.evaluation
          )
        )
      );

      // Update alternatives with predicted scores
      const updatedAlternatives = alternatives.map((alt, index) => ({
        ...alt,
        evaluation: {
          ...alt.evaluation,
          ...predictions[index]
        }
      }));

      setAlternatives(updatedAlternatives);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!project?.form_schema || !project?.criteria) {
    return (
      <div>
        <h2>Project Setup Required</h2>
        <p>Please complete the project setup before evaluating alternatives:</p>
        <ul>
          {!project?.criteria && <li>Define evaluation criteria</li>}
          {!project?.form_schema && <li>Create input form</li>}
        </ul>
      </div>
    );
  }

  return (
    <div className="alternative-evaluation">
      <h2>Evaluate Alternative</h2>
      {error && <div className="error">{error}</div>}

      <div className="evaluation-sections">
        {project?.criteria && (
          <div className="ai-assistance">
            <p>AI will help evaluate alternatives against your criteria and provide suggested scores.</p>
            {alternatives.length > 0 && (
              <button
                onClick={handleNewCriteria}
                disabled={loading}
                className="button button-secondary"
              >
                Update Scores for New Criteria
              </button>
            )}
          </div>
        )}
        <section className="new-alternative">
          <h3>Add New Alternative</h3>
          <form onSubmit={handleSubmit}>
            {Object.entries(project.form_schema.properties).map(([fieldName, field]) => (
              <div key={fieldName} className="form-field">
                <label>
                  {field.title}
                  {project.form_schema.required?.includes(fieldName) && ' *'}
                </label>
                {renderFormField(fieldName, field)}
              </div>
            ))}
            <button 
              type="submit" 
              className="button" 
              disabled={loading || isEvaluating}
            >
              {isEvaluating ? 'AI Evaluating...' : 'Submit Alternative'}
            </button>
          </form>
        </section>

        <section className="alternatives-list">
          <h3>Evaluated Alternatives</h3>
          {alternatives.length === 0 ? (
            <p>No alternatives evaluated yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Alternative</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {alternatives.map((alt) => (
                  <tr key={alt.id} className={alt.disqualified ? 'disqualified' : ''}>
                    <td>
                      {Object.entries(alt.data).map(([key, value]) => (
                        <div key={key}>
                          <strong>{project.form_schema.properties[key].title}:</strong>{' '}
                          {value.toString()}
                        </div>
                      ))}
                    </td>
                    <td>{alt.disqualified ? 'Disqualified' : 'Qualified'}</td>
                    <td>{alt.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default AlternativeEvaluation;
