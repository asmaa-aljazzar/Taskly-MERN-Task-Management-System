import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const RoleBadge = ({ role }) => {
	const map = {
		hr:       'bg-[#eeeeff] text-[#484bf2]',
		manager:  'bg-amber-100 text-amber-700',
		employee: 'bg-emerald-100 text-emerald-700',
	};
	const labels = { hr: 'HR', manager: 'Manager', employee: 'Employee' };
	return (
		<span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
			{labels[role] ?? role}
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
	<DashboardLayout activeMenuItem="Teams">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

const TeamDetails = () => {
	const navigate    = useNavigate();
	const { id }      = useParams();

	const [team,     setTeam]     = useState(null);
	const [fetching, setFetching] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.TEAM.GET_TEAM_BY_ID(id));
				setTeam(res.data.team);
			} catch {
				toast.error('Failed to load team.');
				navigate('/hr/teams');
			} finally {
				setFetching(false);
			}
		})();
	}, [id, navigate]);

	if (fetching) return <LoadingSpinner />;
	if (!team)    return null;

	const fmt = (d) => d ? new Date(d).toLocaleDateString() : null;

	return (
		<DashboardLayout activeMenuItem="Teams">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-6">

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate('/hr/teams')}
							className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
							{team.description && (
								<p className="text-sm text-gray-500 mt-0.5">{team.description}</p>
							)}
						</div>
					</div>
					<button
						onClick={() => navigate(`/hr/teams/edit/${id}`)}
						className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit Team
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

					{/* Left: Members list */}
					<div className="lg:col-span-2 space-y-4">

						{/* Stats row */}
						<div className="grid grid-cols-3 gap-4">
							{[
								{ label: 'Total Members', value: team.members?.length ?? 0,  color: 'text-[#484bf2]', bg: 'bg-[#eeeeff]' },
								{ label: 'Created',       value: fmt(team.createdAt),          color: 'text-gray-700', bg: 'bg-gray-50' },
							].map(({ label, value, color, bg }) => (
								<div key={label} className={`${bg} rounded-xl p-4`}>
									<p className="text-xs text-gray-500 mb-1">{label}</p>
									<p className={`text-lg font-bold ${color}`}>{value}</p>
								</div>
							))}
						</div>

						{/* Members */}
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
							<div className="px-5 py-4 border-b border-gray-100">
								<p className="text-sm font-semibold text-gray-700">
									Members
									<span className="ml-2 text-xs font-normal text-gray-400">
										{team.members?.length ?? 0}
									</span>
								</p>
							</div>

							{!team.members?.length ? (
								<div className="px-5 py-10 text-center text-sm text-gray-400">
									No members in this team yet.
								</div>
							) : (
								<ul className="divide-y divide-gray-50">
									{team.members.map(member => (
										<li key={member._id} className="px-5 py-3.5 flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-9 h-9 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-sm font-bold shrink-0">
													{member.fullName?.charAt(0)?.toUpperCase() || '?'}
												</div>
												<div>
													<p className="text-sm font-medium text-gray-800">{member.fullName}</p>
													<p className="text-xs text-gray-400">{member.email}</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												{member.phoneNumber && (
													<span className="text-xs text-gray-400 hidden sm:block">{member.phoneNumber}</span>
												)}
												<RoleBadge role={member.role} />
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* Right: Manager + Info */}
					<div className="space-y-6">

						{/* Manager card */}
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
							<h2 className="text-sm font-semibold text-gray-700 mb-4">Manager</h2>
							{team.managerId ? (
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
										{team.managerId.fullName?.charAt(0)?.toUpperCase() || '?'}
									</div>
									<div>
										<p className="text-sm font-medium text-gray-800">{team.managerId.fullName}</p>
										{team.managerId.email && (
											<p className="text-xs text-gray-400">{team.managerId.email}</p>
										)}
									</div>
								</div>
							) : (
								<div className="flex items-center gap-2 text-rose-400">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									<span className="text-sm">No manager assigned</span>
								</div>
							)}
						</div>

						{/* Team info */}
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
							<h2 className="text-sm font-semibold text-gray-700 mb-4">Team Info</h2>
							<InfoRow label="Team Name" value={team.name} />
							<InfoRow label="Members"   value={team.members?.length ?? 0} />
							<InfoRow label="Created"   value={fmt(team.createdAt)} />
							<InfoRow label="Updated"   value={fmt(team.updatedAt)} />
							{team.description && (
								<div className="pt-3 mt-1">
									<p className="text-xs text-gray-400 mb-1">Description</p>
									<p className="text-sm text-gray-600 leading-relaxed">{team.description}</p>
								</div>
							)}
						</div>

					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default TeamDetails;