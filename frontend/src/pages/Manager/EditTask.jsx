import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { FieldError, FieldLabel as Label, FormInput as Input, FormSelect as Select, FormTextarea as Textarea } from '../../components/ui/FormControls';
import { DashboardLoading } from '../../components/ui/Display';


const EditTask = () => {
	const navigate           = useNavigate();
	const { id, taskId }     = useParams(); // :id = projectId, :taskId = taskId

	const [form, setForm] = useState({
		title:          '',
		description:    '',
		assignedTo:     '',
		priority:       'medium',
		status:         'pending',
		startDate:      '',
		dueDate:        '',
		estimatedHours: '',
	});

	const [checklist,     setChecklist]     = useState([]);
	const [checkInput,    setCheckInput]    = useState('');
	const [errors,        setErrors]        = useState({});
	const [members,       setMembers]       = useState([]);
	const [project,       setProject]       = useState(null);
	const [fetching,      setFetching]      = useState(true);
	const [loading,       setLoading]       = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [deleting,      setDeleting]      = useState(false);

	const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

	useEffect(() => {
		(async () => {
			try {
				const [projectRes, taskRes] = await Promise.all([
					axiosInstance.get(API_PATHS.Project.GET_PROJECT_BY_ID(id)),
					axiosInstance.get(API_PATHS.TASK.GET_TASK_BY_ID(id, taskId)),
				]);

				const proj = projectRes.data.project;
				const task = taskRes.data.task;
				setProject(proj);

				const teamRes = await axiosInstance.get(
					API_PATHS.TEAM.GET_TEAM_BY_ID(proj.teamId?._id ?? proj.teamId)
				);
				const team = teamRes.data.team;

				const allAssignable = [
					...(team.members ?? []),
					team.managerId,
				].filter(Boolean);
				setMembers(allAssignable);

				setForm({
					title:          task.title          ?? '',
					description:    task.description    ?? '',
					assignedTo:     task.assignedTo?._id ?? task.assignedTo ?? '',
					priority:       task.priority       ?? 'medium',
					status:         task.status         ?? 'pending',
					startDate:      fmt(task.startDate),
					dueDate:        fmt(task.dueDate),
					estimatedHours: task.estimatedHours ?? '',
				});
				setChecklist(task.checklist ?? []);
			} catch {
				toast.error('Failed to load task data.');
				navigate(`/manager/projects/${id}`);
			} finally {
				setFetching(false);
			}
		})();
	}, [id, taskId, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
	};

	const addChecklistItem = () => {
		if (!checkInput.trim()) return;
		setChecklist(prev => [...prev, { text: checkInput.trim(), completed: false }]);
		setCheckInput('');
	};

	const removeChecklistItem = (index) => {
		setChecklist(prev => prev.filter((_, i) => i !== index));
	};

	const toggleChecklistItem = (index) => {
		setChecklist(prev => prev.map((item, i) =>
			i === index ? { ...item, completed: !item.completed } : item
		));
	};

	const validate = () => {
		const newErrors = {};
		if (!form.title.trim()) newErrors.title      = 'Task title is required';
		if (!form.assignedTo)   newErrors.assignedTo = 'Please assign this task to a team member';

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (form.startDate) {
			const start = new Date(form.startDate);
			start.setHours(0, 0, 0, 0);
			if (start < today) newErrors.startDate = 'Start date cannot be in the past';
		}
		if (form.dueDate) {
			const end = new Date(form.dueDate);
			end.setHours(0, 0, 0, 0);
			if (end < today) newErrors.dueDate = 'Due date cannot be in the past';
		}
		if (form.startDate && form.dueDate) {
			if (new Date(form.dueDate) < new Date(form.startDate))
				newErrors.dueDate = 'Due date cannot be before start date';
		}
		if (form.estimatedHours && (isNaN(form.estimatedHours) || Number(form.estimatedHours) < 0))
			newErrors.estimatedHours = 'Must be a positive number';

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
				title:      form.title.trim(),
				assignedTo: form.assignedTo,
				priority:   form.priority,
				status:     form.status,
				checklist,
				...(form.description.trim() && { description:   form.description.trim() }),
				...(form.startDate          && { startDate:      form.startDate }),
				...(form.dueDate            && { dueDate:        form.dueDate }),
				...(form.estimatedHours     && { estimatedHours: Number(form.estimatedHours) }),
			};

			const res = await axiosInstance.put(API_PATHS.TASK.UPDATE_TASK(id, taskId), payload);

			if (res.data.success) {
				toast.success('Task updated successfully!');
				navigate(`/manager/projects/${id}`);
			} else {
				toast.error(res.data.message || 'Failed to update task');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			const res = await axiosInstance.delete(API_PATHS.TASK.DELETE_TASK(id, taskId));
			if (res.data.success) {
				toast.success('Task deleted.');
				navigate(`/manager/projects/${id}`);
			} else {
				toast.error(res.data.message || 'Failed to delete task');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Something went wrong.');
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
							onClick={() => navigate(`/manager/projects/${id}`)}
							className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">Edit Task</h1>
							<p className="text-sm text-gray-500 mt-0.5">
								In <span className="font-medium text-[#484bf2]">{project?.projectName}</span>
							</p>
						</div>
					</div>

					{/* Delete */}
					{!deleteConfirm ? (
						<button onClick={() => setDeleteConfirm(true)}
							className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-lg transition-colors border border-rose-200">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Delete Task
						</button>
					) : (
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-500">Are you sure?</span>
							<button onClick={handleDelete} disabled={deleting}
								className="text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors">
								{deleting ? 'Deleting...' : 'Yes, Delete'}
							</button>
							<button onClick={() => setDeleteConfirm(false)}
								className="text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
								Cancel
							</button>
						</div>
					)}
				</div>

				<div className="max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8">
					<form onSubmit={handleSubmit} className="space-y-6">

						{/* Title */}
						<div>
							<Label required>Task Title</Label>
							<Input name="title" value={form.title} onChange={handleChange}
								placeholder="e.g. Design landing page" maxLength={100} />
							<FieldError message={errors.title} />
						</div>

						{/* Description */}
						<div>
							<Label>Description</Label>
							<Textarea name="description" value={form.description} onChange={handleChange}
								placeholder="Describe the task in detail..." rows={3} maxLength={500} />
						</div>

						{/* Assign To */}
						<div>
							<Label required>Assign To</Label>
							<Select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
								<option value="">Select a team member</option>
								{members.map(m => (
									<option key={m._id} value={m._id}>
										{m.fullName} {m.email ? `(${m.email})` : ''}
									</option>
								))}
							</Select>
							<FieldError message={errors.assignedTo} />
						</div>

						{/* Priority + Status */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<Label>Priority</Label>
								<Select name="priority" value={form.priority} onChange={handleChange}>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
									<option value="urgent">Urgent</option>
								</Select>
							</div>
							<div>
								<Label>Status</Label>
								<Select name="status" value={form.status} onChange={handleChange}>
									<option value="pending">Pending</option>
									<option value="in-progress">In Progress</option>
									<option value="done">Done</option>
								</Select>
							</div>
						</div>

						{/* Dates */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<Label>Start Date</Label>
								<Input type="date" name="startDate" value={form.startDate}
									onChange={handleChange} min={todayStr} />
								<FieldError message={errors.startDate} />
							</div>
							<div>
								<Label>Due Date</Label>
								<Input type="date" name="dueDate" value={form.dueDate}
									onChange={handleChange} min={form.startDate || todayStr} />
								<FieldError message={errors.dueDate} />
							</div>
						</div>

						{/* Estimated Hours */}
						<div>
							<Label>Estimated Hours</Label>
							<Input type="number" name="estimatedHours" value={form.estimatedHours}
								onChange={handleChange} placeholder="e.g. 8" min="0" step="0.5" />
							<FieldError message={errors.estimatedHours} />
						</div>

						{/* Checklist */}
						<div>
							<Label>Checklist</Label>
							<div className="flex gap-2 mb-3">
								<input
									type="text"
									value={checkInput}
									onChange={e => setCheckInput(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
									placeholder="Add a checklist item..."
									className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] placeholder-gray-400"
								/>
								<button type="button" onClick={addChecklistItem}
									className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
									Add
								</button>
							</div>
							{checklist.length > 0 && (
								<ul className="space-y-2">
									{checklist.map((item, i) => (
										<li key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
											<div className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={item.completed}
													onChange={() => toggleChecklistItem(i)}
													className="w-4 h-4 accent-[#484bf2] cursor-pointer"
												/>
												<span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
													{item.text}
												</span>
											</div>
											<button type="button" onClick={() => removeChecklistItem(i)}
												className="text-gray-400 hover:text-rose-500 transition-colors">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</li>
									))}
								</ul>
							)}
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3 pt-2">
							<button type="submit" disabled={loading}
								className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
								{loading ? (
									<><span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />Saving...</>
								) : (
									<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>Save Changes</>
								)}
							</button>
							<button type="button" onClick={() => navigate(`/manager/projects/${id}`)}
								className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
								Cancel
							</button>
						</div>

					</form>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default EditTask;
