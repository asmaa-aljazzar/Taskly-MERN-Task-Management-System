import AuthLayout from "../../components/layouts/AuthLayout";
import UI_IMG from "../../assests/images/auth/reset-password-img.jpg";
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Input from '../../components/inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const ResetPassword = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showTips, setShowTips] = useState(false);
	
	const { token } = useParams();
	const navigate = useNavigate();

	// Check if token exists
	if (!token) {
		return (
			<AuthLayout uiImage={UI_IMG}>
				<div className="lg:w-[70%] flex flex-col justify-center">
					<h3 className="text-xl font-semibold text-red-600">Invalid Reset Link</h3>
					<p className="text-sm text-slate-700 mt-2">
						The reset link is invalid or missing.
					</p>
					<Link to="/forgot-password" className="btn-primary w-full mt-6 text-center">
						Request New Link
					</Link>
				</div>
			</AuthLayout>
		);
	}

	const requirements = [
		{ label: "At least 8 characters", met: password.length >= 8 },
		{ label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
		{ label: "Contains lowercase letter", met: /[a-z]/.test(password) },
		{ label: "Contains a number", met: /[0-9]/.test(password) },
			{ label: "Contains a special character (@$!%*?&.#)", met: /[@$!%*?&.#]/.test(password) },
	];

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setError(null);
		
		if (!password) {
			setError("Password cannot be empty");
			return;
		}
		
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		
		setIsLoading(true);

		try {
			const resetUrl = API_PATHS.AUTH.RESET_PASSWORD(token);
			console.log('Reset URL:', resetUrl);
			
			const response = await axiosInstance.put(resetUrl, {
				password
			});
			
			console.log('Reset response:', response.data);
			setSuccess(true);
			
			// Redirect to login after 3 seconds
			setTimeout(() => {
				navigate('/login');
			}, 3000);
			
		} catch (error) {
			console.error('Reset error:', error.response?.data || error.message);
			if (error.response?.data?.message) {
				setError(error.response.data.message);
			} else {
				setError("Something went wrong. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout uiImage={UI_IMG}>
			<div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
				<h3 className="text-xl font-semibold text-[#484bf2]">Reset your password</h3>
				<p className="text-sm text-slate-700 mt-1.25 mb-0">Enter a new password.</p>

				{success ? (
					<div className="mt-6">
						<div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
							Password reset successful! Redirecting to login...
						</div>
						<Link to="/login" className="btn-primary w-full mt-4 text-center block">
							Go to Login
						</Link>
					</div>
				) : (
					<form onSubmit={handleResetPassword} className="mt-6">
						<Input
							value={password}
							onChange={({ target }) => setPassword(target.value)}
							label="New Password"
							placeholder="Enter new password"
							type="password"
							onFocus={() => setShowTips(true)}
							onBlur={() => setShowTips(false)}
						/>

						<Input
							value={confirmPassword}
							onChange={({ target }) => setConfirmPassword(target.value)}
							label="Confirm Password"
							placeholder="Confirm your new password"
							type="password"
						/>

						{showTips && (
							<div className="mt-2 space-y-1">
								{requirements.map((req, index) => (
									<p key={index} className={`text-xs ${req.met ? 'text-green-600' : 'text-yellow-600'}`}>
										{req.met ? '✓' : '○'} {req.label}
									</p>
								))}
							</div>
						)}

						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md mt-4">
								{error}
							</div>
						)}

						<button 
							type="submit" 
							className="btn-primary w-full mt-6"
							disabled={isLoading}
						>
							{isLoading ? "RESETTING..." : "RESET PASSWORD"}
						</button>
					</form>
				)}
			</div>
		</AuthLayout>
	);
};

export default ResetPassword;