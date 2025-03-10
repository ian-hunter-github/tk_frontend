import { config } from '../config';
import { authService } from './authService';

export const aiService = {
  async generateCriteria(concept) {
    try {
      if (config.DEBUG) {
        console.log("[aiService] generateCriteria called with:", concept);
      }
      const response = await fetch(`${config.NETLIFY_FUNC_URL}/ai/generate-criteria`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ concept })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate criteria');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[aiService] generateCriteria result:", result);
      }
      return result;
    } catch (error) {
      console.error('Generate Criteria Error:', error);
      throw error;
    }
  },

  async evaluateAlternative(alternative, criteria) {
    try {
      if (config.DEBUG) {
        console.log("[aiService] evaluateAlternative called with:", alternative, criteria);
      }
      const response = await fetch(`${config.NETLIFY_FUNC_URL}/ai/evaluate-alternative`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alternative, criteria })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to evaluate alternative');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[aiService] evaluateAlternative result:", result);
      }
      return result;
    } catch (error) {
      console.error('Evaluate Alternative Error:', error);
      throw error;
    }
  },

  async predictScores(alternative, newCriteria, existingCriteria) {
    try {
      if (config.DEBUG) {
        console.log("[aiService] predictScores called with:", alternative, newCriteria, existingCriteria);
      }
      const response = await fetch(`${config.NETLIFY_FUNC_URL}/ai/predict-scores`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alternative, newCriteria, existingCriteria })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to predict scores');
      }
      
      const result = await response.json();
      if (config.DEBUG) {
        console.log("[aiService] predictScores result:", result);
      }
      return result;
    } catch (error) {
      console.error('Predict Scores Error:', error);
      throw error;
    }
  }
};
