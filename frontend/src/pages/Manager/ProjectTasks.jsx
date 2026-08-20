import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badges';
import { DashboardLoading, TableCell as Td, TableHeader as Th } from '../../components/ui/Display';

const ProjectTasks = () => {
	const navigate = useNavigate();
	const { id: projectId } = useParams();

	const [project, setProject] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [fetching, setFetching] = useState(true);
	const [search, setSearch] = useState('');
	const [deleteId, setDeleteId] = useState(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [projectRes, tasksRes] = await Promise.all([
					axiosInstance.get(API_PATHS.Project.GET_PROJECT_BY_ID(projectId)),
					axiosInstance.get(API_PATHS.TASK.GET_ALL_TASKS(projectId)),
				]);
				if (projectRes.data.success) setProject(projectRes.data.project);
				const list = tasksRes.data.tasks ?? [];
				setTasks(list);
			} catch {
				toast.error('Failed to load tasks.');
			} finally {
				setFetching(false);
			}
		};
		fetchAll();
	}, [projectId]);

	const handleDelete = async (taskId) => {
		setDeleting(true);
		try {
			const res = await axiosInstance.delete(API_PATHS.TASK.DELETE_TASK(projectId, taskId));
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

	const total = tasks.length;
	const pending = tasks.filter(t => t.status === 'pending').length;
	const inProgress = tasks.filter(t => t.status === 'in-progress').length;
	const completed = tasks.filter(t => t.status === 'done').length;

	return (
		<DashboardLayout activeMenuItem="Projects">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-6">

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate(`/manager/projects/${projectId}`)}
							className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">
								{project?.projectName ?? 'Project'} — Tasks
							</h1>
							<p className="text-sm text-gray-500 mt-0.5">Manage all tasks for this project</p>
						</div>
					</div>
					<button
						onClick={() => navigate(`/manager/projects/${projectId}/tasks/create`)}
						className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Create Task
					</button>
				</div>

				{/* Stat Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[
						{ label: 'Total', value: total, accent: 'bg-blue-50', color: 'text-blue-500' },
						{ label: 'Pending', value: pending, accent: 'bg-rose-50', color: 'text-rose-500' },
						{ label: 'In Progress', value: inProgress, accent: 'bg-amber-50', color: 'text-amber-500' },
						{ label: 'Completed', value: completed, accent: 'bg-emerald-50', color: 'text-emerald-500' },
					].map(({ label, value, color }) => (
						<div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
							<p className="text-sm text-gray-500">{label}</p>
							<p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
						</div>
					))}
				</div>

				{/* Table Card */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm">

					{/* Search */}
					<div className="p-5 border-b border-gray-100 flex items-center justify-between">
						<p className="text-sm font-semibold text-gray-700">All Tasks</p>
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
								className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] w-60"
							/>
						</div>
					</div>

					{/* Table */}
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
									<tr key={task._id} className="hover:bg-gray-50 transition-colors">
										<Td>
											<div>
												<p className="font-medium text-gray-800">{task.title}</p>
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
													<div className="w-6 h-6 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-[10px] font-bold">
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
										<Td>
											<div className="flex items-center gap-3">
												<button
													onClick={() => navigate(`/manager/projects/${projectId}/tasks/${task._id}/edit`)}
													className="text-xs text-[#484bf2] hover:underline font-medium"
												>
													Edit
												</button>
												{deleteId === task._id ? (
													<div className="flex items-center gap-1">
														<button
															onClick={() => handleDelete(task._id)}
															disabled={deleting}
															className="text-xs text-white bg-rose-500 hover:bg-rose-600 px-2 py-0.5 rounded font-medium"
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
											{search ? `No tasks matching "${search}"` : 'No tasks yet. Create your first task!'}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{filtered.length > 0 && (
						<div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
							Showing {filtered.length} of {total} tasks
						</div>
					)}
				</div>

			</div>
		</DashboardLayout>
	);
};

export default ProjectTasks;
