import { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const StatusBadge = ({ status }) => {
	const styles = {
		done:          'bg-emerald-100 text-emerald-700',
		'in-progress': 'bg-amber-100   text-amber-700',
		pending:       'bg-rose-100    text-rose-700',
	};
	const labels = { done: 'Done', 'in-progress': 'In Progress', pending: 'Pending' };
	return (
		<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
			{labels[status] ?? status}
		</span>
	);
};

const PriorityBadge = ({ priority }) => {
	const styles = {
		urgent: 'bg-purple-100 text-purple-700',
		high:   'bg-rose-100   text-rose-700',
		medium: 'bg-amber-100  text-amber-700',
		low:    'bg-emerald-100 text-emerald-700',
	};
	return (
		<span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[priority] ?? 'bg-gray-100 text-gray-600'}`}>
			{priority}
		</span>
	);
};

const StatCard = ({ label, value, sub, icon, accent }) => (
	<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
		<div className="flex items-start justify-between">
			<p className="text-sm text-gray-500">{label}</p>
			<div className={`rounded-lg p-2 ${accent}`}>{icon}</div>
		</div>
		<p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>
		{sub && <div className="text-xs text-gray-500">{sub}</div>}
	</div>
);

const ProgressBar = ({ label, value, total, color }) => {
	const pct = total > 0 ? Math.round((value / total) * 100) : 0;
	return (
		<div className="space-y-1">
			<div className="flex justify-between text-sm text-gray-600">
				<span>{label}</span>
				<span className="font-medium">{value}</span>
			</div>
			<div className="w-full bg-gray-100 rounded-full h-2">
				<div className={`${color} rounded-full h-2 transition-all`} style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
};

const SectionCard = ({ title, children, className = '' }) => (
	<div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 ${className}`}>
		<h2 className="text-base font-semibold text-gray-800 mb-5">{title}</h2>
		{children}
	</div>
);

const Th = ({ children }) => (
	<th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
		{children}
	</th>
);

const Td = ({ children, className = '' }) => (
	<td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="Dashboard">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600" />
		</div>
	</DashboardLayout>
);

// ─── Main component ────────────────────────────────────────────────────────────

const EmployeeDashboard = () => {
	const { user } = useUserAuth();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.DASHBOARD.EMPLOYEE);
				if (res.data.success) {
					setData(res.data.dashboard);
				} else {
					toast.error('Failed to load dashboard data');
				}
			} catch {
				toast.error('Failed to load dashboard data. Please try again later.');
			} finally {
				setLoading(false);
			}
		};
		fetchDashboard();
	}, []);

	if (loading) return <LoadingSpinner />;

	if (!data) {
		return (
			<DashboardLayout activeMenuItem="Dashboard">
				<div className="flex items-center justify-center h-60 text-gray-400 text-sm">
					No data available
				</div>
			</DashboardLayout>
		);
	}

	// Backend returns: data.stats.{ totalTasks, pendingTasks, inProgressTasks, completedTasks, completionRate }
	// Backend returns: data.recentTasks[]

	const stats       = data.stats       ?? {};
	const recentTasks = data.recentTasks ?? [];
	const taskTotal   = stats.totalTasks || 1;

	return (
		<DashboardLayout activeMenuItem="Dashboard">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-8">

				{/* Header */}
				<div>
					<h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
					<p className="text-sm text-gray-500 mt-1">Welcome back, {user?.fullName}</p>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						label="Total Tasks"
						value={stats.totalTasks ?? 0}
						accent="bg-blue-50"
						icon={
							<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						}
						sub={<span>All tasks assigned to you</span>}
					/>
					<StatCard
						label="Pending"
						value={stats.pendingTasks ?? 0}
						accent="bg-rose-50"
						icon={
							<svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
						sub={<span>Awaiting your action</span>}
					/>
					<StatCard
						label="In Progress"
						value={stats.inProgressTasks ?? 0}
						accent="bg-amber-50"
						icon={
							<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						}
						sub={<span>Currently in progress</span>}
					/>
					<StatCard
						label="Completed"
						value={stats.completedTasks ?? 0}
						accent="bg-emerald-50"
						icon={
							<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
						sub={
							<div className="space-y-1">
								<div className="w-full bg-gray-100 rounded-full h-1.5">
									<div className="bg-emerald-500 h-1.5 rounded-full"
										style={{ width: `${stats.completionRate ?? 0}%` }} />
								</div>
								<span>{stats.completionRate ?? 0}% completion rate</span>
							</div>
						}
					/>
				</div>

				{/* Task Status Progress */}
				<SectionCard title="Task Progress">
					<div className="space-y-4">
						<ProgressBar label="Pending"     value={stats.pendingTasks    ?? 0} total={taskTotal} color="bg-rose-400" />
						<ProgressBar label="In Progress" value={stats.inProgressTasks ?? 0} total={taskTotal} color="bg-amber-400" />
						<ProgressBar label="Completed"   value={stats.completedTasks  ?? 0} total={taskTotal} color="bg-emerald-500" />
					</div>
				</SectionCard>

				{/* Recent Tasks Table */}
				<SectionCard title="My Recent Tasks">
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead>
								<tr className="border-b border-gray-100">
									<Th>Task</Th>
									<Th>Status</Th>
									<Th>Priority</Th>
									<Th>Created</Th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{recentTasks.length > 0 ? recentTasks.map((task, i) => (
									<tr key={i} className="hover:bg-gray-50 transition-colors">
										<Td className="font-medium text-gray-800">{task.taskName}</Td>
										<Td><StatusBadge status={task.status} /></Td>
										<Td><PriorityBadge priority={task.priority} /></Td>
										<Td className="text-gray-400 text-xs">
											{new Date(task.createdOn).toLocaleDateString()}
										</Td>
									</tr>
								)) : (
									<tr>
										<td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
											No tasks assigned yet
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</SectionCard>

			</div>
		</DashboardLayout>
	);
};

export default EmployeeDashboard;