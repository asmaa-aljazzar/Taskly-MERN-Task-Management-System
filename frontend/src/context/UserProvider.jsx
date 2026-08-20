import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from "../utils/apiPaths";

const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const clearUser = () => {
		setUser(null);
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		localStorage.removeItem("user");
	};

	const updateUser = (userData, token) => {
		setUser(userData);
		if (token) {
			localStorage.setItem("token", token);
			localStorage.setItem("role", userData?.role || '');
			localStorage.setItem("user", JSON.stringify(userData));
		}
		setLoading(false);
	};

	useEffect(() => {
		const fetchUser = async () => {
			const accessToken = localStorage.getItem("token");

			if (!accessToken) {
				setLoading(false);
				return;
			}

			try {
				const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
				setUser(response.data.user);
				localStorage.setItem("role", response.data.user.role);
				localStorage.setItem("user", JSON.stringify(response.data.user));
			} catch (error) {
				console.error("User not authenticated", error);
				clearUser();
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser, loading, updateUser, clearUser }}> {/* ← added setUser */}
			{children}
		</UserContext.Provider>
	);
};

export default UserProvider;
