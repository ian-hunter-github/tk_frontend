import { config } from '../config';

export const choicesService = {
  async getAll(projectId) {
    try {
      if (config.DEBUG) {
        console.log("[choicesService] getAll called with projectId:", projectId);
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/choices?projectId=${projectId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch choices');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[choicesService] getAll result:", result);
      }
      return result;
    } catch (error) {
      console.error('Get Choices Error:', error);
      throw error;
    }
  },

  async create(projectId, choicesList) {
    try {
      if (config.DEBUG) {
        console.log("[choicesService] create called with:", projectId, choicesList);
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/choices`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          choices: choicesList
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create choices');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[choicesService] create result:", result);
      }
      return result;
    } catch (error) {
      console.error('Create Choices Error:', error);
      throw error;
    }
  },

  async update(id, choiceData) {
    try {
      if (config.DEBUG) {
        console.log("[choicesService] update called with:", id, choiceData);
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/choices/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(choiceData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update choice');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[choicesService] update result:", result);
      }
      return result;
    } catch (error) {
      console.error('Update Choice Error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      if (config.DEBUG) {
        console.log("[choicesService] delete called with:", id);
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/choices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete choice');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[choicesService] delete result:", result);
      }
      return result;
    } catch (error) {
      console.error('Delete Choice Error:', error);
      throw error;
    }
  }
};
