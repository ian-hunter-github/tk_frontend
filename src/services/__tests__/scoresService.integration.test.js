// scoresService.integration.test.js
import {
  createScore,
  getScores,
  updateScore,
  deleteScore,
} from '../scoresService';
import { getSessionToken } from '../../utils/getSessionToken';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

describe('Scores Service Integration Tests', () => {
  let projectId;
  let choiceId;
  let criterionId;
  let scoreId;
  let token;

  beforeAll(async () => {
    token = await getSessionToken(ADMIN_EMAIL, ADMIN_PASSWORD);
    // Create a project, choice and criterion to use for testing
    const projectResponse = await fetch(
      'http://localhost:8888/.netlify/functions/projects',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'Test Project for Scores' }),
      }
    );
    const projectData = await projectResponse.json();
    projectId = projectData.id;

    const choiceResponse = await fetch(
      'http://localhost:8888/.netlify/functions/choices',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          name: 'Test Choice',
          description: 'Test Choice Description',
        }),
      }
    );
    const choiceData = await choiceResponse.json();
    choiceId = choiceData.id;

    const criterionResponse = await fetch(
      'http://localhost:8888/.netlify/functions/criteria',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          name: 'Test Criterion',
          description: 'Test Criterion Description',
          weight: 0.5
        }),
      }
    );
    const criterionData = await criterionResponse.json();
    criterionId = criterionData.id;
  }, 30000);

  afterAll(async () => {
    // Clean up: Delete the test project, choice and criterion
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

  it('should create a new score', async () => {
    const newScore = {
      project_id: projectId,
      choice_id: choiceId,
      criterion_id: criterionId,
      score: 7,
    };
    const createdScore = await createScore(newScore, token);
    expect(createdScore).toHaveProperty('id');
    expect(createdScore.score).toBe(newScore.score);
    scoreId = createdScore.id;
  }, 20000);

  it('should get scores for a project', async () => {
    const scores = await getScores(projectId, token);
    expect(Array.isArray(scores)).toBe(true);
    expect(
      scores.some(
        (score) =>
          score.choice_id === choiceId && score.criterion_id === criterionId
      )
    ).toBe(true);
  }, 20000);

  it('should update an existing score', async () => {
    const updatedScoreData = {
      id: scoreId,
      project_id: projectId,
      choice_id: choiceId,
      criterion_id: criterionId,
      score: 9,
    };
    const updatedScore = await updateScore(updatedScoreData, token);
    expect(updatedScore.score).toBe(updatedScoreData.score);
  }, 20000);

  it('should delete a score', async () => {
    const scoreToDelete = {
      project_id: projectId,
      choice_id: choiceId,
      criterion_id: criterionId,
      id: scoreId
    }
    const deletedScoreId = await deleteScore(scoreToDelete, token);
    expect(deletedScoreId).toBe(scoreId);

    // Verify score is deleted
    const scores = await getScores(projectId, token);
    expect(scores.some((score) => score.id === scoreId)).toBe(false);
  }, 20000);
});
