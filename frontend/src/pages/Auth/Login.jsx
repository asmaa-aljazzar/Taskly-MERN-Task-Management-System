import { useContext, useState } from "react"
import AuthLayout from "../../components/layouts/AuthLayout"
import { useNavigate } from "react-router-dom";
import UI_IMG from "../../assests/images/auth/login-img.jpg"
import Input from "../../components/inputs/Input";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";
import toast from "react-hot-toast";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const { updateUser } = useContext(UserContext);

	const navigate = useNavigate();

	// Handle Login Form Submit
	// STOP the page from refreshing

	// Now I can do my own thing (API call, validation, etc.)
	const handleLogin = async (e) => {
		e.preventDefault();


		if (!email) {
			setError("Email address cannot be empty");
			return;
		}

		if (!password) {
			setError("Password cannot be empty");
			return;
		}

		setError(null);

		// Login API call
		try {
			// Send login request to backend API
			const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
				email,
				password
			});

			// Extract token and role from backend response
			const { token, user } = response.data;

			const role = user.role;

		
			if (token) {
				localStorage.setItem("token", token);
				updateUser(user, token);

				// if (role)
				// 	localStorage.setItem("role", role);

				//! DEBUG: token to console
				// console.log('token => ' + token + 'localStorage token=> ' + localStorage.getItem('token'));

				toast.success(`Welcome back, ${user.fullName}!`);

				// Redirect based on role
				if (role === 'hr') {
					navigate('/hr/dashboard')
				} else if (role === 'manager') {
					navigate('/manager/dashboard')
				} else if (role === 'employee') {
					navigate('/employee/dashboard')
				}

			}
		} catch (error) {
			if (error.response && error.response.data.message) {
				setError(error.response && error.response.data.message);
			} else {
				setError("Something went wrong, Please try again.");
				toast.error("Something went wrong, Please try again.");
			}
		}
	}

	return (
		<AuthLayout uiImage={UI_IMG}>
			<div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
				<h3 className="text-xl font-semibold text-[#484bf2]">Welcom Back</h3>
				<p className="text-sm text-slate-700 mt-1.25 mb-0">Please enter your details to log in</p>

				<form onSubmit={handleLogin}>
					{/* Email */}
					{/*? { } (outer)	Tells JSX "this is JavaScript, not HTML" */}
					{/* { } (inner)	Destructuring - extracting target from the event object */}
					{/* Same as: */}
					{/* onChange={(event) => setEmail(event.target.value)} */}
					<Input
						value={email}
						onChange={({ target }) => setEmail(target.value)}
						label="Email Address"
						placeholder="john@example.com"
						type="email"
					/>

					<Input
						value={password}
						onChange={({ target }) => setPassword(target.value)}
						label="Password"
						placeholder="Enter your password"
						type="password"
					/>

					{error && (<p className="text-red-500">{error}</p>)}

					<button type="submit" className="btn-primary">LOGIN</button>

					<Link className="font-medium text-primary hover:underline" to="/forgot-password">
						Forgot Password? </Link>
				</form>
			</div>
		</AuthLayout>
	)
}

export default Login