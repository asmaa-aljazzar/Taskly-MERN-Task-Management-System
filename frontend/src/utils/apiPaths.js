export const BASE_URL = 'http://localhost:8000';

export const API_PATHS = {
	AUTH: {
		LOGIN: "/api/auth/login",
		FORGOT_PASSWORD: "/api/auth/forgot-password",
		RESET_PASSWORD: (token) => `/api/auth/reset-password/${token}`,
		GET_PROFILE: "/api/auth/profile",
		UPDATE_PROFILE: "/api/auth/profile",
		UPDATE_PROFILE_IMAGE: "/api/auth/profile/image",
		DELETE_PROFILE_IMAGE: "/api/auth/profile/image",
	},
	USER: {},
};