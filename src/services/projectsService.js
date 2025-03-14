import { config } from '../config';
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export const projectsService = {
  async getAll() {
    try {
      if (config.DEBUG) console.log("[projectsService] getAll called");

      const token = getCookie("sb-auth-token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects`, {
        credentials: 'include',
        headers: headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch projects");
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] getAll result:", result);
      }
      return result;
    } catch (error) {
      console.error("Get Projects Error:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] getById called with:", id);
      }

      const token = getCookie("sb-auth-token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
        credentials: 'include',
        headers: headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch project");
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] getById result:", result);
      }
      return result;
    } catch (error) {
      console.error("Get Project Error:", error);
      throw error;
    }
  },

  async create(projectData) {
    try {

      if (config.DEBUG) {
        console.log("[projectsService] create called with:", projectData);
      }

      const token = getCookie("sb-auth-token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects`, {
        method: "POST",
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({title: projectData.title, description: projectData.description}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create project");
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] create result:", result);
      }
      return result;
    } catch (error) {
      console.error("Create Project Error:", error);
      throw error;
    }
  },

  async update(id, projectData) {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] update called with:", id, projectData);
      }

      const token = getCookie("sb-auth-token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update project");
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] update result:", result);
      }
      return result;
    } catch (error) {
      console.error("Update Project Error:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      if (config.DEBUG) {
        console.log("[projectsService] delete called with:", id);
      }
      const token = getCookie("sb-auth-token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${config.NETLIFY_FUNC_URL}/projects/${id}`, {
        credentials: 'include',
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project");
      }

      const result = await response.json();
      if (config.DEBUG) {
        console.log("[projectsService] delete result:", result);
      }
      return result;
    } catch (error) {
      console.error("Delete Project Error:", error);
      throw error;
    }
  },
};
