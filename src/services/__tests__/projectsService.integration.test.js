// projectsService.integration.test.js
import { projectsService } from '../projectsService';
import { getSessionToken } from '../../utils/getSessionToken';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

describe('Projects Service Integration Tests', () => {
  let projectId;
  let token;

  beforeAll(async () => {
    token = await getSessionToken(ADMIN_EMAIL, ADMIN_PASSWORD);
  }, 20000);

  afterAll(async () => {
    // Clean up: Delete the test project
    if (projectId) {
      await deleteProject(projectId, token);
    }
  });

  it('should create a new project', async () => {
    const newProject = {
      name: 'Test Project',
      description: 'This is a test project.',
    };
    const createdProject = await projectsService.create(newProject, token);
    expect(createdProject).toHaveProperty('id');
    expect(createdProject.name).toBe(newProject.name);
    projectId = createdProject.id;
  }, 20000);

  it('should get projects', async () => {
    const projects = await getProjects(token);
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.some((project) => project.id === projectId)).toBe(true);
  }, 20000);

  it('should get a specific project', async () => {
    const project = await getProject(projectId, token);
    expect(project).toHaveProperty('id');
    expect(project.id).toBe(projectId);
  }, 20000);

  it('should update an existing project', async () => {
    const updatedProjectData = {
      id: projectId,
      name: 'Updated Project Name',
      description: 'Updated description.',
    };
    const updatedProject = await updateProject(updatedProjectData, token);
    expect(updatedProject.name).toBe(updatedProjectData.name);
  }, 20000);

  it('should delete a project', async () => {
    const deletedProjectId = await deleteProject(projectId, token);
    expect(deletedProjectId).toBe(projectId);

    // Verify project is deleted
    const projects = await getProjects(token);
    expect(projects.some((project) => project.id === projectId)).toBe(false);
  }, 20000);
});
