import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const Field = ({ label, error, hint, children }) => (
	<div className="flex flex-col gap-1.5">
		<label className="text-sm font-medium text-gray-700">{label}</label>
		{children}
		{hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
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
	<DashboardLayout activeMenuItem="Teams">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

// Safely extract the string ID from either a populated object or a raw string
const toId = (v) => (typeof v === 'object' && v !== null ? v._id : v);

const EditTeam = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [form, setForm] = useState({ name: '', managerId: '', description: '' });
	const [selectedMembers, setSelectedMembers] = useState([]);
	const [errors, setErrors]     = useState({});
	const [loading, setLoading]   = useState(true);
	const [saving, setSaving]     = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [memberSearch, setMemberSearch]   = useState('');

	const [managers, setManagers]   = useState([]);
	const [employees, setEmployees] = useState([]);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [teamRes, mRes, eRes] = await Promise.all([
					axiosInstance.get(API_PATHS.TEAM.GET_TEAM_BY_ID(id)),
					axiosInstance.get(API_PATHS.USER.GET_USER_BY_ROLE('manager')),
					axiosInstance.get(API_PATHS.USER.GET_USER_BY_ROLE('employee')),
				]);

				const team      = teamRes.data.team;
				const allEmps   = eRes.data.users ?? [];

				setForm({
					name:        team.name        ?? '',
					managerId:   toId(team.managerId) ?? '',
					description: team.description ?? '',
				});

				// FIX: normalise members — if populated objects use them directly,
				// if plain ID strings look them up in the employee list so we always
				// have { _id, fullName, email } objects for rendering chips correctly.
				const rawMembers = team.members ?? [];
				const normalised = rawMembers.map(m => {
					if (typeof m === 'object' && m !== null) return m;
					// plain string ID — try to find the full object from allEmps
					return allEmps.find(e => e._id === m) ?? { _id: m, fullName: m, email: '' };
				});
				setSelectedMembers(normalised);

				setManagers(mRes.data.users ?? []);
				setEmployees(allEmps);
			} catch {
				toast.error('Failed to load team data.');
				navigate('/hr/teams');
			} finally {
				setLoading(false);
			}
		};
		fetchAll();
	}, [id, navigate]);

	const set = (field) => (e) =>
		setForm(prev => ({ ...prev, [field]: e.target.value }));

	// FIX: use toId() for consistent string-based comparison regardless of
	// whether members are objects or raw IDs
	const toggleMember = (user) => {
		setSelectedMembers(prev =>
			prev.find(m => toId(m) === toId(user))
				? prev.filter(m => toId(m) !== toId(user))
				: [...prev, user]
		);
	};

	const removeMember = (uid) =>
		setSelectedMembers(prev => prev.filter(m => toId(m) !== uid));

	const validate = () => {
		const e = {};
		if (!form.name.trim()) e.name      = 'Team name is required';
		if (!form.managerId)   e.managerId = 'Manager is required';
		return e;
	};

	const handleSave = async () => {
		const e = validate();
		if (Object.keys(e).length > 0) { setErrors(e); return; }
		setErrors({});
		setSaving(true);

		try {
			const payload = {
				name:        form.name.trim(),
				managerId:   form.managerId,
				description: form.description.trim(),
				members:     selectedMembers.map(m => toId(m)),
			};
			const res = await axiosInstance.put(API_PATHS.TEAM.UPDATE_TEAM(id), payload);
			toast.success(res.data.message ?? 'Team updated successfully!');
			navigate('/hr/teams');
		} catch (err) {
			toast.error(err.response?.data?.message ?? 'Failed to update team.');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			await axiosInstance.delete(API_PATHS.TEAM.DELETE_TEAM(id));
			toast.success('Team deleted successfully.');
			navigate('/hr/teams', { replace: true });
		} catch (err) {
			toast.error(err.response?.data?.message ?? 'Failed to delete team.');
			setDeleting(false);
			setConfirmDelete(false);
		}
	};

	const filteredEmployees = employees.filter(e =>
		!memberSearch ||
		e.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) ||
		e.email?.toLowerCase().includes(memberSearch.toLowerCase())
	);

	if (loading) return <LoadingSpinner />;

	return (
		<DashboardLayout activeMenuItem="Teams">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">

				<div className="mb-8 flex items-center gap-4">
					<button onClick={() => navigate('/hr/teams')}
						className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Edit Team</h1>
						<p className="text-sm text-gray-500 mt-1">
							Updating <span className="font-medium text-gray-700">{form.name}</span>
						</p>
					</div>
				</div>

				<div className="max-w-2xl mx-auto space-y-6">

					{/* Main Form Card */}
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">

						<Field label="Team Name" error={errors.name}>
							<input type="text" placeholder="e.g. Frontend Team"
								value={form.name} onChange={set('name')}
								className={inputClass(errors.name)} />
						</Field>

						<Field label="Manager" error={errors.managerId} hint="Only managers can lead a team">
							<select value={form.managerId} onChange={set('managerId')}
								className={inputClass(errors.managerId)}>
								<option value="">Select a manager</option>
								{managers.map(m => (
									<option key={m._id} value={m._id}>{m.fullName} — {m.email}</option>
								))}
							</select>
						</Field>

						<Field label="Description (optional)">
							<textarea placeholder="What does this team do?"
								value={form.description} onChange={set('description')}
								rows={3} className={inputClass(false) + ' resize-none'} />
						</Field>

					</div>

					{/* Members Card */}
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
						<h2 className="text-base font-semibold text-gray-800 mb-1">Team Members</h2>
						<p className="text-xs text-gray-400 mb-5">Select employees to add to this team.</p>

						{selectedMembers.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-4">
								{selectedMembers.map(m => (
									<div key={toId(m)}
										className="flex items-center gap-1.5 bg-[#eeeeff] text-[#484bf2] text-xs font-semibold px-3 py-1.5 rounded-full">
										{m.fullName}
										<button onClick={() => removeMember(toId(m))} className="hover:text-[#3a3dd4]">
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								))}
							</div>
						)}

						<div className="relative mb-3">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
							</svg>
							<input type="text" placeholder="Search employees..."
								value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
								className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2]" />
						</div>

						<div className="max-h-52 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-lg">
							{filteredEmployees.length === 0 ? (
								<div className="py-8 text-center text-sm text-gray-400">No employees found</div>
							) : filteredEmployees.map(emp => {
								// FIX: use toId() on both sides so string vs object comparison always works
								const selected = !!selectedMembers.find(m => toId(m) === toId(emp));
								return (
									<label key={emp._id}
										className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
										<input type="checkbox" checked={selected}
											onChange={() => toggleMember(emp)}
											className="accent-[#484bf2] w-4 h-4 shrink-0" />
										<div className="w-7 h-7 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-xs font-bold shrink-0">
											{emp.fullName?.charAt(0)?.toUpperCase() || '?'}
										</div>
										<div className="min-w-0">
											<p className="text-sm font-medium text-gray-800 truncate">{emp.fullName}</p>
											<p className="text-xs text-gray-400 truncate">{emp.email}</p>
										</div>
									</label>
								);
							})}
						</div>

						{selectedMembers.length > 0 && (
							<p className="text-xs text-gray-500 mt-3">
								{selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
							</p>
						)}
					</div>

					{/* Actions */}
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm px-8 py-5 space-y-4">

						{/* Cascade warning */}
						<div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
							<svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
							</svg>
							<p className="text-xs text-amber-700">
								<span className="font-semibold">Deleting this team</span> will also delete all its projects
								and every task inside those projects.
							</p>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<button onClick={handleSave} disabled={saving}
									className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
									{saving ? (
										<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
									) : (
										<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>Save Changes</>
									)}
								</button>
								<button onClick={() => navigate('/hr/teams')}
									className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
									Cancel
								</button>
							</div>

							{!confirmDelete ? (
								<button onClick={() => setConfirmDelete(true)}
									className="flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-4 py-2.5 rounded-lg transition-colors">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Delete Team
								</button>
							) : (
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-500">This will cascade. Sure?</span>
									<button onClick={handleDelete} disabled={deleting}
										className="text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors">
										{deleting ? 'Deleting...' : 'Yes, Delete'}
									</button>
									<button onClick={() => setConfirmDelete(false)}
										className="text-xs font-semibold text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
										Cancel
									</button>
								</div>
							)}
						</div>
					</div>

				</div>
			</div>
		</DashboardLayout>
	);
};

export default EditTeam;