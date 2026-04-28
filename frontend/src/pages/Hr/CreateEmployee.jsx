import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const Field = ({ label, error, children }) => (
	<div className="flex flex-col gap-1.5">
		<label className="text-sm font-medium text-gray-700">{label}</label>
		{children}
		{error && <p className="text-xs text-rose-500">{error}</p>}
	</div>
);

const inputClass = (hasError) =>
	`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${hasError
		? 'border-rose-400 focus:ring-rose-200'
		: 'border-gray-200 focus:ring-[#484bf2]/20 focus:border-[#484bf2]'
	}`;

const CreateEmployee = () => {
	const navigate = useNavigate();

	const [form, setForm] = useState({
		firstName:   '',
		lastName:    '',
		email:       '',
		password:    '',
		phoneNumber: '',
		role:        'employee',
		hireDate:    '',
	});

	const [errors,   setErrors]   = useState({});
	const [loading,  setLoading]  = useState(false);
	const [showPass, setShowPass] = useState(false);

	const set = (field) => (e) => {
		setForm(prev => ({ ...prev, [field]: e.target.value }));
		// Clear field error on change
		if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
	};

	const validate = () => {
		const e = {};
		if (!form.firstName.trim()) e.firstName = 'First name is required';
		if (!form.lastName.trim())  e.lastName  = 'Last name is required';
		if (!form.email.trim())     e.email     = 'Email is required';
		else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(form.email))
			e.email = 'Invalid email format';
		if (!form.password) e.password = 'Password is required';
		else if (form.password.length < 6)
			e.password = 'Password must be at least 6 characters';
		if (!form.hireDate) e.hireDate = 'Hire date is required';
		else if (new Date(form.hireDate) > new Date())
			e.hireDate = "Hire date can't be in the future";
		return e;
	};

	const handleSubmit = async () => {
		const e = validate();
		if (Object.keys(e).length > 0) {
			setErrors(e);
			// Build a readable list of what's missing
			const missing = [];
			if (e.firstName)   missing.push('first name');
			if (e.lastName)    missing.push('last name');
			if (e.email)       missing.push('valid email');
			if (e.password)    missing.push('password (min 6 chars)');
			if (e.hireDate)    missing.push('hire date');
			toast.error(`Please fix: ${missing.join(', ')}`);
			return;
		}

		setErrors({});
		setLoading(true);

		try {
			const payload = {
				fullName:    `${form.firstName.trim()} ${form.lastName.trim()}`,
				email:       form.email.trim(),
				password:    form.password,
				phoneNumber: form.phoneNumber.trim(),
				role:        form.role,
				hireDate:    form.hireDate,
			};

			await axiosInstance.post(API_PATHS.USER.CREATE_USER, payload);
			toast.success(`${payload.fullName} created successfully!`);
			navigate('/hr/employees');
		} catch (err) {
			const msg = err.response?.data?.message;

			if (msg?.toLowerCase().includes('email') && msg?.toLowerCase().includes('exist')) {
				toast.error('This email is already registered. Please use a different email.');
				setErrors(prev => ({ ...prev, email: 'Email already exists' }));
			} else if (msg?.toLowerCase().includes('email')) {
				toast.error('Invalid email address.');
				setErrors(prev => ({ ...prev, email: msg }));
			} else if (msg?.toLowerCase().includes('password')) {
				toast.error('Password does not meet requirements.');
				setErrors(prev => ({ ...prev, password: msg }));
			} else {
				toast.error(msg ?? 'Failed to create employee. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const today = new Date().toISOString().split('T')[0];

	return (
		<DashboardLayout activeMenuItem="Create Employee">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">

				<div className="mb-8 flex items-center gap-4">
					<button
						onClick={() => navigate('/hr/employees')}
						className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Create Employee</h1>
						<p className="text-sm text-gray-500 mt-1">Add a new member to your organization</p>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-2xl mx-auto">
					<div className="space-y-6">

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Field label="First Name *" error={errors.firstName}>
								<input
									type="text"
									placeholder="John"
									value={form.firstName}
									onChange={set('firstName')}
									className={inputClass(!!errors.firstName)}
								/>
							</Field>
							<Field label="Last Name *" error={errors.lastName}>
								<input
									type="text"
									placeholder="Doe"
									value={form.lastName}
									onChange={set('lastName')}
									className={inputClass(!!errors.lastName)}
								/>
							</Field>
						</div>

						<Field label="Email Address *" error={errors.email}>
							<input
								type="email"
								placeholder="john.doe@company.com"
								value={form.email}
								onChange={set('email')}
								className={inputClass(!!errors.email)}
							/>
						</Field>

						<Field label="Password *" error={errors.password}>
							<div className="relative">
								<input
									type={showPass ? 'text' : 'password'}
									placeholder="Min 6 characters"
									value={form.password}
									onChange={set('password')}
									className={inputClass(!!errors.password)}
								/>
								<button
									type="button"
									onClick={() => setShowPass(p => !p)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPass ? (
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
										</svg>
									) : (
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
						</Field>

						<Field label="Phone Number (optional)" error={errors.phoneNumber}>
							<input
								type="tel"
								placeholder="+962 7X XXX XXXX"
								value={form.phoneNumber}
								onChange={set('phoneNumber')}
								className={inputClass(!!errors.phoneNumber)}
							/>
						</Field>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Field label="Role" error={errors.role}>
								<select
									value={form.role}
									onChange={set('role')}
									className={inputClass(!!errors.role)}
								>
									<option value="employee">Employee</option>
									<option value="manager">Manager</option>
									<option value="hr">HR</option>
								</select>
							</Field>
							<Field label="Hire Date *" error={errors.hireDate}>
								<input
									type="date"
									max={today}
									value={form.hireDate}
									onChange={set('hireDate')}
									className={inputClass(!!errors.hireDate)}
								/>
							</Field>
						</div>

						{(form.firstName || form.lastName) && (
							<div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
								Full name will be saved as:{' '}
								<span className="font-semibold text-gray-800">
									{`${form.firstName} ${form.lastName}`.trim()}
								</span>
							</div>
						)}

					</div>

					<div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
						<button
							onClick={handleSubmit}
							disabled={loading}
							className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
						>
							{loading ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Creating...
								</>
							) : (
								<>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									Create Employee
								</>
							)}
						</button>
						<button
							onClick={() => navigate('/hr/employees')}
							className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default CreateEmployee;