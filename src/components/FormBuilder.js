import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { config } from '../config';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Multiple Choice' },
  { value: 'date', label: 'Date' }
];

function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([
    { id: Date.now(), name: '', type: 'text', required: false, options: [] }
  ]);

  const addField = () => {
    setFields([...fields, { 
      id: Date.now(), 
      name: '', 
      type: 'text', 
      required: false,
      options: []
    }]);
  };

  const updateField = (id, updates) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const addOption = (fieldId) => {
    setFields(fields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          options: [...field.options, { id: Date.now(), value: '', label: '' }]
        };
      }
      return field;
    }));
  };

  const updateOption = (fieldId, optionId, updates) => {
    setFields(fields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          options: field.options.map(option =>
            option.id === optionId ? { ...option, ...updates } : option
          )
        };
      }
      return field;
    }));
  };

  const removeOption = (fieldId, optionId) => {
    setFields(fields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          options: field.options.filter(option => option.id !== optionId)
        };
      }
      return field;
    }));
  };

  const generateSchema = () => {
    const properties = {};
    const required = [];

    fields.forEach(field => {
      if (!field.name.trim()) return;

      const propertyName = field.name.toLowerCase().replace(/\s+/g, '_');
      
      let property = {
        title: field.name,
        type: field.type === 'number' ? 'number' : 'string'
      };

      if (field.type === 'boolean') {
        property.type = 'boolean';
      } else if (field.type === 'select') {
        property.enum = field.options.map(opt => opt.value);
        property.enumNames = field.options.map(opt => opt.label);
      } else if (field.type === 'date') {
        property.format = 'date';
      }

      if (field.required) {
        required.push(propertyName);
      }

      properties[propertyName] = property;
    });

    return {
      type: 'object',
      properties,
      required
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate fields
      const validFields = fields.filter(f => f.name.trim());
      if (validFields.length === 0) {
        throw new Error('At least one field is required');
      }

      // Validate select field options
      const invalidSelectField = validFields.find(
        f => f.type === 'select' && f.options.length === 0
      );
      if (invalidSelectField) {
        throw new Error(`Field "${invalidSelectField.name}" requires at least one option`);
      }

      const schema = generateSchema();
      const { session } = await authService.getSession();
      const response = await fetch(`${config.API_URL}/projects/${id}/form-schema`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schema })
      });

      if (!response.ok) {
        throw new Error('Failed to save form schema');
      }

      navigate(`/projects/${id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-builder">
      <h2>Define Alternative Input Form</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="fields-container">
          {fields.map((field) => (
            <div key={field.id} className="field-item">
              <div className="field-header">
                <input
                  type="text"
                  placeholder="Field Name"
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  disabled={loading}
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value })}
                  disabled={loading}
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <label>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    disabled={loading}
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  disabled={loading}
                  className="button button-danger"
                >
                  Remove
                </button>
              </div>

              {field.type === 'select' && (
                <div className="options-container">
                  <h4>Options</h4>
                  {field.options.map(option => (
                    <div key={option.id} className="option-item">
                      <input
                        type="text"
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => updateOption(field.id, option.id, { value: e.target.value })}
                        disabled={loading}
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => updateOption(field.id, option.id, { label: e.target.value })}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(field.id, option.id)}
                        disabled={loading}
                        className="button button-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(field.id)}
                    disabled={loading}
                    className="button button-secondary"
                  >
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addField}
          disabled={loading}
          className="button button-secondary"
        >
          Add Field
        </button>

        <button
          type="submit"
          disabled={loading}
          className="button"
        >
          Save Form Schema
        </button>
      </form>
    </div>
  );
}

export default FormBuilder;
