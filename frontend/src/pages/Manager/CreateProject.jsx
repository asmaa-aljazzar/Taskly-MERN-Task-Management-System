import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

// ─── Reusable field components ─────────────────────────────────────────────────

const Label = ({ children, required }) => (
	<label className="block text-sm font-medium text-gray-700 mb-1.5">
		{children} {required && <span className="text-rose-500">*</span>}
	</label>
);

const Input = ({ ...props }) => (
	<input
		{...props}
		className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400"
	/>
);

const Textarea = ({ ...props }) => (
	<textarea
		{...props}
		className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400 resize-none"
	/>
);

const Select = ({ children, ...props }) => (
	<select
		{...props}
		className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors bg-white text-gray-700"
	>
		{children}
	</select>
);

const FieldError = ({ message }) =>
	message ? <p className="mt-1 text-xs text-rose-500">{message}</p> : null;

// ─── Main Component ────────────────────────────────────────────────────────────

const CreateProject = () => {
	const navigate = useNavigate();

	const [form, setForm] = useState({
		projectName: '',
		description: '',
		teamId:      '',
		startDate:   '',
		endDate:     '',
	});

	const [errors,   setErrors]   = useState({});
	const [teams,    setTeams]    = useState([]);
	const [loading,  setLoading]  = useState(false);
	const [fetching, setFetching] = useState(true);

	// ── Fetch teams for the dropdown ──────────────────────────────────────────
	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.TEAM.GET_ALL_TEAMS);
				const list = Array.isArray(res.data) ? res.data : res.data.teams ?? [];
				setTeams(list);
			} catch {
				toast.error('Failed to load teams.');
			} finally {
				setFetching(false);
			}
		};
		fetchTeams();
	}, []);

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
	};

	const validate = () => {
		const newErrors = {};
		if (!form.projectName.trim()) newErrors.projectName = 'Project name is required';
		if (!form.teamId)             newErrors.teamId      = 'Please select a team';

		if (form.startDate && form.endDate) {
			const start = new Date(form.startDate);
			const end   = new Date(form.endDate);
			if (end < start) newErrors.endDate = 'End date cannot be before start date';
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (form.startDate) {
			const start = new Date(form.startDate);
			start.setHours(0, 0, 0, 0);
			if (start < today) newErrors.startDate = 'Start date cannot be in the past';
		}

		if (form.endDate) {
			const end = new Date(form.endDate);
			end.setHours(0, 0, 0, 0);
			if (end < today) newErrors.endDate = 'End date cannot be in the past';
		}

		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setLoading(true);
		try {
			const payload = {
				projectName: form.projectName.trim(),
				teamId:      form.teamId,
				...(form.description.trim() && { description: form.description.trim() }),
				...(form.startDate         && { startDate:   form.startDate }),
				...(form.endDate           && { endDate:     form.endDate }),
			};

			const res = await axiosInstance.post(API_PATHS.Project.CREATE_PROJECT, payload);

			if (res.data.success) {
				toast.success('Project created successfully!');
				navigate('/manager/projects');
			} else {
				toast.error(res.data.message || 'Failed to create project');
			}
		} catch (err) {
			const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	// ── Today's date string for min= on date inputs ───────────────────────────
	const todayStr = new Date().toISOString().split('T')[0];

	return (
		<DashboardLayout activeMenuItem="Create Project">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">

				{/* Header */}
				<div className="flex items-center gap-3 mb-8">
					<button
						onClick={() => navigate('/manager/projects')}
						className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Create Project</h1>
						<p className="text-sm text-gray-500 mt-0.5">Fill in the details to create a new project</p>
					</div>
				</div>

				{/* Form Card */}
				<div className="max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8">
					<form onSubmit={handleSubmit} className="space-y-6">

						{/* Project Name */}
						<div>
							<Label required>Project Name</Label>
							<Input
								name="projectName"
								value={form.projectName}
								onChange={handleChange}
								placeholder="e.g. Website Redesign"
								maxLength={100}
							/>
							<FieldError message={errors.projectName} />
						</div>

						{/* Description */}
						<div>
							<Label>Description</Label>
							<Textarea
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Briefly describe what this project is about..."
								rows={4}
								maxLength={500}
							/>
							<p className="mt-1 text-xs text-gray-400 text-right">
								{form.description.length}/500
							</p>
						</div>

						{/* Team */}
						<div>
							<Label required>Team</Label>
							{fetching ? (
								<div className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-400">
									Loading teams...
								</div>
							) : (
								<Select name="teamId" value={form.teamId} onChange={handleChange}>
									<option value="">Select a team</option>
									{teams.map(team => (
										<option key={team._id} value={team._id}>
											{team.name ?? team.teamName}
											{team.managerId?.fullName ? ` — ${team.managerId.fullName}` : ''}
										</option>
									))}
								</Select>
							)}
							<FieldError message={errors.teamId} />
						</div>

						{/* Dates */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<Label>Start Date</Label>
								<Input
									type="date"
									name="startDate"
									value={form.startDate}
									onChange={handleChange}
									min={todayStr}
								/>
								<FieldError message={errors.startDate} />
							</div>
							<div>
								<Label>End Date</Label>
								<Input
									type="date"
									name="endDate"
									value={form.endDate}
									onChange={handleChange}
									min={form.startDate || todayStr}
								/>
								<FieldError message={errors.endDate} />
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3 pt-2">
							<button
								type="submit"
								disabled={loading || fetching}
								className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
							>
								{loading ? (
									<>
										<span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
										Creating...
									</>
								) : (
									<>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
										Create Project
									</>
								)}
							</button>
							<button
								type="button"
								onClick={() => navigate('/manager/projects')}
								className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
							>
								Cancel
							</button>
						</div>

					</form>
				</div>

			</div>
		</DashboardLayout>
	);
};

export default CreateProject;