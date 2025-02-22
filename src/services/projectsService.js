import { config } from '../config';
import { authService } from './auth';

export const projectsService = {
  async getAll() {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] getAll called");
      }
      // Get the session and extract the access token
      const { session } = await authService.getSession();
      const accessToken = session.access_token || localStorage.getItem("accessToken");
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch projects');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] getAll result:", result);
      }
      return result;
    } catch (error) {
      console.error('Get Projects Error:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] getById called with:", id);
      }
      const { session } = await authService.getSession();
      const accessToken = session.access_token || localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch project');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] getById result:", result);
      }
      return result;
    } catch (error) {
      console.error('Get Project Error:', error);
      throw error;
    }
  },

  async create(projectData) {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] create called with:", projectData);
      }
      const { session } = await authService.getSession();
      const accessToken = session.access_token || localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] create result:", result);
      }
      return result;
    } catch (error) {
      console.error('Create Project Error:', error);
      throw error;
    }
  },

  async update(id, projectData) {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] update called with:", id, projectData);
      }
      const { session } = await authService.getSession();
      const accessToken = session.access_token || localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] update result:", result);
      }
      return result;
    } catch (error) {
      console.error('Update Project Error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] delete called with:", id);
      }
      const { session } = await authService.getSession();
      const accessToken = session.access_token || localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] delete result:", result);
      }
      return result;
    } catch (error) {
      console.error('Delete Project Error:', error);
      throw error;
    }
  }
};
