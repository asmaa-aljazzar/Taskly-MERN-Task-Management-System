import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export const useUserAuth = () => {
	const { user, loading, clearUser } = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && !user) {
			navigate('/login');
		}
	}, [user, loading, clearUser, navigate]);
	return { user, loading, clearUser };
}

