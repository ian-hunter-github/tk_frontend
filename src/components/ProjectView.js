import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiService } from '../services/ai';
import { config } from '../config';

function CriteriaDefinition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [mustHaveCriteria, setMustHaveCriteria] = useState([]);
  const [wantCriteria, setWantCriteria] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMustHaveCriteria([{ id: crypto.randomUUID(), name: '', description: '' }]);
    setWantCriteria([{ id: crypto.randomUUID(), name: '', description: '', weight: 1 }]);
  }, []);

  const addMustHaveCriteria = () => {
    setMustHaveCriteria([...mustHaveCriteria, { id: crypto.randomUUID(), name: '', description: '' }]);
  };

  const addWantCriteria = () => {
    setWantCriteria([...wantCriteria, { id: crypto.randomUUID(), name: '', description: '', weight: 1 }]);
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
    const controller = new AbortController();
    const fetchProject = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No access token found');
        
        const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        setProject(prev => (prev?.id !== data.id ? data : prev));
      } catch (error) {
        if (error.name !== 'AbortError') setError(error.message);
      }
    };

    fetchProject();
    return () => controller.abort();
  }, [id]);

  const generateCriteria = async () => {
    if (!project?.name) return;
    
    setIsGenerating(true);
    try {
      const suggestions = await aiService.generateCriteria(project.name);
      
      setMustHaveCriteria(prev => [
        ...prev,
        ...suggestions.mustHave.map(c => ({ id: crypto.randomUUID(), ...c }))
      ]);
      
      setWantCriteria(prev => [
        ...prev,
        ...suggestions.want.map(c => ({ id: crypto.randomUUID(), ...c }))
      ]);
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
      const validMustHave = mustHaveCriteria.filter(c => c.name.trim());
      if (validMustHave.length === 0) {
        throw new Error('At least one Must-Have criteria is required');
      }

      const validWant = wantCriteria.filter(c => c.name.trim());
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}/criteria`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mustHave: validMustHave, want: validWant })
      });

      if (!response.ok) throw new Error('Failed to save criteria');
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
          <button type="button" onClick={generateCriteria} disabled={isGenerating || !project.name} className="button button-secondary">
            {isGenerating ? 'Generating...' : 'Get AI Suggestions'}
          </button>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading} className="button">Save Criteria</button>
      </form>
    </div>
  );
}

export default CriteriaDefinition;
