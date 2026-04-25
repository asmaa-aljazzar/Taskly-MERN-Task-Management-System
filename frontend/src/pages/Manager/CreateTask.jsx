import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const Label = ({ children, required }) => (
	<label className="block text-sm font-medium text-gray-700 mb-1.5">
		{children} {required && <span className="text-rose-500">*</span>}
	</label>
);

const Input = ({ ...props }) => (
	<input {...props}
		className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400"
	/>
);

const Textarea = ({ ...props }) => (
	<textarea {...props}
		className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400 resize-none"
	/>
);

const Select = ({ children, ...props }) => (
	<select {...props}
		className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors bg-white text-gray-700"
	>
		{children}
	</select>
);

const FieldError = ({ message }) =>
	message ? <p className="mt-1 text-xs text-rose-500">{message}</p> : null;

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="Projects">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

const CreateTask = () => {
	const navigate    = useNavigate();
	const { id }      = useParams(); // :id = projectId

	const [form, setForm] = useState({
		title:          '',
		description:    '',
		assignedTo:     '',
		priority:       'medium',
		startDate:      '',
		dueDate:        '',
		estimatedHours: '',
	});

	const [checklist,  setChecklist]  = useState([]);
	const [checkInput, setCheckInput] = useState('');
	const [errors,     setErrors]     = useState({});
	const [members,    setMembers]    = useState([]);
	const [project,    setProject]    = useState(null);
	const [fetching,   setFetching]   = useState(true);
	const [loading,    setLoading]    = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const projectRes = await axiosInstance.get(API_PATHS.Project.GET_PROJECT_BY_ID(id));
				const proj = projectRes.data.project;
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
			} catch {
				toast.error('Failed to load project data.');
				navigate(`/manager/projects/${id}`);
			} finally {
				setFetching(false);
			}
		})();
	}, [id, navigate]);

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
				...(form.description.trim() && { description:   form.description.trim() }),
				...(form.startDate          && { startDate:      form.startDate }),
				...(form.dueDate            && { dueDate:        form.dueDate }),
				...(form.estimatedHours     && { estimatedHours: Number(form.estimatedHours) }),
				...(checklist.length > 0    && { checklist }),
			};

			const res = await axiosInstance.post(API_PATHS.TASK.CREATE_TASK(id), payload);

			if (res.data.success) {
				toast.success('Task created successfully!');
				navigate(`/manager/projects/${id}`);
			} else {
				toast.error(res.data.message || 'Failed to create task');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	const todayStr = new Date().toISOString().split('T')[0];

	if (fetching) return <LoadingSpinner />;

	return (
		<DashboardLayout activeMenuItem="Projects">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">

				{/* Header */}
				<div className="flex items-center gap-3 mb-8">
					<button
						onClick={() => navigate(`/manager/projects/${id}`)}
						className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Create Task</h1>
						<p className="text-sm text-gray-500 mt-0.5">
							Adding task to <span className="font-medium text-[#484bf2]">{project?.projectName}</span>
						</p>
					</div>
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

						{/* Priority */}
						<div>
							<Label>Priority</Label>
							<Select name="priority" value={form.priority} onChange={handleChange}>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="urgent">Urgent</option>
							</Select>
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
												<div className="w-1.5 h-1.5 rounded-full bg-[#484bf2]" />
												<span className="text-sm text-gray-700">{item.text}</span>
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
									<><span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />Creating...</>
								) : (
									<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>Create Task</>
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

export default CreateTask;