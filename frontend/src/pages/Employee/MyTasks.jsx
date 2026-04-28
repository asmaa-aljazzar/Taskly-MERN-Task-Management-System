import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
	const map = {
		done:          'bg-emerald-100 text-emerald-700',
		'in-progress': 'bg-amber-100 text-amber-700',
		pending:       'bg-rose-100 text-rose-700',
	};
	const labels = { done: 'Done', 'in-progress': 'In Progress', pending: 'Pending' };
	return (
		<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
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
		<span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[priority] ?? 'bg-gray-100 text-gray-600'}`}>
			{priority}
		</span>
	);
};

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="My Tasks">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

const STATUSES = ['all', 'pending', 'in-progress', 'done'];

// ─── Main Component ────────────────────────────────────────────────────────────

const MyTasks = () => {
	const navigate       = useNavigate();
	const { user }       = useContext(UserContext);

	const [tasks,    setTasks]    = useState([]);
	const [loading,  setLoading]  = useState(true);
	const [status,   setStatus]   = useState('all');
	const [search,   setSearch]   = useState('');

	useEffect(() => {
    (async () => {
        try {
            const projRes  = await axiosInstance.get(API_PATHS.Project.GET_ALL_PROJECTS);
            const projects = Array.isArray(projRes.data)
                ? projRes.data
                : projRes.data.projects ?? [];

            const taskArrays = await Promise.all(
                projects.map(async (proj) => {
                    try {
                        const res = await axiosInstance.get(API_PATHS.TASK.GET_ALL_TASKS(proj._id));
                        return (res.data.tasks ?? []).map(t => ({
                            ...t,
                            projectId:   proj._id,
                            projectName: proj.projectName,
                        }));
                    } catch {
                        return [];
                    }
                })
            );

            const myTasks = taskArrays
                .flat()
                .filter(t => {
                    const assignedId = t.assignedTo?._id?.toString() ?? t.assignedTo?.toString();
                    return assignedId === user?._id?.toString(); // ← fixed comparison
                });

            setTasks(myTasks);
        } catch {
            toast.error('Failed to load tasks.');
        } finally {
            setLoading(false);
        }
    })();
}, [user]);

	if (loading) return <LoadingSpinner />;

	// ── Stats ──────────────────────────────────────────────────────────────────
	const total      = tasks.length;
	const pending    = tasks.filter(t => t.status === 'pending').length;
	const inProgress = tasks.filter(t => t.status === 'in-progress').length;
	const done       = tasks.filter(t => t.status === 'done').length;

	// ── Filter ─────────────────────────────────────────────────────────────────
	const filtered = tasks.filter(t => {
		const matchStatus = status === 'all' || t.status === status;
		const matchSearch = !search ||
			t.title?.toLowerCase().includes(search.toLowerCase()) ||
			t.projectName?.toLowerCase().includes(search.toLowerCase());
		return matchStatus && matchSearch;
	});

	const statusCount = (s) =>
		s === 'all' ? total :
		s === 'pending' ? pending :
		s === 'in-progress' ? inProgress : done;

	return (
		<DashboardLayout activeMenuItem="My Tasks">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-6">

				{/* Header */}
				<div>
					<h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
					<p className="text-sm text-gray-500 mt-1">All tasks assigned to you</p>
				</div>

				{/* Stat Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[
						{ label: 'Total',       value: total,      color: 'text-blue-500',    bg: 'bg-blue-50',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
						{ label: 'Pending',     value: pending,    color: 'text-rose-500',    bg: 'bg-rose-50',    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
						{ label: 'In Progress', value: inProgress, color: 'text-amber-500',   bg: 'bg-amber-50',   icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
						{ label: 'Completed',   value: done,       color: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
					].map(({ label, value, color, bg, icon }) => (
						<div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
							<div className="flex items-start justify-between">
								<p className="text-sm text-gray-500">{label}</p>
								<div className={`rounded-lg p-2 ${bg}`}>
									<svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
									</svg>
								</div>
							</div>
							<p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>
						</div>
					))}
				</div>

				{/* Table Card */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm">

					{/* Toolbar */}
					<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
						{/* Status tabs */}
						<div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
							{STATUSES.map(s => (
								<button
									key={s}
									onClick={() => setStatus(s)}
									className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
										status === s
											? 'bg-white text-[#484bf2] shadow-sm'
											: 'text-gray-500 hover:text-gray-700'
									}`}
								>
									{s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
									<span className="ml-1.5 text-gray-400">{statusCount(s)}</span>
								</button>
							))}
						</div>

						{/* Search */}
						<div className="relative sm:ml-auto">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search by task or project..."
								value={search}
								onChange={e => setSearch(e.target.value)}
								className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] w-64"
							/>
						</div>
					</div>

					{/* Task list */}
					<div className="divide-y divide-gray-50">
						{filtered.length > 0 ? filtered.map(task => {
							const checkDone  = (task.checklist ?? []).filter(c => c.completed).length;
							const checkTotal = (task.checklist ?? []).length;
							const isOverdue  = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

							return (
								<div
									key={task._id}
									onClick={() => navigate(`/employee/tasks/${task._id}`, { state: { task } })}
									className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer group"
								>
									{/* Priority stripe */}
									<div className={`mt-1 w-1 h-10 rounded-full shrink-0 ${
										task.priority === 'urgent' ? 'bg-purple-400' :
										task.priority === 'high'   ? 'bg-rose-400' :
										task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
									}`} />

									{/* Main content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<p className="text-sm font-semibold text-gray-800 group-hover:text-[#484bf2] transition-colors">
												{task.title}
											</p>
											{isOverdue && (
												<span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
													OVERDUE
												</span>
											)}
										</div>
										<div className="flex items-center gap-3 mt-1 flex-wrap">
											<span className="text-xs text-gray-400">{task.projectName}</span>
											{task.dueDate && (
												<span className={`text-xs ${isOverdue ? 'text-rose-500 font-medium' : 'text-gray-400'}`}>
													Due {new Date(task.dueDate).toLocaleDateString()}
												</span>
											)}
											{checkTotal > 0 && (
												<span className="text-xs text-gray-400">
													{checkDone}/{checkTotal} checklist
												</span>
											)}
										</div>
									</div>

									{/* Badges */}
									<div className="flex items-center gap-2 shrink-0">
										<PriorityBadge priority={task.priority} />
										<StatusBadge status={task.status} />
										<svg className="w-4 h-4 text-gray-300 group-hover:text-[#484bf2] transition-colors"
											fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							);
						}) : (
							<div className="px-6 py-16 text-center">
								<svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
								<p className="text-sm text-gray-400">
									{search || status !== 'all' ? 'No tasks match your filters' : 'No tasks assigned to you yet'}
								</p>
							</div>
						)}
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

export default MyTasks;