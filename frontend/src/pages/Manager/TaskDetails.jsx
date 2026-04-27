import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const StatusBadge = ({ status }) => {
	const map = {
		done:          'bg-emerald-100 text-emerald-700',
		'in-progress': 'bg-amber-100 text-amber-700',
		pending:       'bg-rose-100 text-rose-700',
	};
	const labels = { done: 'Done', 'in-progress': 'In Progress', pending: 'Pending' };
	return (
		<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
			{labels[status] ?? status}
		</span>
	);
};

const PriorityBadge = ({ priority }) => {
	const map = {
		urgent: 'bg-purple-100 text-purple-700',
		high:   'bg-rose-100 text-rose-700',
		medium: 'bg-amber-100 text-amber-700',
		low:    'bg-emerald-100 text-emerald-700',
	};
	return (
		<span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[priority] ?? 'bg-gray-100 text-gray-600'}`}>
			{priority}
		</span>
	);
};

const InfoRow = ({ label, value }) => (
	<div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
		<span className="text-sm text-gray-500">{label}</span>
		<div className="text-sm font-medium text-gray-800">{value ?? '—'}</div>
	</div>
);

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="Projects">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

const TaskDetails = () => {
	const navigate       = useNavigate();
	const { id, taskId } = useParams();

	const [task,     setTask]     = useState(null);
	const [project,  setProject]  = useState(null);
	const [fetching, setFetching] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const [projectRes, taskRes] = await Promise.all([
					axiosInstance.get(API_PATHS.Project.GET_PROJECT_BY_ID(id)),
					axiosInstance.get(API_PATHS.TASK.GET_TASK_BY_ID(id, taskId)),
				]);
				setProject(projectRes.data.project);
				setTask(taskRes.data.task);
			} catch {
				toast.error('Failed to load task.');
				navigate(`/manager/projects/${id}`);
			} finally {
				setFetching(false);
			}
		})();
	}, [id, taskId, navigate]);

	if (fetching) return <LoadingSpinner />;
	if (!task)    return null;

	const fmt             = (d) => d ? new Date(d).toLocaleDateString() : null;
	const completedItems  = task.checklist?.filter(c => c.completed).length ?? 0;
	const totalItems      = task.checklist?.length ?? 0;

	return (
		<DashboardLayout activeMenuItem="Projects">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-6">

				{/* Header */}
				<div className="flex items-center justify-between">
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
							<h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
							<p className="text-sm text-gray-500 mt-0.5">
								In <span className="font-medium text-[#484bf2]">{project?.projectName}</span>
							</p>
						</div>
					</div>
					<button
						onClick={() => navigate(`/manager/projects/${id}/tasks/${taskId}/edit`)}
						className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit Task
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

					{/* Left: Description + Checklist */}
					<div className="lg:col-span-2 space-y-6">

						{task.description && (
							<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
								<h2 className="text-sm font-semibold text-gray-700 mb-3">Description</h2>
								<p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
							</div>
						)}

						{totalItems > 0 && (
							<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-sm font-semibold text-gray-700">Checklist</h2>
									<span className="text-xs text-gray-400">{completedItems}/{totalItems} completed</span>
								</div>
								<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
									<div
										className="h-full bg-[#484bf2] rounded-full transition-all"
										style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
									/>
								</div>
								<ul className="space-y-2">
									{task.checklist.map((item, i) => (
										<li key={i} className="flex items-center gap-3 py-1.5">
											<div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
												item.completed ? 'bg-[#484bf2] border-[#484bf2]' : 'border-gray-300'
											}`}>
												{item.completed && (
													<svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
													</svg>
												)}
											</div>
											<span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
												{item.text}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Empty state when no description and no checklist */}
						{!task.description && totalItems === 0 && (
							<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
								<p className="text-sm text-gray-400">No description or checklist added.</p>
							</div>
						)}
					</div>

					{/* Right: Meta */}
					<div className="space-y-6">

						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
							<h2 className="text-sm font-semibold text-gray-700 mb-4">Details</h2>
							<InfoRow label="Status"          value={<StatusBadge status={task.status} />} />
							<InfoRow label="Priority"        value={<PriorityBadge priority={task.priority} />} />
							<InfoRow label="Start Date"      value={fmt(task.startDate)} />
							<InfoRow label="Due Date"        value={fmt(task.dueDate)} />
							<InfoRow label="Est. Hours"      value={task.estimatedHours ? `${task.estimatedHours}h` : null} />
						</div>

						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
							<h2 className="text-sm font-semibold text-gray-700 mb-4">Assigned To</h2>
							{task.assignedTo ? (
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-sm font-bold shrink-0">
										{task.assignedTo.fullName?.charAt(0)?.toUpperCase() || '?'}
									</div>
									<div>
										<p className="text-sm font-medium text-gray-800">{task.assignedTo.fullName}</p>
										{task.assignedTo.email && (
											<p className="text-xs text-gray-400">{task.assignedTo.email}</p>
										)}
									</div>
								</div>
							) : (
								<p className="text-sm text-gray-400">Unassigned</p>
							)}
						</div>

					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default TaskDetails;