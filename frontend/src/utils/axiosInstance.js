import axios from "axios";
import { BASE_URL } from './apiPaths'

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,  // How long to wait (10 seconds)
	headers: {
		"Content-Type": "application/json", // Tell server: "I'm sending JSON"
		Accept: "application/json", // Tell server: "Send me back JSON"
	},
});

// Request Interceptor
//* Before any package leaves:
//* - Add shipping label (Add token)
//* - Check address (Validate)
//* - Wrap in bubble wrap (Add headers)
//* - THEN send the package
//? like a security checkpoint that every API request must go through before leaving app.
//* Something that catches requests before they leave
axiosInstance.interceptors.request.use(
	// SUCCESS FUNCTION - Runs before every request
	(config) => {

		// 1. Get token from localStorage: //* localStorage = "Browser memory"
		const accessToken = localStorage.getItem("token");

		// 2. If token exists, add it to headers
		if (accessToken)
			config.headers.Authorization = `Bearer ${accessToken}`;

		// 3. Return the modified config
		return config;
	},
	// ERROR FUNCTION - If something goes wrong
	(error) => {
		return Promise.reject(error);
	}
);

// Response Interceptor
axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle common errors globally
		// Check if this is the login endpoint
		const isLoginRequest = error.config?.url?.includes('/api/auth/login');

		// Handle common errors globally
		if (error.response) {
			// DON'T redirect for login failures
			if (error.response.status === 401 && !isLoginRequest) {
				// Only redirect for NON-login 401 errors
				localStorage.removeItem('token');
				localStorage.removeItem('role');
				localStorage.removeItem('user');
				window.location.href = '/login';
			} else if (error.response.status === 500) {
				console.error("Server error. Please try again later.");
			}
		} else if (error.code === "ECONNABORTED") {
			console.error("Request timeout. Please try again.")
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;



