import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

// ─── Reusable UI ───────────────────────────────────────────────────────────────

const Avatar = ({ name }) => (
	<div className="w-7 h-7 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-xs font-bold shrink">
		{name?.charAt(0)?.toUpperCase() || '?'}
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

const StatCard = ({ label, value, accent, icon }) => (
	<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
		<div className="flex items-start justify-between">
			<p className="text-sm text-gray-500">{label}</p>
			<div className={`rounded-lg p-2 ${accent}`}>{icon}</div>
		</div>
		<p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>
	</div>
);

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="Teams">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const ManageTeams = () => {
	const navigate = useNavigate();
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');

	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.TEAM.GET_ALL_TEAMS);
				const list = Array.isArray(res.data) ? res.data : res.data.teams ?? [];
				setTeams(list);
			} catch {
				toast.error('Failed to load teams. Please try again.');
			} finally {
				setLoading(false);
			}
		};
		fetchTeams();
	}, []);

	if (loading) return <LoadingSpinner />;

	const total = teams.length;
	const withManager = teams.filter(t => t.managerId).length;
	const withoutManager = total - withManager;
	const totalMembers = teams.reduce((acc, t) => acc + (t.members?.length ?? 0), 0);

	const filtered = teams.filter(t => {
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			t.name?.toLowerCase().includes(q) ||
			t.managerId?.fullName?.toLowerCase().includes(q) ||
			t.description?.toLowerCase().includes(q)
		);
	});

	return (
		<DashboardLayout activeMenuItem="Teams">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-8">

				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Manage Teams</h1>
						<p className="text-sm text-gray-500 mt-1">View and manage all teams in your organization</p>
					</div>
					<button
						onClick={() => navigate('/hr/teams/create')}
						className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Create Team
					</button>
				</div>

				{/* Stat Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Total Teams" value={total} accent="bg-blue-50"
						icon={<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>}
					/>
					<StatCard label="Total Members" value={totalMembers} accent="bg-emerald-50"
						icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
					/>
					<StatCard label="With Manager" value={withManager} accent="bg-amber-50"
						icon={<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
					/>
					<StatCard label="No Manager" value={withoutManager} accent="bg-rose-50"
						icon={<svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
					/>
				</div>

				{/* Table Card */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm">

					{/* Search Row */}
					<div className="p-5 border-b border-gray-100 flex items-center justify-between">
						<p className="text-sm font-semibold text-gray-700">All Teams</p>
						<div className="relative">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search teams..."
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
									<Th>Team</Th>
									<Th>Manager</Th>
									<Th>Members</Th>
									<Th>Created</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{filtered.length > 0 ? filtered.map((team, i) => (
									<tr
										key={team._id ?? i}
										onClick={() => navigate(`/hr/teams/${team._id}`)}
										className="hover:bg-gray-50 transition-colors cursor-pointer"
									>
										<Td>
											<div>
												<p className="font-medium text-gray-800">{team.name}</p>
												{team.description && (
													<p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{team.description}</p>
												)}
											</div>
										</Td>
										<Td>
											{team.managerId ? (
												<div className="flex items-center gap-2">
													<Avatar name={team.managerId.fullName} />
													<span className="text-gray-700">{team.managerId.fullName}</span>
												</div>
											) : (
												<span className="text-xs text-rose-400 font-medium">No Manager</span>
											)}
										</Td>
										<Td>
											<div className="flex items-center gap-1">
												<div className="flex -space-x-1">
													{(team.members ?? []).slice(0, 4).map((m, idx) => (
														<div key={idx}
															className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-[10px] font-bold">
															{m.fullName?.charAt(0)?.toUpperCase() || '?'}
														</div>
													))}
												</div>
												{(team.members?.length ?? 0) > 4 && (
													<span className="text-xs text-gray-400 ml-1">+{team.members.length - 4}</span>
												)}
												{(team.members?.length ?? 0) === 0 && (
													<span className="text-xs text-gray-400">No members</span>
												)}
												{(team.members?.length ?? 0) > 0 && (
													<span className="text-xs text-gray-500 ml-1">{team.members.length}</span>
												)}
											</div>
										</Td>
										<Td className="text-gray-400 text-xs">
											{team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'}
										</Td>
										<Td onClick={e => e.stopPropagation()}>
											<button
												onClick={() => navigate(`/hr/teams/edit/${team._id}`)}
												className="text-xs text-[#484bf2] hover:underline font-medium"
											>
												Edit
											</button>
										</Td>
									</tr>
								)) : (
									<tr>
										<td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
											{search ? `No teams found matching "${search}"` : 'No teams found'}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{filtered.length > 0 && (
						<div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
							Showing {filtered.length} of {total} teams
						</div>
					)}
				</div>

			</div>
		</DashboardLayout>
	);
};

export default ManageTeams;