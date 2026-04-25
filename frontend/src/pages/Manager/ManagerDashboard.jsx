import { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
	PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

// ─── Reusable pieces ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
	const styles = {
		done: 'bg-emerald-100 text-emerald-700',
		'in-progress': 'bg-amber-100   text-amber-700',
		pending: 'bg-rose-100    text-rose-700',
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
		high: 'bg-rose-100   text-rose-700',
		medium: 'bg-amber-100  text-amber-700',
		low: 'bg-emerald-100 text-emerald-700',
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

const EmptyRow = ({ cols, message = 'No data available' }) => (
	<tr>
		<td colSpan={cols} className="px-6 py-8 text-center text-sm text-gray-400">{message}</td>
	</tr>
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

const ManagerDashboard = () => {
	const { user } = useUserAuth();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.DASHBOARD.MANAGER);
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

	// ── Map backend shape → local variables ──────────────────────────────────
	// Backend returns: data.stats.{ totalTeams, totalProjects, totalTasks,
	//   pendingTasks, inProgressTasks, completedTasks,
	//   taskCompletionRate, projectCompletionRate,
	//   projectProgress: { pending, inProgress, completed } }
	// Backend returns: data.recentTasks[]

	const stats = data.stats ?? {};
	const recentTasks = data.recentTasks ?? [];
	const taskTotal = stats.totalTasks || 1;

	const projectStatusData = [
		{ name: 'Pending', value: stats.projectProgress?.pending ?? 0, color: '#F43F5E' },
		{ name: 'In Progress', value: stats.projectProgress?.inProgress ?? 0, color: '#F59E0B' },
		{ name: 'Completed', value: stats.projectProgress?.completed ?? 0, color: '#10B981' },
	];

	const taskPriorityData = [
		{ name: 'Low', value: 0, color: '#10B981' },
		{ name: 'Medium', value: 0, color: '#F59E0B' },
		{ name: 'High', value: 0, color: '#EF4444' },
		{ name: 'Urgent', value: 0, color: '#8B5CF6' },
	];

	// Count priorities from recentTasks (approximation from available data)
	recentTasks.forEach(task => {
		const entry = taskPriorityData.find(p => p.name.toLowerCase() === task.priority?.toLowerCase());
		if (entry) entry.value += 1;
	});

	return (
		<DashboardLayout activeMenuItem="Dashboard">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-8">

				{/* Header */}
				<div>
					<h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
					<p className="text-sm text-gray-500 mt-1">Welcome back, {user?.fullName}</p>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						label="My Teams"
						value={stats.totalTeams ?? 0}
						accent="bg-blue-50"
						icon={
							<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						}
						sub={<span>{stats.totalProjects ?? 0} projects across teams</span>}
					/>
					<StatCard
						label="Total Projects"
						value={stats.totalProjects ?? 0}
						accent="bg-purple-50"
						icon={
							<svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
						}
						sub={<span>{stats.projectProgress?.completed ?? 0} completed</span>}
					/>
					<StatCard
						label="Total Tasks"
						value={stats.totalTasks ?? 0}
						accent="bg-amber-50"
						icon={
							<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						}
						sub={
							<div className="space-y-1">
								<div className="w-full bg-gray-100 rounded-full h-1.5">
									<div className="bg-emerald-500 h-1.5 rounded-full"
										style={{ width: `${stats.taskCompletionRate ?? 0}%` }} />
								</div>
								<span>{stats.taskCompletionRate ?? 0}% completion rate</span>
							</div>
						}
					/>
					<StatCard
						label="Project Completion"
						value={`${stats.projectCompletionRate ?? 0}%`}
						accent="bg-emerald-50"
						icon={
							<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						}
						sub={<span>{stats.projectProgress?.completed ?? 0} of {stats.totalProjects ?? 0} done</span>}
					/>
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<SectionCard title="Tasks by Priority">
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={taskPriorityData} barSize={36}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis dataKey="name" tick={{ fontSize: 12 }} />
									<YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
									<Tooltip />
									<Bar dataKey="value" radius={[4, 4, 0, 0]}>
										{taskPriorityData.map((entry, i) => (
											<Cell key={i} fill={entry.color} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</SectionCard>

					<SectionCard title="Project Status Overview">
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={projectStatusData}
										cx="50%" cy="50%"
										outerRadius={80}
										dataKey="value"
										labelLine={false}
										label={({ cx, cy, midAngle, outerRadius, name, percent }) => {
											if (percent === 0) return null;
											const RADIAN = Math.PI / 180;
											const radius = outerRadius + 30;
											const x = cx + radius * Math.cos(-midAngle * RADIAN);
											const y = cy + radius * Math.sin(-midAngle * RADIAN);
											return (
												<text
													x={x}
													y={y}
													fill="#374151"
													textAnchor={x > cx ? 'start' : 'end'}
													dominantBaseline="central"
													fontSize={12}
												>
													{`${name} ${(percent * 100).toFixed(0)}%`}
												</text>
											);
										}}
									>
										{projectStatusData.map((entry, i) => (
											<Cell key={i} fill={entry.color} />
										))}
									</Pie>
									<Tooltip formatter={(value, name) => [value, name]} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</SectionCard>
				</div>

				{/* Status Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<SectionCard title="Task Status">
						<div className="space-y-4">
							<ProgressBar label="Pending" value={stats.pendingTasks ?? 0} total={taskTotal} color="bg-rose-400" />
							<ProgressBar label="In Progress" value={stats.inProgressTasks ?? 0} total={taskTotal} color="bg-amber-400" />
							<ProgressBar label="Completed" value={stats.completedTasks ?? 0} total={taskTotal} color="bg-emerald-500" />
						</div>
					</SectionCard>

					<SectionCard title="Project Status">
						<div className="divide-y divide-gray-100">
							{[
								{ label: 'Pending', value: stats.projectProgress?.pending ?? 0, color: 'text-rose-500' },
								{ label: 'In Progress', value: stats.projectProgress?.inProgress ?? 0, color: 'text-amber-500' },
								{ label: 'Completed', value: stats.projectProgress?.completed ?? 0, color: 'text-emerald-600' },
							].map(({ label, value, color }) => (
								<div key={label} className="flex justify-between items-center py-3">
									<span className="text-sm text-gray-600">{label}</span>
									<span className={`text-lg font-bold ${color}`}>{value}</span>
								</div>
							))}
						</div>
					</SectionCard>
				</div>

				{/* Recent Tasks Table */}
				<SectionCard title="Recent Tasks">
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead>
								<tr className="border-b border-gray-100">
									<Th>Task</Th>
									<Th>Project</Th>
									<Th>Status</Th>
									<Th>Priority</Th>
									<Th>Created</Th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{recentTasks.length > 0 ? recentTasks.map((task, i) => (
									<tr key={i} className="hover:bg-gray-50 transition-colors">
										<Td className="font-medium text-gray-800">{task.taskName}</Td>
										<Td className="text-gray-500">{task.projectName ?? '—'}</Td>
										<Td><StatusBadge status={task.status} /></Td>
										<Td><PriorityBadge priority={task.priority} /></Td>
										<Td className="text-gray-400 text-xs">
											{new Date(task.createdOn).toLocaleDateString()}
										</Td>
									</tr>
								)) : (
									<EmptyRow cols={5} message="No recent tasks available" />
								)}
							</tbody>
						</table>
					</div>
				</SectionCard>

			</div>
		</DashboardLayout>
	);
};

export default ManagerDashboard;