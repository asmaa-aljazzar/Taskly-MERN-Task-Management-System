import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

// ─── Reusable UI ───────────────────────────────────────────────────────────────

const Field = ({ label, error, hint, children }) => (
	<div className="flex flex-col gap-1.5">
		<label className="text-sm font-medium text-gray-700">{label}</label>
		{children}
		{hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
		{error && <p className="text-xs text-rose-500">{error}</p>}
	</div>
);

const inputClass = (hasError) =>
	`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${hasError
		? 'border-rose-400 focus:ring-rose-200'
		: 'border-gray-200 focus:ring-[#484bf2]/20 focus:border-[#484bf2]'
	}`;

// ─── Main Component ────────────────────────────────────────────────────────────

const CreateTeam = () => {
	const navigate = useNavigate();

	const [form, setForm] = useState({
		name: '',
		managerId: '',
		description: '',
	});
	const [selectedMembers, setSelectedMembers] = useState([]);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [managers, setManagers] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [dataLoading, setDataLoading] = useState(true);
	const [memberSearch, setMemberSearch] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [mRes, eRes] = await Promise.all([
					axiosInstance.get(API_PATHS.USER.GET_USER_BY_ROLE('manager')),
					axiosInstance.get(API_PATHS.USER.GET_USER_BY_ROLE('employee')),
				]);
				setManagers(mRes.data.users ?? []);
				setEmployees(eRes.data.users ?? []);
			} catch {
				toast.error('Failed to load users. Please refresh the page.');
			} finally {
				setDataLoading(false);
			}
		};
		fetchData();
	}, []);

	const set = (field) => (e) => {
		setForm(prev => ({ ...prev, [field]: e.target.value }));
		// Clear field error on change
		if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
	};

	const toggleMember = (user) => {
		setSelectedMembers(prev =>
			prev.find(m => m._id === user._id)
				? prev.filter(m => m._id !== user._id)
				: [...prev, user]
		);
	};

	const removeMember = (id) =>
		setSelectedMembers(prev => prev.filter(m => m._id !== id));

	const validate = () => {
		const e = {};
		if (!form.name.trim()) e.name = 'Team name is required';
		if (!form.managerId) e.managerId = 'Manager is required';
		return e;
	};

	const handleSubmit = async () => {
		const e = validate();
		if (Object.keys(e).length > 0) {
			setErrors(e);
			// Show a single toast summarising what's missing
			const missing = [];
			if (e.name) missing.push('team name');
			if (e.managerId) missing.push('manager');
			toast.error(`Missing fields: ${missing.join(' and ')}`);
			return;
		}

		setErrors({});
		setLoading(true);

		try {
			const payload = {
				name: form.name.trim(),
				managerId: form.managerId,
				description: form.description.trim(),
				members: selectedMembers.map(m => m._id),
			};

			await axiosInstance.post(API_PATHS.TEAM.CREATE_TEAM, payload);
			toast.success(`"${form.name.trim()}" team created successfully!`);
			navigate('/hr/teams');
		} catch (err) {
			const msg = err.response?.data?.message;

			// Map known backend errors to friendly messages
			if (msg?.includes('Manager Not Found')) {
				toast.error('Selected manager not found. Please choose another.');
			} else if (msg?.includes('HR users cannot')) {
				toast.error('HR users cannot be added as team members.');
			} else if (msg?.includes('One or more members')) {
				toast.error('One or more selected members are invalid or deactivated.');
			} else if (msg?.includes('manager must be')) {
				toast.error('Only HR or Manager roles can lead a team.');
			} else {
				toast.error(msg ?? 'Failed to create team. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const filteredEmployees = employees.filter(e =>
		!memberSearch ||
		e.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) ||
		e.email?.toLowerCase().includes(memberSearch.toLowerCase())
	);

	return (
		<DashboardLayout activeMenuItem="Create Team">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">

				{/* Header */}
				<div className="mb-8 flex items-center gap-4">
					<button onClick={() => navigate('/hr/teams')}
						className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Create Team</h1>
						<p className="text-sm text-gray-500 mt-1">Set up a new team and assign members</p>
					</div>
				</div>

				<div className="max-w-2xl mx-auto space-y-6">

					{/* Main Form Card */}
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">

						<Field label="Team Name *" error={errors.name}>
							<input
								type="text"
								placeholder="e.g. Frontend Team"
								value={form.name}
								onChange={set('name')}
								className={inputClass(!!errors.name)}
							/>
						</Field>

						<Field label="Manager *" error={errors.managerId} hint="Only managers can lead a team">
							<select
								value={form.managerId}
								onChange={set('managerId')}
								disabled={dataLoading}
								className={inputClass(!!errors.managerId)}
							>
								<option value="">
									{dataLoading ? 'Loading managers...' : 'Select a manager'}
								</option>
								{managers.map(m => (
									<option key={m._id} value={m._id}>{m.fullName} — {m.email}</option>
								))}
							</select>
						</Field>

						<Field label="Description (optional)">
							<textarea
								placeholder="What does this team do?"
								value={form.description}
								onChange={set('description')}
								rows={3}
								className={inputClass(false) + ' resize-none'}
							/>
						</Field>

					</div>

					{/* Members Card */}
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
						<h2 className="text-base font-semibold text-gray-800 mb-1">Team Members</h2>
						<p className="text-xs text-gray-400 mb-5">
							Select employees to add to this team. HR users cannot be members.
						</p>

						{/* Selected chips */}
						{selectedMembers.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-4">
								{selectedMembers.map(m => (
									<div key={m._id}
										className="flex items-center gap-1.5 bg-[#eeeeff] text-[#484bf2] text-xs font-semibold px-3 py-1.5 rounded-full">
										{m.fullName}
										<button onClick={() => removeMember(m._id)} className="hover:text-[#3a3dd4]">
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								))}
							</div>
						)}

						{/* Search */}
						<div className="relative mb-3">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search employees..."
								value={memberSearch}
								onChange={e => setMemberSearch(e.target.value)}
								className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2]"
							/>
						</div>

						{/* Employee list */}
						<div className="max-h-52 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-lg">
							{dataLoading ? (
								<div className="py-8 text-center text-sm text-gray-400">Loading employees...</div>
							) : filteredEmployees.length === 0 ? (
								<div className="py-8 text-center text-sm text-gray-400">
									{memberSearch ? `No employees matching "${memberSearch}"` : 'No employees found'}
								</div>
							) : filteredEmployees.map(emp => {
								const selected = !!selectedMembers.find(m => m._id === emp._id);
								return (
									<label key={emp._id}
										className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
										<input
											type="checkbox"
											checked={selected}
											onChange={() => toggleMember(emp)}
											className="accent-[#484bf2] w-4 h-4 shrink-0"
										/>
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
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm px-8 py-5 flex items-center gap-3">
						<button
							onClick={handleSubmit}
							disabled={loading || dataLoading}
							className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
						>
							{loading ? (
								<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
							) : (
								<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>Create Team</>
							)}
						</button>
						<button
							onClick={() => navigate('/hr/teams')}
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

export default CreateTeam;