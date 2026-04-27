import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useUserAuth } from '../../hooks/useUserAuth';

const Field = ({ label, error, required, children }) => (
	<div className="flex flex-col gap-1.5">
		<label className="text-sm font-medium text-gray-700">
			{label}
			{required && <span className="text-rose-500 ml-0.5">*</span>}
		</label>
		{children}
		{error && <p className="text-xs text-rose-500">{error}</p>}
	</div>
);

const inputClass = (hasError) =>
	`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
		hasError
			? 'border-rose-400 focus:ring-rose-200'
			: 'border-gray-200 focus:ring-[#484bf2]/20 focus:border-[#484bf2]'
	}`;

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="Employees">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const minHireDate = new Date();
minHireDate.setFullYear(today.getFullYear() - 50);
const minHireDateStr = minHireDate.toISOString().split('T')[0];

const EditEmployee = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user: currentUser } = useUserAuth();
	const isSelf = currentUser?._id === id;

	const [form, setForm] = useState({
		firstName:   '',
		lastName:    '',
		email:       '',
		phoneNumber: '',
		role:        'employee',
		hireDate:    '',
	});

	// Snapshot of the data as it was when the page loaded — used to detect changes
	const [original, setOriginal] = useState(null);

	const [errors, setErrors]               = useState({});
	const [loading, setLoading]             = useState(true);
	const [saving, setSaving]               = useState(false);
	const [deleting, setDeleting]           = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [originalRole, setOriginalRole]   = useState('');

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.USER.GET_USER_BY_ID(id));
				const u = res.data.user;

				const parts     = (u.fullName ?? '').trim().split(' ');
				const firstName = parts[0] ?? '';
				const lastName  = parts.slice(1).join(' ');

				const hireDate = u.hireDate
					? new Date(u.hireDate).toISOString().split('T')[0]
					: '';

				const loaded = {
					firstName,
					lastName,
					email:       u.email       ?? '',
					phoneNumber: u.phoneNumber ?? '',
					role:        u.role        ?? 'employee',
					hireDate,
				};

				setForm(loaded);
				setOriginal(loaded);
				setOriginalRole(u.role ?? 'employee');
			} catch {
				toast.error('Failed to load user data.');
				navigate('/hr/employees');
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [id, navigate]);

	const hasChanges = original
		? Object.keys(form).some((key) => form[key] !== original[key])
		: false;

	const set = (field) => (e) =>
		setForm(prev => ({ ...prev, [field]: e.target.value }));

	const validate = () => {
		const e = {};
		if (!form.firstName.trim()) e.firstName = 'First name is required';
		if (!form.lastName.trim())  e.lastName  = 'Last name is required';
		if (!form.email.trim())     e.email     = 'Email is required';
		else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(form.email))
			                        e.email     = 'Invalid email format';
		if (!form.hireDate)         e.hireDate  = 'Hire date is required';
		else if (new Date(form.hireDate) > today)
			                        e.hireDate  = "Hire date can't be in the future";
		else if (new Date(form.hireDate) < minHireDate)
			                        e.hireDate  = "Hire date can't be more than 50 years in the past";
		return e;
	};

	const handleSave = async () => {
		if (!hasChanges) {
			toast("No changes were made.", { icon: 'ℹ️' });
			return;
		}

		const e = validate();
		if (Object.keys(e).length > 0) {
			setErrors(e);
			return;
		}
		setErrors({});
		setSaving(true);

		try {
			const payload = {
				fullName:    `${form.firstName.trim()} ${form.lastName.trim()}`,
				email:       form.email.trim(),
				phoneNumber: form.phoneNumber.trim(),
				role:        form.role,
				hireDate:    form.hireDate,
			};

			const res = await axiosInstance.put(API_PATHS.USER.UPDATE_USER(id), payload);
			toast.success(res.data.message ?? 'User updated successfully!');
			navigate('/hr/employees');
		} catch (err) {
			const msg = err.response?.data?.message ?? 'Failed to update user.';
			toast.error(msg);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			await axiosInstance.delete(API_PATHS.USER.DELETE_USER(id));
			toast.success('User deleted successfully.');
			navigate('/hr/employees', { replace: true });
		} catch (err) {
			const msg = err.response?.data?.message ?? 'Failed to delete user.';
			toast.error(msg);
			setDeleting(false);
			setConfirmDelete(false);
		}
	};

	const isHr = originalRole === 'hr';

	if (loading) return <LoadingSpinner />;

	return (
		<DashboardLayout activeMenuItem="Employees">
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
						<h1 className="text-2xl font-bold text-gray-800">Edit Employee</h1>
						<p className="text-sm text-gray-500 mt-1">
							Update information for{' '}
							<span className="font-medium text-gray-700">
								{`${form.firstName} ${form.lastName}`.trim()}
							</span>
						</p>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-2xl mx-auto">
					<div className="space-y-6">

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Field label="First Name" error={errors.firstName} required>
								<input
									type="text"
									placeholder="John"
									value={form.firstName}
									onChange={set('firstName')}
									className={inputClass(errors.firstName)}
								/>
							</Field>
							<Field label="Last Name" error={errors.lastName} required>
								<input
									type="text"
									placeholder="Doe"
									value={form.lastName}
									onChange={set('lastName')}
									className={inputClass(errors.lastName)}
								/>
							</Field>
						</div>

						<Field label="Email Address" error={errors.email} required>
							<input
								type="email"
								placeholder="john.doe@company.com"
								value={form.email}
								onChange={set('email')}
								className={inputClass(errors.email)}
							/>
						</Field>

						<Field label="Phone Number" error={errors.phoneNumber}>
							<input
								type="tel"
								placeholder="+962 7X XXX XXXX"
								value={form.phoneNumber}
								onChange={set('phoneNumber')}
								className={inputClass(errors.phoneNumber)}
							/>
						</Field>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Field label="Role" error={errors.role} required>
								<select
									value={form.role}
									onChange={set('role')}
									disabled={isHr}
									className={`${inputClass(errors.role)} ${isHr ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
								>
									<option value="employee">Employee</option>
									<option value="manager">Manager</option>
									<option value="hr">HR</option>
								</select>
								{isHr && (
									<p className="text-xs text-gray-400 mt-1">HR role cannot be changed</p>
								)}
							</Field>
							<Field label="Hire Date" error={errors.hireDate} required>
								<input
									type="date"
									min={minHireDateStr}
									max={todayStr}
									value={form.hireDate}
									onChange={set('hireDate')}
									className={inputClass(errors.hireDate)}
								/>
							</Field>
						</div>

						{/* Warning banner when editing a manager — cascade reminder */}
						{originalRole === 'manager' && !isSelf && (
							<div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
								<svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
										d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
								</svg>
								<p className="text-xs text-amber-700">
									<span className="font-semibold">Deleting this manager</span> will also delete their teams,
									all projects inside those teams, and all tasks inside those projects.
								</p>
							</div>
						)}

					</div>

					<div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
						<div className="flex items-center gap-3">
							<button
								onClick={handleSave}
								disabled={saving || !hasChanges}
								className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
							>
								{saving ? (
									<>
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Saving...
									</>
								) : (
									<>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										Save Changes
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

						{!isSelf && (
							!confirmDelete ? (
								<button
									onClick={() => setConfirmDelete(true)}
									className="flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-4 py-2.5 rounded-lg transition-colors"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Delete User
								</button>
							) : (
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-500">
										{originalRole === 'manager' ? 'This will cascade. Sure?' : 'Are you sure?'}
									</span>
									<button
										onClick={handleDelete}
										disabled={deleting}
										className="text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
									>
										{deleting ? 'Deleting...' : 'Yes, Delete'}
									</button>
									<button
										onClick={() => setConfirmDelete(false)}
										className="text-xs font-semibold text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
									>
										Cancel
									</button>
								</div>
							)
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default EditEmployee;