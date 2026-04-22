import { useState } from 'react';
import UI_Img from '../../assests/images/auth/forgot-password-img.svg';
import AuthLayout from '../../components/layouts/AuthLayout';
import Input from '../../components/inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleForgotPassword = async (e) => {
		e.preventDefault();
		setError(null);
		
		if (!email) {
			setError("Email address cannot be empty.");
			return;
		}
		
		setIsLoading(true);

		try {
			await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, {
				email
			});
			
			setSuccess(true);
			
		} catch (error) {
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
		<AuthLayout uiImage={UI_Img}>
			<div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
				<h3 className="text-xl font-semibold text-[#484bf2]">Find your account</h3>
				<p className="text-sm text-slate-700 mt-1.25 mb-0">Enter your email address.</p>

				<form onSubmit={handleForgotPassword} className="mt-6">
					<Input
						value={email}
						onChange={({target}) => setEmail(target.value)} 
						label="Email Address"
						placeholder="john@example.com"
						type="email"
					/>

					{error && (
						<p className="text-red-500 text-sm mt-2">{error}</p>
					)}
					
					{success && (
						<div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-md mt-4">
							Reset link sent! Please check your email.
						</div>
					)}

					<button 
						type="submit" 
						className="btn-primary w-full mt-6"
						disabled={isLoading}
					>
						{isLoading ? "SENDING..." : "SEND RESET LINK"}
					</button>
					
					<p className="text-center text-sm text-slate-600 mt-6">
						Remember your password?{' '}
						<Link className="text-primary font-medium hover:underline" to="/login">
							Back to Login
						</Link>
					</p>
				</form>
			</div>
		</AuthLayout>
	);
};

export default ForgotPassword;