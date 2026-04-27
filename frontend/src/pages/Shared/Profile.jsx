import { useState, useContext } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS, BASE_URL } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const Label = ({ children }) => (
	<label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>
);

const Input = (props) => (
	<input
		{...props}
		className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
	/>
);

const FieldError = ({ message }) =>
	message ? <p className="mt-1 text-xs text-rose-500">{message}</p> : null;

const RoleBadge = ({ role }) => {
	const map = {
		hr:       'bg-[#eeeeff] text-[#484bf2]',
		manager:  'bg-amber-100 text-amber-700',
		employee: 'bg-emerald-100 text-emerald-700',
	};
	const labels = { hr: 'HR', manager: 'Manager', employee: 'Employee' };
	return (
		<span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
			{labels[role] ?? role}
		</span>
	);
};

const EyeIcon = ({ visible }) => (
	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		{visible
			? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></>
			: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
		}
	</svg>
);

const InfoField = ({ label, value }) => (
	<div>
		<Label>{label}</Label>
		<Input value={value || '—'} disabled readOnly />
	</div>
);

// ─── Avatar Section ────────────────────────────────────────────────────────────

const AvatarSection = ({ user, onImageUpdate }) => {
	const [uploading, setUploading] = useState(false);
	const [deleting,  setDeleting]  = useState(false);
	const [imgError,  setImgError]  = useState(false);
	const [cacheBust, setCacheBust] = useState(() => Date.now());

	const isDefault = !user?.profileImageUrl ||
		user.profileImageUrl.includes('default-avatar');

	const imageUrl = user?.profileImageUrl
		? `${BASE_URL}${user.profileImageUrl}?v=${cacheBust}`
		: null;

	const showInitials = !imageUrl || imgError;

	// ── core upload logic, accepts a File directly ──────────────────
	const uploadFile = async (file) => {
		const allowed = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowed.includes(file.type)) {
			toast.error('Only JPG, PNG, or WEBP images are allowed');
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			toast.error('Image must be under 2MB');
			return;
		}

		const formData = new FormData();
		formData.append('profileImage', file);

		setUploading(true);
		try {
			const res = await axiosInstance.put(
				API_PATHS.AUTH.UPDATE_PROFILE_IMAGE,
				formData,
				{ headers: { 'Content-Type': 'multipart/form-data' } }
			);
			if (res.data.success) {
				toast.success('Profile photo updated');
				setImgError(false);
				setCacheBust(Date.now());
				onImageUpdate(res.data.imageUrl);
			} else {
				toast.error(res.data.message || 'Upload failed');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Upload failed');
		} finally {
			setUploading(false);
		}
	};

	// ── open a native file picker, completely outside React ─────────
	const handlePickFile = () => {
		if (uploading || deleting) return;

		// Create a brand-new input every time so there's no stale state
		const input = document.createElement('input');
		input.type   = 'file';
		input.accept = 'image/jpeg,image/png,image/webp';

		input.addEventListener('change', (e) => {
			const file = e.target.files?.[0];
			if (file) uploadFile(file);
		}, { once: true }); // ← fires exactly once, then removes itself

		input.click();
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			const res = await axiosInstance.delete(API_PATHS.AUTH.DELETE_PROFILE_IMAGE);
			if (res.data.success) {
				toast.success('Profile photo removed');
				setImgError(false);
				setCacheBust(Date.now());
				onImageUpdate(res.data.profileImageUrl);
			} else {
				toast.error(res.data.message || 'Failed to remove photo');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to remove photo');
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="flex items-center gap-5">
			<div className="relative shrink-0">
				{showInitials ? (
					<div className="w-20 h-20 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-2xl font-bold">
						{user?.fullName?.charAt(0)?.toUpperCase() || '?'}
					</div>
				) : (
					<img
						key={cacheBust}
						src={imageUrl}
						alt={user?.fullName}
						className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
						onError={() => setImgError(true)}
					/>
				)}
				{(uploading || deleting) && (
					<div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
						<div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
					</div>
				)}
			</div>

			<div>
				<p className="text-sm font-semibold text-gray-800 mb-0.5">{user?.fullName}</p>
				<div className="flex items-center gap-2 mb-2">
					<RoleBadge role={user?.role} />
				</div>
				<div className="flex items-center gap-2">
					{/* No hidden <input> in JSX at all */}
					<button
						onClick={handlePickFile}
						disabled={uploading || deleting}
						className="text-xs font-medium text-[#484bf2] hover:text-[#3a3dd4] border border-[#484bf2]/30 hover:border-[#484bf2] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
					>
						{uploading ? 'Uploading...' : 'Change photo'}
					</button>
					{!isDefault && !imgError && (
						<button
							onClick={handleDelete}
							disabled={uploading || deleting}
							className="text-xs font-medium text-rose-500 hover:text-rose-600 border border-rose-200 hover:border-rose-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
						>
							{deleting ? 'Removing...' : 'Remove'}
						</button>
					)}
				</div>
				<p className="text-xs text-gray-400 mt-1.5">JPG, PNG or WEBP · max 2MB</p>
			</div>
		</div>
	);
};

// ─── Password Form ─────────────────────────────────────────────────────────────

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

const PasswordSection = () => {
	const [form, setForm]       = useState({ password: '', confirm: '' });
	const [show, setShow]       = useState({ password: false, confirm: false });
	const [errors, setErrors]   = useState({});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
	};

	const validate = () => {
		const errs = {};
		if (!form.password) {
			errs.password = 'New password is required';
		} else if (!PASSWORD_REGEX.test(form.password)) {
			errs.password = 'Min 8 chars, uppercase, lowercase, number & special character';
		}
		if (!form.confirm) {
			errs.confirm = 'Please confirm your password';
		} else if (form.password !== form.confirm) {
			errs.confirm = 'Passwords do not match';
		}
		return errs;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const errs = validate();
		if (Object.keys(errs).length > 0) { setErrors(errs); return; }

		setLoading(true);
		try {
			const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
				password: form.password,
			});
			if (res.data.success) {
				toast.success('Password updated successfully');
				setForm({ password: '', confirm: '' });
			} else {
				toast.error(res.data.message || 'Failed to update password');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label>New Password</Label>
				<div className="relative">
					<input
						type={show.password ? 'text' : 'password'}
						name="password"
						value={form.password}
						onChange={handleChange}
						placeholder="Enter new password"
						className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400"
					/>
					<button
						type="button"
						onClick={() => setShow(s => ({ ...s, password: !s.password }))}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<EyeIcon visible={show.password} />
					</button>
				</div>
				<FieldError message={errors.password} />
			</div>

			<div>
				<Label>Confirm Password</Label>
				<div className="relative">
					<input
						type={show.confirm ? 'text' : 'password'}
						name="confirm"
						value={form.confirm}
						onChange={handleChange}
						placeholder="Confirm new password"
						className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400"
					/>
					<button
						type="button"
						onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<EyeIcon visible={show.confirm} />
					</button>
				</div>
				<FieldError message={errors.confirm} />
			</div>

			<p className="text-xs text-gray-400">
				Min. 8 characters with uppercase, lowercase, number and special character (@$!%*?&.#)
			</p>

			<button
				type="submit"
				disabled={loading}
				className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
			>
				{loading ? (
					<><span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />Updating...</>
				) : (
					<>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						Update Password
					</>
				)}
			</button>
		</form>
	);
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ROLE_MENU = {
	hr:       'Profile',
	manager:  'Profile',
	employee: 'Profile',
};

const Profile = () => {
	const { user, setUser } = useContext(UserContext);

	const activeMenuItem = ROLE_MENU[user?.role] ?? 'Profile';

	const handleImageUpdate = (newImageUrl) => {
    setUser(prev => {
        const updated = { ...prev, profileImageUrl: newImageUrl };
        localStorage.setItem("user", JSON.stringify(updated)); // keep localStorage in sync
        return updated;
    });
};

	return (
		<DashboardLayout activeMenuItem={activeMenuItem}>
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-6">

				<div>
					<h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
					<p className="text-sm text-gray-500 mt-1">View your account information and manage your password</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

					<div className="lg:col-span-2 space-y-6">

						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
							<h2 className="text-sm font-semibold text-gray-700 mb-5">Profile Photo</h2>
							<AvatarSection user={user} onImageUpdate={handleImageUpdate} />
						</div>

						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
							<h2 className="text-sm font-semibold text-gray-700 mb-5">Account Information</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<InfoField label="Full Name"    value={user?.fullName} />
								<InfoField label="Email"        value={user?.email} />
								<InfoField label="Phone Number" value={user?.phoneNumber} />
								<InfoField label="Hire Date"    value={user?.hireDate ? new Date(user.hireDate).toLocaleDateString() : null} />
							</div>
							<p className="mt-4 text-xs text-gray-400">
								To update your name, email, or phone number, contact HR.
							</p>
						</div>

					</div>

					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit">
						<h2 className="text-sm font-semibold text-gray-700 mb-5">Change Password</h2>
						<PasswordSection />
					</div>

				</div>
			</div>
		</DashboardLayout>
	);
};

export default Profile;