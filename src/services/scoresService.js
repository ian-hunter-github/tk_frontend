import { config } from '../config';
import { getCookie } from './projectsService';

export const scoresService = {
  async update(criteriaId, choiceId, score) {
    try {
      if (config.DEBUG) {
        console.log("[scoresService] update called with:", { criteriaId, choiceId, score });
      }

      const token = getCookie("sb-auth-token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/scores`, {
        method: 'PUT',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({
          criteria_id: criteriaId,
          choice_id: choiceId,
          score,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update score");
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[scoresService] update result:", result);
      }
      return result;
    } catch (error) {
      console.error("Update Score Error:", error);
      throw error;
    }
  }
};
