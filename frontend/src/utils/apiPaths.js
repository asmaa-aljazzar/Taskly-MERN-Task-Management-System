export const BASE_URL = 'http://localhost:8000';

export const API_PATHS = {
	AUTH: {
		LOGIN: "/api/auth/login", // Done
		FORGOT_PASSWORD: "/api/auth/forgot-password", // Done
		RESET_PASSWORD: (token) => `/api/auth/reset-password/${token}`, // Done
		GET_PROFILE: "/api/auth/profile", // Done
		UPDATE_PROFILE: "/api/auth/profile", // Done
		UPDATE_PROFILE_IMAGE: "/api/auth/profile/image", // Done
		DELETE_PROFILE_IMAGE: "/api/auth/profile/image", // Done
	},
	USER: {
		GET_ALL_USERS: "/api/users",
		GET_USER_BY_ID: (id) => `/api/users/${id}`,
		UPDATE_USER: (id) => `/api/users/${id}`,
		DELETE_USER: (id) => `/api/users/${id}`,
		GET_USER_BY_ROLE: (role) => `/api/users/role/${role}`,
	},
	DASHBOARD: {
		MANAGER: "/api/dashboard/manager",
		HR: "/api/dashboard/hr",
		EMPLOYEE: "/api/dashboard/employee",
	},
	TEAM: {
		GET_ALL_TEAMS: "/api/teams",
		CREATE_TEAM: "/api/teams",
		GET_TEAM_BY_ID: (id) => `/api/teams/${id}`,
		UPDATE_TEAM: (id) => `/api/teams/${id}`,
		DELETE_TEAM: (id) => `/api/teams/${id}`,
	},
	Project: {
		GET_ALL_PROJECTS: "/api/projects",
		CREATE_PROJECT: "/api/projects",
		GET_PROJECT_BY_ID: (id) => `/api/projects/${id}`,
		UPDATE_PROJECT: (id) => `/api/projects/${id}`,
		DELETE_PROJECT: (id) => `/api/projects/${id}`,
	},
	TASK: {
		GET_ALL_TASKS: (projectId) => `/api/${projectId}/tasks`,
		CREATE_TASK: (projectId) => `/api/project/${projectId}/tasks`,
		GET_TASK_BY_ID: (projectId, taskId) => `/api/project/${projectId}/tasks/${taskId}`,
		UPDATE_TASK: (projectId, taskId) => `/api/project/${projectId}/tasks/${taskId}`,
		DELETE_TASK: (projectId, taskId) => `/api/project/${projectId}/tasks/${taskId}`,
	},
};