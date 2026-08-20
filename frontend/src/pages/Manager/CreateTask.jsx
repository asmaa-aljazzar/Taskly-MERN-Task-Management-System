import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { FieldError, FieldLabel as Label, FormInput as Input, FormSelect as Select, FormTextarea as Textarea } from '../../components/ui/FormControls';
import { DashboardLoading } from '../../components/ui/Display';


const CreateTask = () => {
	const navigate = useNavigate();
	const { id }   = useParams();

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

				let teamMembers = team.members ?? [];

				if (teamMembers.length > 0 && typeof teamMembers[0] === 'string') {
					const memberDetails = await Promise.all(
						teamMembers.map(async (memberId) => {
							try {
								const userRes = await axiosInstance.get(API_PATHS.USER.GET_USER_BY_ID(memberId));
								return userRes.data.user;
							} catch {
								return null;
							}
						})
					);
					teamMembers = memberDetails.filter(Boolean);
				}

				const filteredMembers = teamMembers.filter(member => {
					if (member.role) return member.role !== 'manager' && member.role !== 'hr';
					if (team.managerId) {
						const managerId = typeof team.managerId === 'object' ? team.managerId._id : team.managerId;
						return member._id !== managerId;
					}
					return true;
				});

				setMembers(filteredMembers);

				if (filteredMembers.length === 0) {
					toast('No employees in this team yet. Add members to the team first.', { icon: '⚠️' });
				}
			} catch {
				toast.error('Failed to load project data. Please try again.');
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
		if (!checkInput.trim()) {
			toast.error('Checklist item cannot be empty.');
			return;
		}
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
			const missing = [];
			if (validationErrors.title)          missing.push('task title');
			if (validationErrors.assignedTo)     missing.push('assigned member');
			if (validationErrors.startDate)      missing.push('valid start date');
			if (validationErrors.dueDate)        missing.push('valid due date');
			if (validationErrors.estimatedHours) missing.push('valid estimated hours');
			toast.error(`Please fix: ${missing.join(', ')}`);
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
				toast.success(`"${form.title.trim()}" task created successfully!`);
				navigate(`/manager/projects/${id}`);
			} else {
				toast.error(res.data.message || 'Failed to create task');
			}
		} catch (err) {
			const msg = err.response?.data?.message;
			if (msg?.includes('User Not Found')) {
				toast.error('Selected member not found. Please choose another.');
				setErrors(prev => ({ ...prev, assignedTo: 'Member not found' }));
			} else if (msg?.includes('not a member')) {
				toast.error('Selected user is not a member of this project\'s team.');
				setErrors(prev => ({ ...prev, assignedTo: 'Not a team member' }));
			} else if (msg?.includes('Project Not Found')) {
				toast.error('Project not found. It may have been deleted.');
			} else if (msg?.includes('Start date')) {
				toast.error('Start date cannot be in the past.');
				setErrors(prev => ({ ...prev, startDate: msg }));
			} else if (msg?.includes('End date') || msg?.includes('due')) {
				toast.error('Due date is invalid.');
				setErrors(prev => ({ ...prev, dueDate: msg }));
			} else if (msg?.includes('priority')) {
				toast.error('Invalid priority value.');
			} else if (msg?.includes('Estimated hours')) {
				toast.error('Estimated hours must be a positive number.');
				setErrors(prev => ({ ...prev, estimatedHours: msg }));
			} else {
				toast.error(msg || 'Failed to create task. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const todayStr = new Date().toISOString().split('T')[0];

	if (fetching) return <DashboardLoading activeMenuItem="Projects" />;

	return (
		<DashboardLayout activeMenuItem="Projects">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">
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

						<div>
							<Label required>Task Title</Label>
							<Input
								name="title"
								value={form.title}
								onChange={handleChange}
								placeholder="e.g. Design landing page"
								maxLength={100}
							/>
							<FieldError message={errors.title} />
						</div>

						<div>
							<Label>Description</Label>
							<Textarea
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Describe the task in detail..."
								rows={3}
								maxLength={500}
							/>
						</div>

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
							{members.length === 0 && (
								<p className="mt-1 text-xs text-amber-600">
									No employees in this team. Add employees to the team first.
								</p>
							)}
							<FieldError message={errors.assignedTo} />
						</div>

						<div>
							<Label>Priority</Label>
							<Select name="priority" value={form.priority} onChange={handleChange}>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="urgent">Urgent</option>
							</Select>
						</div>

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
								<Label>Due Date</Label>
								<Input
									type="date"
									name="dueDate"
									value={form.dueDate}
									onChange={handleChange}
									min={form.startDate || todayStr}
								/>
								<FieldError message={errors.dueDate} />
							</div>
						</div>

						<div>
							<Label>Estimated Hours</Label>
							<Input
								type="number"
								name="estimatedHours"
								value={form.estimatedHours}
								onChange={handleChange}
								placeholder="e.g. 8"
								min="0"
								step="0.5"
							/>
							<FieldError message={errors.estimatedHours} />
						</div>

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
								<button
									type="button"
									onClick={addChecklistItem}
									className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
								>
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
											<button
												type="button"
												onClick={() => removeChecklistItem(i)}
												className="text-gray-400 hover:text-rose-500 transition-colors"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</li>
									))}
								</ul>
							)}
						</div>

						<div className="flex items-center gap-3 pt-2">
							<button
								type="submit"
								disabled={loading || members.length === 0}
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
										Create Task
									</>
								)}
							</button>
							<button
								type="button"
								onClick={() => navigate(`/manager/projects/${id}`)}
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

export default CreateTask;
