import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsService } from '../services/projectsService';
import { criteriaService } from '../services/criteriaService';
import { choicesService } from '../services/choicesService';
import { scoresService } from '../services/scoresService';

function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [newCriteria, setNewCriteria] = useState({ definition: '', weight: 1 });
  const [newOption, setNewOption] = useState({ description: '' });
  const [editingCriteriaId, setEditingCriteriaId] = useState(null);
  const [editingCriteria, setEditingCriteria] = useState({});
  const [editingChoiceId, setEditingChoiceId] = useState(null);
  const [editingChoice, setEditingChoice] = useState({});
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const navigate = useNavigate();

    useEffect(() => {
        async function fetchProjectData() {
            try {
                const projectData = await projectsService.getById(id);
                setProject(projectData);
            }
      catch (error) {
        setError(error.message)
      }
      finally {
        setLoading(false);
      }
    }
    fetchProjectData();
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await projectsService.getById(id);
      setProject(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = async (criteriaId, optionId, newScore) => {
    try {
      await scoresService.update(criteriaId, optionId, parseInt(newScore, 10));
      fetchProject(); // Refresh project data to get updated scores
    } catch (error) {
      alert('Failed to update score: ' + error.message);
    }
  };

  const handleAddCriteria = async () => {
    try {
      await criteriaService.create(id, [newCriteria]);
      setShowCriteriaModal(false);
      setNewCriteria({ definition: '', weight: 1 });
      fetchProject();
    } catch (error) {
      alert('Failed to add criteria: ' + error.message);
    }
  };

  const handleAddOption = async () => {
    try {
      await choicesService.create(id, [{ ...newOption, project_id: id }]);
      setShowOptionModal(false);
      setNewOption({ description: '' });
      fetchProject();
    } catch (error) {
      alert('Failed to add option: ' + error.message);
    }
  };

  const handleDeleteCriteria = async (criteriaId) => {
    if (window.confirm('Are you sure you want to delete this criteria?')) {
      try {
        await criteriaService.delete(criteriaId);
        fetchProject();
      } catch (error) {
        alert('Failed to delete criteria: ' + error.message);
      }
    }
  };

  const handleDeleteOption = async (optionId) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      try {
        await choicesService.delete(optionId);
        fetchProject();
      } catch (error) {
        alert('Failed to delete option: ' + error.message);
      }
    }
  };

    const handleEditCriteria = (criteria) => {
        setEditingCriteriaId(criteria.id);
        setEditingCriteria({ ...criteria });
    };

    const handleSaveCriteriaEdit = async () => {
        try {
            await criteriaService.update(editingCriteriaId, editingCriteria);
            fetchProject();
            setEditingCriteriaId(null);
            setEditingCriteria({});
        } catch (error) {
            alert('Failed to update criteria: ' + error.message);
        }
    }

    const handleCancelCriteriaEdit = () => {
        setEditingCriteriaId(null);
        setEditingCriteria({});
    }


    const handleEditChoice = (choice) => {
        setEditingChoiceId(choice.id);
        setEditingChoice({...choice});
    }

    const handleSaveChoiceEdit = async () => {
        try {
            const { scores, ...choiceDataWithoutScores } = editingChoice;
            await choicesService.update(editingChoiceId, choiceDataWithoutScores);
            fetchProject();
            setEditingChoiceId(null);
            setEditingChoice({});

        }
        catch (error){
            alert('Failed to update choice: '+ error.message);
        }
    }

    const handleCancelChoiceEdit = () => {
        setEditingChoiceId(null);
        setEditingChoice({});
    }

    const handleDeleteProject = async () => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await projectsService.delete(id);
                navigate('/'); // Redirect to dashboard after deletion
            } catch (error) {
                alert('Failed to delete project: ' + error.message);
            }
        }
    }


  if (loading) return <p>Loading project...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!project) return <p>Project not found.</p>;

    const handleSaveProjectEdit = async () => {
        try {
            await projectsService.update(project.id, editedProject);
            setProject({ ...project, ...editedProject }); // Update local project state
            setIsEditingProject(false);
        } catch (error) {
            alert('Failed to update project: ' + error.message);
        }
    }

    const handleCancelProjectEdit = () => {
        setIsEditingProject(false);
        setEditedProject({}); // Reset edited project data
    }

  const sortedChoices = [...(project.choices || [])].sort(
    (a, b) => (b.total_score || 0) - (a.total_score || 0)
  );

  const sortedCriteria = [...(project.criteria || [])].sort(
    (a, b) => b.weight - a.weight
  );

  return (
    <div className="project-view">
      <div className="project-header">
        <h2>{isEditingProject ? 'Edit Project' : project.title}</h2>
        <div className="header-actions">
          <button onClick={() => setShowCriteriaModal(true)} className="action-button">
            Add Criteria
          </button>
          <button onClick={() => setShowOptionModal(true)} className="action-button">
            Add Option
          </button>
          {isEditingProject ? (
            <>
              <button onClick={handleSaveProjectEdit} className="action-button save">
                Save
              </button>
              <button onClick={handleCancelProjectEdit} className="action-button cancel">
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsEditingProject(true);
                setEditedProject({ title: project.title, description: project.description });
              }}
              className="action-button edit"
            >
              Edit Project
            </button>
          )}
          <button onClick={handleDeleteProject} className="action-button delete">
            Delete Project
          </button>
        </div>
    </div>
      <button className="back-button" onClick={() => navigate('/')}>Back to Dashboard</button>

      {isEditingProject ? (
        <div className="project-edit">
          <input
            type="text"
            value={editedProject.title}
            onChange={(e) =>
              setEditedProject({ ...editedProject, title: e.target.value })
            }
            placeholder="Project Title"
          />
          <textarea
            value={editedProject.description || ''}
            onChange={(e) =>
              setEditedProject({ ...editedProject, description: e.target.value })
            }
            placeholder="Project Description"
          />
        </div>
      ) : null}

      <div className="project-table">
        {!(project.criteria?.length === 0 && project.choices?.length === 0) ? (
          <table>
            <thead>
              <tr>
                <th className="corner-cell"></th>
                {sortedCriteria.length > 0 && sortedChoices.length === 0 ? (
                  <th className="option-header">&nbsp;</th>
                ) : (
                  sortedChoices.map((choice) => (
                    <th
                      key={choice.id}
                      className={`option-header ${
                        sortedChoices.length > 0 &&
                        choice.id === sortedChoices[0].id &&
                        sortedChoices[0].total_score !==
                          sortedChoices[sortedChoices.length - 1].total_score
                          ? 'highest-score highest-score-border'
                          : ''
                      }`}
                    >
                      {editingChoiceId === choice.id ? (
                        <>
                          <textarea
                            value={editingChoice.description}
                            onChange={(e) =>
                              setEditingChoice({
                                ...editingChoice,
                                description: e.target.value,
                              })
                            }
                          />
                          <button onClick={handleSaveChoiceEdit}>Save</button>
                          <button onClick={handleCancelChoiceEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <div className="option-actions">
                            <button
                              onClick={() => handleDeleteOption(choice.id)}
                              className="icon-button delete"
                            >
                              ×
                            </button>
                            <button
                              onClick={() => handleEditChoice(choice)}
                              className="icon-button edit"
                            >
                              ✎
                            </button>
                          </div>
                          <div className="option-name">
                            {choice.description}
                            <span className="option-score">
                              ({choice.total_score || 0})
                            </span>
                          </div>
                        </>
                      )}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {sortedChoices.length > 0 && sortedCriteria.length === 0 ? (
                <tr>
                  <td className="criteria-cell">&nbsp;</td>
                  {sortedChoices.map((choice) => (
                    <td key={choice.id} className="score-cell">&nbsp;</td>
                  ))}
                </tr>
              ) : (
                sortedCriteria.map((criteria) => (
                  <tr key={criteria.id}>
                    <td className="criteria-cell">
                      {editingCriteriaId === criteria.id ? (
                        <>
                          <input
                            type="text"
                            value={editingCriteria.definition}
                            onChange={(e) =>
                              setEditingCriteria({
                                ...editingCriteria,
                                definition: e.target.value,
                              })
                            }
                          />
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editingCriteria.weight}
                            onChange={(e) =>
                              setEditingCriteria({
                                ...editingCriteria,
                                weight: parseInt(e.target.value, 10),
                              })
                            }
                          />
                          <button onClick={handleSaveCriteriaEdit}>Save</button>
                          <button
                            onClick={handleCancelCriteriaEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="criteria-actions">
                            <button
                              onClick={() => handleDeleteCriteria(criteria.id)}
                              className="icon-button delete"
                            >
                              ×
                            </button>
                            <button
                              onClick={() => handleEditCriteria(criteria)}
                              className="icon-button edit"
                            >
                              ✎
                            </button>
                          </div>
                          <div className="criteria-name">
                            {criteria.definition}
                            <span className="criteria-weight">
                              Weight: {criteria.weight}
                            </span>
                          </div>
                        </>
                      )}
                    </td>
                    {sortedChoices.length > 0 ? (
                      sortedChoices.map((choice) => (
                        <td
                          key={`${criteria.id}-${choice.id}`}
                          className={`score-cell ${
                            sortedChoices.length > 0 &&
                            choice.id === sortedChoices[0].id &&
                            sortedChoices[0].total_score !==
                              sortedChoices[sortedChoices.length - 1].total_score
                              ? 'highest-score highest-score-border'
                              : ''
                          }`}
                        >
                          <select
                            value={choice.scores?.[criteria.id] || 0}
                            onChange={(e) =>
                              handleScoreChange(
                                criteria.id,
                                choice.id,
                                e.target.value
                              )
                            }
                            className="score-select"
                          >
                            {[0, 1, 2, 3, 4, 5].map((score) => (
                              <option key={score} value={score}>
                                {score}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))
                    ) : (
                      <td className="score-cell">&nbsp;</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <div className="no-data-message">
            <h2>No criteria or options have been added to this project yet.</h2>
            <p>
              Use the "Add Criteria" and "Add Option" buttons to start building
              your decision-making framework.
            </p>
          </div>
        )}
      </div>

      {/* Add Criteria Modal */}
      {showCriteriaModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Criteria</h3>
            <input
              type="text"
              placeholder="Criteria definition"
              value={newCriteria.definition}
              onChange={(e) => setNewCriteria({ ...newCriteria, definition: e.target.value })}
            />
            <input
              type="number"
              placeholder="Weight (1-5)"
              min="1"
              max="5"
              value={newCriteria.weight}
              onChange={(e) => setNewCriteria({ ...newCriteria, weight: parseInt(e.target.value, 10) })}
            />
            <div className="modal-actions">
              <button onClick={() => setShowCriteriaModal(false)} className="button secondary">
                Cancel
              </button>
              <button onClick={handleAddCriteria} className="button primary">
                Add Criteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Option Modal */}
      {showOptionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Option</h3>
            <textarea
              placeholder="Description"
              value={newOption.description}
              onChange={(e) => setNewOption({ description: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={() => setShowOptionModal(false)} className="button secondary">
                Cancel
              </button>
              <button onClick={handleAddOption} className="button primary">
                Add Option
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .project-view {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .action-button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .action-button:hover {
          background-color: #0056b3;
        }

        .action-button.delete {
          background-color: #dc3545;
        }

        .action-button.delete:hover {
          background-color: #c82333;
        }

      .back-button {
        background-color: #6c757d;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }

      .back-button:hover {
        opacity: 0.8;
      }

 .project-edit input,
    .project-edit textarea {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box; /* Add this to include padding and border in the element's total width and height */
    }

    .project-edit textarea {
      min-height: 100px;
      resize: vertical;
    }

        .project-table {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          border: 1px solid #a9a9a9;
        }

        .corner-cell {
          background-color: #808080;
          width: 200px;
          border: 1px solid #a9a9a9;
        }

        .option-header {
          min-width: 150px;
          background-color: #f8f9fa;
        }

        .criteria-cell {
          background-color: #f8f9fa;
        }

        .score-cell {
          text-align: center;
        }

        .highest-score {
          background-color: #fafad2;
        }

        .highest-score-border {
          border-left: 1px solid black !important;
          border-right: 1px solid black !important;
        }

        .score-select {
          width: 60px;
          padding: 4px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .icon-button {
          padding: 2px 6px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #6c757d;
        }

        .icon-button.delete {
          color: #dc3545;
        }

        .icon-button.edit {
          color: #007bff;
        }

        .option-actions, .criteria-actions {
          display: flex;
          gap: 4px;
          margin-bottom: 4px;
        }

        .option-name, .criteria-name {
          font-weight: 500;
        }

        .option-score {
          margin-left: 8px;
          color: #6c757d;
        }

        .criteria-weight {
          display: block;
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: normal;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
        }

        .modal h3 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .modal input,
        .modal textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .modal textarea {
          min-height: 100px;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .button.primary {
          background-color: #007bff;
          color: white;
        }

        .button.secondary {
          background-color: #6c757d;
          color: white;
        }

        .button:hover {
          opacity: 0.9;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .modal {
            width: 95%; /* Make modals take up most of the screen width */
          }

          .header-actions {
            flex-direction: column; /* Stack buttons vertically */
            align-items: flex-start; /* Align to the start */
          }
          .header-actions button{
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default ProjectView;
