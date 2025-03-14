import { config } from '../config';

export const criteriaService = {
  async getAll(projectId) {
    try {
      if (config.DEBUG) {
        console.log("[criteriaService] getAll called with projectId:", projectId);
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/criteria?projectId=${projectId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch criteria');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[criteriaService] getAll result:", result);
      }
      return result;
    } catch (error) {
      console.error('Get Criteria Error:', error);
      throw error;
    }
  },

  async create(projectId, criteriaList) {
    try {
      if (config.DEBUG) {
        console.log("[criteriaService] create called with:", projectId, criteriaList);
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/criteria`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          criteria: criteriaList
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create criteria');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[criteriaService] create result:", result);
      }
      return result;
    } catch (error) {
      console.error('Create Criteria Error:', error);
      throw error;
    }
  },

  async update(id, criterionData) {
    try {
      if (config.DEBUG) {
        console.log("[criteriaService] update called with:", id, criterionData);
      }
      const response = await fetch(`${config.NETLIFY_FUNC_URL}/criteria/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(criterionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update criterion');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[criteriaService] update result:", result);
      }
      return result;
    } catch (error) {
      console.error('Update Criterion Error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      if (config.DEBUG) {
        console.log("[criteriaService] delete called with:", id);
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/criteria/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete criterion');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[criteriaService] delete result:", result);
      }
      return result;
    } catch (error) {
      console.error('Delete Criterion Error:', error);
      throw error;
    }
  }
};
