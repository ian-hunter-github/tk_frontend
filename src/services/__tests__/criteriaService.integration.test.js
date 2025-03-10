// criteriaService.integration.test.js
import {
  createCriterion,
  getCriteria,
  updateCriterion,
  deleteCriterion,
} from '../criteriaService';
import { getSessionToken } from '../../utils/getSessionToken';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

describe('Criteria Service Integration Tests', () => {
  let projectId;
  let criterionId;
  let token;

  beforeAll(async () => {
    token = await getSessionToken(ADMIN_EMAIL, ADMIN_PASSWORD);
    // Create a project to use for testing
    const projectResponse = await fetch(
      'http://localhost:8888/.netlify/functions/projects',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'Test Project for Criteria' }),
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

  it('should create a new criterion', async () => {
    const newCriterion = {
      project_id: projectId,
      name: 'Test Criterion',
      description: 'This is a test criterion.',
      weight: 0.5,
    };
    const createdCriterion = await createCriterion(newCriterion, token);
    expect(createdCriterion).toHaveProperty('id');
    expect(createdCriterion.name).toBe(newCriterion.name);
    criterionId = createdCriterion.id;
  }, 20000);

  it('should get criteria for a project', async () => {
    const criteria = await getCriteria(projectId, token);
    expect(Array.isArray(criteria)).toBe(true);
    expect(criteria.some((criterion) => criterion.id === criterionId)).toBe(true);
  }, 20000);

  it('should update an existing criterion', async () => {
    const updatedCriterionData = {
      id: criterionId,
      project_id: projectId,
      name: 'Updated Criterion Name',
      description: 'Updated description.',
      weight: 0.75,
    };
    const updatedCriterion = await updateCriterion(updatedCriterionData, token);
    expect(updatedCriterion.name).toBe(updatedCriterionData.name);
  }, 20000);

  it('should delete a criterion', async () => {
    const criterionToDelete = {
      project_id: projectId,
      id: criterionId
    }
    const deletedCriterionId = await deleteCriterion(criterionToDelete, token);
    expect(deletedCriterionId).toBe(criterionId);

    // Verify criterion is deleted
    const criteria = await getCriteria(projectId, token);
    expect(criteria.some((criterion) => criterion.id === criterionId)).toBe(false);
  }, 20000);
});
