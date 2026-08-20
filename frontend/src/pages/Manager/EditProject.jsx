import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { FieldError, FieldLabel as Label, FormInput as Input, FormSelect as Select, FormTextarea as Textarea } from '../../components/ui/FormControls';
import { DashboardLoading } from '../../components/ui/Display';

// ─── Reusable field components ─────────────────────────────────────────────────


// ─── Main Component ────────────────────────────────────────────────────────────

const EditProject = () => {
	const navigate      = useNavigate();
	const { id }        = useParams();

	const [form, setForm] = useState({
		projectName: '',
		description: '',
		teamId:      '',
		startDate:   '',
		endDate:     '',
		status:      'pending',
	});

	const [errors,          setErrors]          = useState({});
	const [teams,           setTeams]           = useState([]);
	const [loading,         setLoading]         = useState(false);
	const [fetching,        setFetching]        = useState(true);
	const [deleteConfirm,   setDeleteConfirm]   = useState(false);
	const [deleting,        setDeleting]        = useState(false);

	// ── Fetch project + teams in parallel ─────────────────────────────────────
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [projectRes, teamsRes] = await Promise.all([
					axiosInstance.get(API_PATHS.Project.GET_PROJECT_BY_ID(id)),
					axiosInstance.get(API_PATHS.TEAM.GET_ALL_TEAMS),
				]);

				const project = projectRes.data.project;
				const teamList = Array.isArray(teamsRes.data)
					? teamsRes.data
					: teamsRes.data.teams ?? [];

				setTeams(teamList);

				// Format dates to YYYY-MM-DD for input[type=date]
				const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

				setForm({
					projectName: project.projectName  ?? '',
					description: project.description  ?? '',
					teamId:      project.teamId?._id  ?? project.teamId ?? '',
					startDate:   fmt(project.startDate),
					endDate:     fmt(project.endDate),
					status:      project.status       ?? 'pending',
				});
			} catch {
				toast.error('Failed to load project data.');
				navigate('/manager/projects');
			} finally {
				setFetching(false);
			}
		};
		fetchData();
	}, [id, navigate]);

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

		if (form.startDate && form.endDate) {
			const start = new Date(form.startDate);
			const end   = new Date(form.endDate);
			if (end < start) newErrors.endDate = 'End date cannot be before start date';
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
				status:      form.status,
				...(form.description.trim() && { description: form.description.trim() }),
				...(form.startDate          && { startDate:   form.startDate }),
				...(form.endDate            && { endDate:     form.endDate }),
			};

			const res = await axiosInstance.put(API_PATHS.Project.UPDATE_PROJECT(id), payload);

			if (res.data.success) {
				toast.success('Project updated successfully!');
				navigate('/manager/projects');
			} else {
				toast.error(res.data.message || 'Failed to update project');
			}
		} catch (err) {
			const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			const res = await axiosInstance.delete(API_PATHS.Project.DELETE_PROJECT(id));
			if (res.data.success) {
				toast.success('Project deleted successfully.');
				navigate('/manager/projects');
			} else {
				toast.error(res.data.message || 'Failed to delete project');
			}
		} catch (err) {
			const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
			toast.error(msg);
		} finally {
			setDeleting(false);
			setDeleteConfirm(false);
		}
	};

	const todayStr = new Date().toISOString().split('T')[0];

	if (fetching) return <DashboardLoading activeMenuItem="Projects" />;

	return (
		<DashboardLayout activeMenuItem="Projects">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">

				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate('/manager/projects')}
							className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">Edit Project</h1>
							<p className="text-sm text-gray-500 mt-0.5">Update project details or delete this project</p>
						</div>
					</div>

					{/* Delete button */}
					{!deleteConfirm ? (
						<button
							onClick={() => setDeleteConfirm(true)}
							className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-lg transition-colors border border-rose-200"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Delete Project
						</button>
					) : (
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-500">Are you sure?</span>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className="text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
							>
								{deleting ? 'Deleting...' : 'Yes, Delete'}
							</button>
							<button
								onClick={() => setDeleteConfirm(false)}
								className="text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
							>
								Cancel
							</button>
						</div>
					)}
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
							<Select name="teamId" value={form.teamId} onChange={handleChange}>
								<option value="">Select a team</option>
								{teams.map(team => (
									<option key={team._id} value={team._id}>
										{team.name ?? team.teamName}
										{team.managerId?.fullName ? ` — ${team.managerId.fullName}` : ''}
									</option>
								))}
							</Select>
							<FieldError message={errors.teamId} />
						</div>

						{/* Status */}
						<div>
							<Label required>Status</Label>
							<Select name="status" value={form.status} onChange={handleChange}>
								<option value="pending">Pending</option>
								<option value="in-progress">In Progress</option>
								<option value="done">Done</option>
							</Select>
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
								disabled={loading}
								className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
							>
								{loading ? (
									<>
										<span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
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

export default EditProject;
