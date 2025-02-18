import { config } from '../config';
import { authService } from './auth';

export const aiService = {
  async generateCriteria(concept) {
    try {
      const { session } = await authService.getSession();
      const response = await fetch(`${config.API_URL}/ai/generate-criteria`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ concept })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate criteria');
      }

      return response.json();
    } catch (error) {
      console.error('Generate Criteria Error:', error);
      throw error;
    }
  },

  async evaluateAlternative(alternative, criteria) {
    try {
      const { session } = await authService.getSession();
      const response = await fetch(`${config.API_URL}/ai/evaluate-alternative`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alternative, criteria })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to evaluate alternative');
      }

      return response.json();
    } catch (error) {
      console.error('Evaluate Alternative Error:', error);
      throw error;
    }
  },

  async predictScores(alternative, newCriteria, existingCriteria) {
    try {
      const { session } = await authService.getSession();
      const response = await fetch(`${config.API_URL}/ai/predict-scores`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alternative, newCriteria, existingCriteria })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to predict scores');
      }

      return response.json();
    } catch (error) {
      console.error('Predict Scores Error:', error);
      throw error;
    }
  }
};
