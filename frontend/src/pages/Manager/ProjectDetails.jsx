import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badges';
import { DashboardLoading, InfoRow, TableCell as Td, TableHeader as Th } from '../../components/ui/Display';

const ProjectDetails = () => {
	const navigate = useNavigate();
	const { id } = useParams();

	const [project, setProject] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [fetching, setFetching] = useState(true);
	const [search, setSearch] = useState('');
	const [deleteId, setDeleteId] = useState(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const [projectRes, tasksRes] = await Promise.all([
					axiosInstance.get(API_PATHS.Project.GET_PROJECT_BY_ID(id)),
					axiosInstance.get(API_PATHS.TASK.GET_ALL_TASKS(id)),
				]);
				if (projectRes.data.success) setProject(projectRes.data.project);
				setTasks(tasksRes.data.tasks ?? []);
			} catch {
				toast.error('Failed to load project.');
				navigate('/manager/projects');
			} finally {
				setFetching(false);
			}
		})();
	}, [id, navigate]);

	const handleDeleteTask = async (taskId) => {
		setDeleting(true);
		try {
			const res = await axiosInstance.delete(API_PATHS.TASK.DELETE_TASK(id, taskId));
			if (res.data.success) {
				toast.success('Task deleted.');
				setTasks(prev => prev.filter(t => t._id !== taskId));
			} else {
				toast.error(res.data.message || 'Failed to delete task');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Something went wrong.');
		} finally {
			setDeleting(false);
			setDeleteId(null);
		}
	};

	if (fetching) return <DashboardLoading activeMenuItem="Projects" />;
	if (!project) return null;

	const fmt = (d) => d ? new Date(d).toLocaleDateString() : null;

	const total = tasks.length;
	const pending = tasks.filter(t => t.status === 'pending').length;
	const inProgress = tasks.filter(t => t.status === 'in-progress').length;
	const completed = tasks.filter(t => t.status === 'done').length;

	const filtered = tasks.filter(t => {
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			t.title?.toLowerCase().includes(q) ||
			t.assignedTo?.fullName?.toLowerCase().includes(q) ||
			t.status?.toLowerCase().includes(q) ||
			t.priority?.toLowerCase().includes(q)
		);
	});

	return (
		<DashboardLayout activeMenuItem="Projects">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-6">

				{/* Header */}
				<div className="flex items-center justify-between">
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
							<h1 className="text-2xl font-bold text-gray-800">{project.projectName}</h1>
							<p className="text-sm text-gray-500 mt-0.5">Project details &amp; task management</p>
						</div>
					</div>
					<button
						onClick={() => navigate(`/manager/projects/edit/${id}`)}
						className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit Project
					</button>
				</div>

				{/* Top row */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 lg:col-span-1">
						<h2 className="text-sm font-semibold text-gray-700 mb-3">Project Info</h2>
						<InfoRow label="Status" value={<StatusBadge status={project.status} />} />
						<InfoRow label="Team" value={project.teamId?.name ?? project.teamId?.teamName} />
						<InfoRow label="Start Date" value={fmt(project.startDate)} />
						<InfoRow label="End Date" value={fmt(project.endDate)} />
						<InfoRow label="Created" value={fmt(project.createdAt)} />
						{project.description && (
							<div className="pt-3 mt-1">
								<p className="text-xs text-gray-400 mb-1">Description</p>
								<p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
							</div>
						)}
					</div>

					<div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
						{[
							{ label: 'Total Tasks', value: total, color: 'text-blue-500', bg: 'bg-blue-50' },
							{ label: 'Pending', value: pending, color: 'text-rose-500', bg: 'bg-rose-50' },
							{ label: 'In Progress', value: inProgress, color: 'text-amber-500', bg: 'bg-amber-50' },
							{ label: 'Completed', value: completed, color: 'text-emerald-500', bg: 'bg-emerald-50' },
						].map(({ label, value, color, bg }) => (
							<div key={label} className={`${bg} rounded-xl p-4 flex flex-col gap-1`}>
								<p className="text-xs font-medium text-gray-500">{label}</p>
								<p className={`text-3xl font-bold ${color}`}>{value}</p>
							</div>
						))}
					</div>
				</div>

				{/* Tasks table */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
					<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
						<p className="text-sm font-semibold text-gray-700 sm:mr-auto">Tasks</p>
						<div className="relative">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search tasks..."
								value={search}
								onChange={e => setSearch(e.target.value)}
								className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] w-56"
							/>
						</div>
						<button
							onClick={() => navigate(`/manager/projects/${id}/tasks/create`)}
							className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							Create Task
						</button>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead>
								<tr className="border-b border-gray-100">
									<Th>Task</Th>
									<Th>Assigned To</Th>
									<Th>Status</Th>
									<Th>Priority</Th>
									<Th>Due Date</Th>
									<Th>Checklist</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{filtered.length > 0 ? filtered.map((task) => (
									<tr
										key={task._id}
										onClick={() => navigate(`/manager/projects/${id}/tasks/${task._id}`)}
										className="hover:bg-gray-50 transition-colors cursor-pointer"
									>
										<Td>
											<div>
												<p className="font-medium text-gray-800 group-hover:text-[#484bf2] transition-colors">
													{task.title}
												</p>
												{task.description && (
													<p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
														{task.description}
													</p>
												)}
											</div>
										</Td>

										<Td>
											{task.assignedTo ? (
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
														{task.assignedTo.fullName?.charAt(0)?.toUpperCase()}
													</div>
													<span>{task.assignedTo.fullName}</span>
												</div>
											) : (
												<span className="text-xs text-gray-400">Unassigned</span>
											)}
										</Td>

										<Td><StatusBadge status={task.status} /></Td>
										<Td><PriorityBadge priority={task.priority} /></Td>
										<Td className="text-gray-400 text-xs">
											{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
										</Td>
										<Td>
											{task.checklist?.length > 0 ? (
												<span className="text-xs text-gray-500">
													{task.checklist.filter(c => c.completed).length}/{task.checklist.length} done
												</span>
											) : (
												<span className="text-xs text-gray-300">—</span>
											)}
										</Td>

										{/* Actions — stop propagation so clicks here don't navigate to details */}
										<Td onClick={e => e.stopPropagation()}>
											<div className="flex items-center gap-3">
												{deleteId === task._id ? (
													<div className="flex items-center gap-1">
														<button
															onClick={() => handleDeleteTask(task._id)}
															disabled={deleting}
															className="text-xs text-white bg-rose-500 hover:bg-rose-600 px-2 py-0.5 rounded font-medium disabled:opacity-60"
														>
															{deleting ? '...' : 'Yes'}
														</button>
														<button
															onClick={() => setDeleteId(null)}
															className="text-xs text-gray-500 hover:underline"
														>
															No
														</button>
													</div>
												) : (
													<button
														onClick={() => setDeleteId(task._id)}
														className="text-xs text-rose-500 hover:underline font-medium"
													>
														Delete
													</button>
												)}
											</div>
										</Td>
									</tr>
								)) : (
									<tr>
										<td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
											{search ? `No tasks matching "${search}"` : 'No tasks yet — create the first one!'}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{filtered.length > 0 && (
						<div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
							Showing {filtered.length} of {total} task{total !== 1 ? 's' : ''}
						</div>
					)}
				</div>

			</div>
		</DashboardLayout>
	);
};

export default ProjectDetails;
