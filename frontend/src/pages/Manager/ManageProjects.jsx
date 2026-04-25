import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

// ─── Reusable UI ───────────────────────────────────────────────────────────────

const Th = ({ children }) => (
	<th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
		{children}
	</th>
);

const Td = ({ children, className = '' }) => (
	<td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

const StatCard = ({ label, value, accent, icon }) => (
	<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
		<div className="flex items-start justify-between">
			<p className="text-sm text-gray-500">{label}</p>
			<div className={`rounded-lg p-2 ${accent}`}>{icon}</div>
		</div>
		<p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>
	</div>
);

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

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="Projects">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const ManageProjects = () => {
	const navigate = useNavigate();
	const [projects, setProjects] = useState([]);
	const [loading,  setLoading]  = useState(true);
	const [search,   setSearch]   = useState('');

	useEffect(() => {
		(async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.Project.GET_ALL_PROJECTS);
				const list = Array.isArray(res.data) ? res.data : res.data.projects ?? [];
				setProjects(list);
			} catch {
				toast.error('Failed to load projects. Please try again.');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <LoadingSpinner />;

	const total      = projects.length;
	const pending    = projects.filter(p => p.status === 'pending').length;
	const inProgress = projects.filter(p => p.status === 'in-progress').length;
	const completed  = projects.filter(p => p.status === 'done').length;

	const filtered = projects.filter(p => {
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			p.projectName?.toLowerCase().includes(q) ||
			p.description?.toLowerCase().includes(q) ||
			p.status?.toLowerCase().includes(q)
		);
	});

	return (
		<DashboardLayout activeMenuItem="Projects">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-8">

				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
						<p className="text-sm text-gray-500 mt-1">View and manage projects assigned to your teams</p>
					</div>
					<button
						onClick={() => navigate('/manager/projects/create')}
						className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Create Project
					</button>
				</div>

				{/* Stat Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Total Projects" value={total} accent="bg-blue-50"
						icon={<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
					/>
					<StatCard label="Pending" value={pending} accent="bg-rose-50"
						icon={<svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
					/>
					<StatCard label="In Progress" value={inProgress} accent="bg-amber-50"
						icon={<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
					/>
					<StatCard label="Completed" value={completed} accent="bg-emerald-50"
						icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
					/>
				</div>

				{/* Table Card */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm">

					{/* Search Row */}
					<div className="p-5 border-b border-gray-100 flex items-center justify-between">
						<p className="text-sm font-semibold text-gray-700">All Projects</p>
						<div className="relative">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search projects..."
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
									<Th>Project</Th>
									<Th>Status</Th>
									<Th>Team</Th>
									<Th>End Date</Th>
									<Th>Created</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{filtered.length > 0 ? filtered.map((project, i) => (
									<tr key={project._id ?? i} className="hover:bg-gray-50 transition-colors">
										<Td>
											{/* Clicking the project name goes to the detail page */}
											<button
												onClick={() => navigate(`/manager/projects/${project._id}`)}
												className="text-left group"
											>
												<p className="font-medium text-gray-800 group-hover:text-[#484bf2] transition-colors">
													{project.projectName}
												</p>
												{project.description && (
													<p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
														{project.description}
													</p>
												)}
											</button>
										</Td>
										<Td>
											<StatusBadge status={project.status} />
										</Td>
										<Td className="text-gray-500">
											{project.teamId?.name ?? project.teamId?.teamName ?? '—'}
										</Td>
										<Td className="text-gray-400 text-xs">
											{project.endDate
												? new Date(project.endDate).toLocaleDateString()
												: '—'}
										</Td>
										<Td className="text-gray-400 text-xs">
											{project.createdAt
												? new Date(project.createdAt).toLocaleDateString()
												: '—'}
										</Td>
										<Td>
											<div className="flex items-center gap-3">
												<button
													onClick={() => navigate(`/manager/projects/${project._id}`)}
													className="text-xs text-[#484bf2] hover:underline font-medium"
												>
													View
												</button>
												<button
													onClick={() => navigate(`/manager/projects/edit/${project._id}`)}
													className="text-xs text-gray-500 hover:underline font-medium"
												>
													Edit
												</button>
											</div>
										</Td>
									</tr>
								)) : (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
											{search ? `No projects found matching "${search}"` : 'No projects found'}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{filtered.length > 0 && (
						<div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
							Showing {filtered.length} of {total} project{total !== 1 ? 's' : ''}
						</div>
					)}
				</div>

			</div>
		</DashboardLayout>
	);
};

export default ManageProjects;