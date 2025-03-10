// choicesService.integration.test.js
import {
  createChoice,
  getChoices,
  updateChoice,
  deleteChoice,
} from '../choicesService';
import { getSessionToken } from '../../utils/getSessionToken';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

describe('Choices Service Integration Tests', () => {
  let projectId;
  let choiceId;
  let token;

    beforeAll(async () => {
    token = await getSessionToken(ADMIN_EMAIL, ADMIN_PASSWORD)
    // Create a project to use for testing
    const projectResponse = await fetch(
      'http://localhost:8888/.netlify/functions/projects',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'Test Project for Choices' }),
      }
    );
    const projectData = await projectResponse.json();
    projectId = projectData.id;
  }, 20000);

  afterAll(async () => {
    // Clean up: Delete the test project
    if (projectId) {
      await fetch(
        `http://localhost:8888/.netlify/functions/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  });

  it('should create a new choice', async () => {
    const newChoice = {
      project_id: projectId,
      name: 'Test Choice',
      description: 'This is a test choice.',
    };
    const createdChoice = await createChoice(newChoice, token);
    expect(createdChoice).toHaveProperty('id');
    expect(createdChoice.name).toBe(newChoice.name);
    choiceId = createdChoice.id;
  }, 20000);

  it('should get choices for a project', async () => {
    const choices = await getChoices(projectId, token);
    expect(Array.isArray(choices)).toBe(true);
    expect(choices.some((choice) => choice.id === choiceId)).toBe(true);
  }, 20000);

  it('should update an existing choice', async () => {
    const updatedChoiceData = {
      id: choiceId,
      project_id: projectId,
      name: 'Updated Choice Name',
      description: 'Updated description.',
    };
    const updatedChoice = await updateChoice(updatedChoiceData, token);
    expect(updatedChoice.name).toBe(updatedChoiceData.name);
  }, 20000);

  it('should delete a choice', async () => {
      const choiceToDelete = {
        project_id: projectId,
        id: choiceId
      }
    const deletedChoiceId = await deleteChoice(choiceToDelete, token);
    expect(deletedChoiceId).toBe(choiceId);

    // Verify choice is deleted
    const choices = await getChoices(projectId, token);
    expect(choices.some((choice) => choice.id === choiceId)).toBe(false);
  }, 20000);
});
