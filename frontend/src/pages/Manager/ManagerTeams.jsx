import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const Avatar = ({ name, size = 'md' }) => {
	const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
	return (
		<div className={`rounded-full bg-[#484bf2] flex items-center justify-center text-white font-bold shrink-0 ${sizes[size]}`}>
			{name?.charAt(0)?.toUpperCase() || '?'}
		</div>
	);
};

const StatusBadge = ({ status }) => {
	const map = {
		done: ['bg-emerald-100 text-emerald-700', 'Done'],
		'in-progress': ['bg-amber-100 text-amber-700', 'In Progress'],
		pending: ['bg-rose-100 text-rose-700', 'Pending'],
	};
	const [cls, label] = map[status] ?? ['bg-gray-100 text-gray-600', status];
	return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
};

const PriorityDot = ({ priority }) => {
	const colors = { urgent: 'bg-purple-500', high: 'bg-rose-500', medium: 'bg-amber-400', low: 'bg-emerald-500' };
	return (
		<span className="flex items-center gap-1.5 capitalize text-xs text-gray-600">
			<span className={`w-1.5 h-1.5 rounded-full ${colors[priority] ?? 'bg-gray-400'}`} />
			{priority}
		</span>
	);
};

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="My Teams">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

const EmptyState = ({ icon, title, subtitle }) => (
	<div className="flex flex-col items-center justify-center py-10 text-center gap-2">
		<div className="text-gray-200 mb-1">{icon}</div>
		<p className="text-sm font-medium text-gray-500">{title}</p>
		{subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
	</div>
);

// ─── Team Card ─────────────────────────────────────────────────────────────────

const TeamCard = ({ team, isSelected, onClick }) => (
	<button
		onClick={onClick}
		className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected
			? 'border-[#484bf2] bg-[#484bf2]/5 shadow-sm'
			: 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
			}`}
	>
		<div className="flex items-start justify-between gap-2 mb-3">
			<div className="flex-1 min-w-0">
				<p className={`font-semibold text-sm truncate ${isSelected ? 'text-[#484bf2]' : 'text-gray-800'}`}>
					{team.name}
				</p>
				{team.description && (
					<p className="text-xs text-gray-400 mt-0.5 truncate">{team.description}</p>
				)}
			</div>
			{isSelected && (
				<div className="w-2 h-2 rounded-full bg-[#484bf2] mt-1 shrink-0" />
			)}
		</div>

		<div className="flex items-center gap-3">
			<div className="flex -space-x-1.5">
				{(team.members ?? []).slice(0, 5).map((m, i) => (
					<div
						key={i}
						className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-[9px] font-bold"
					>
						{m.fullName?.charAt(0)?.toUpperCase() || '?'}
					</div>
				))}
				{(team.members?.length ?? 0) > 5 && (
					<div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-[9px] font-bold">
						+{team.members.length - 5}
					</div>
				)}
			</div>
			<span className="text-xs text-gray-400">
				{team.members?.length ?? 0} member{team.members?.length !== 1 ? 's' : ''}
			</span>
		</div>
	</button>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const ManagerTeams = () => {
	const navigate = useNavigate();
	const { user } = useContext(UserContext);

	const [teams, setTeams] = useState([]);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [projects, setProjects] = useState([]);
	const [memberTasks, setMemberTasks] = useState({});
	const [loadingTeams, setLoadingTeams] = useState(true);
	const [loadingDetail, setLoadingDetail] = useState(false);
	const [activeTab, setActiveTab] = useState('members');

	const selectTeam = async (team) => {
		setSelectedTeam(team);
		setActiveTab('members');
		setLoadingDetail(true);
		setProjects([]);
		setMemberTasks({});

		try {
			const projRes = await axiosInstance.get(API_PATHS.Project.GET_ALL_PROJECTS);
			const allProj = Array.isArray(projRes.data) ? projRes.data : projRes.data.projects ?? [];
			const teamProj = allProj.filter(p =>
				(p.teamId?._id ?? p.teamId) === team._id
			);
			setProjects(teamProj);

			const taskMap = {};
			await Promise.all(
				teamProj.map(async (proj) => {
					try {
						const taskRes = await axiosInstance.get(API_PATHS.TASK.GET_ALL_TASKS(proj._id));
						const tasks = taskRes.data.tasks ?? [];
						tasks.forEach(task => {
							const memberId = task.assignedTo?._id ?? task.assignedTo;
							if (!memberId) return;
							if (!taskMap[memberId]) taskMap[memberId] = [];
							taskMap[memberId].push({ ...task, projectName: proj.projectName });
						});
					} catch { /* skip failed project */ }
				})
			);
			setMemberTasks(taskMap);
		} catch {
			toast.error('Failed to load team details.');
		} finally {
			setLoadingDetail(false);
		}
	};

	useEffect(() => {
		(async () => {
			try {
				const res = await axiosInstance.get(API_PATHS.TEAM.GET_MY_TEAMS);
				const mine = res.data.teams ?? [];
				setTeams(mine); 
				if (mine.length > 0) selectTeam(mine[0]);
			} catch {
				toast.error('Failed to load teams.');
			} finally {
				setLoadingTeams(false);
			}
		})();
	}, [user]);

	if (loadingTeams) return <LoadingSpinner />;

	const allTasks = Object.values(memberTasks).flat();
	const tasksDone = allTasks.filter(t => t.status === 'done').length;
	const tasksActive = allTasks.filter(t => t.status === 'in-progress').length;

	return (
		<DashboardLayout activeMenuItem="My Teams">
			<div className="py-8 px-1 bg-gray-50 min-h-screen">

				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-800">My Teams</h1>
					<p className="text-sm text-gray-500 mt-1">
						{teams.length === 0
							? 'You are not managing any teams yet'
							: `Managing ${teams.length} team${teams.length !== 1 ? 's' : ''}`}
					</p>
				</div>

				{teams.length === 0 ? (
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
						<EmptyState
							icon={
								<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
										d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" />
								</svg>
							}
							title="No teams assigned"
							subtitle="Ask HR to assign you as a manager to a team"
						/>
					</div>
				) : (
					<div className="flex gap-5 items-start">

						{/* ── Left: Team List ───────────────────────────────────────────── */}
						<div className="w-64 shrink-0 space-y-2">
							<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-3">
								Teams
							</p>
							{teams.map(team => (
								<TeamCard
									key={team._id}
									team={team}
									isSelected={selectedTeam?._id === team._id}
									onClick={() => selectTeam(team)}
								/>
							))}
						</div>

						{/* ── Right: Team Detail ────────────────────────────────────────── */}
						<div className="flex-1 min-w-0 space-y-5">

							{selectedTeam && (
								<>
									{/* Team header */}
									<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
										<div className="flex items-start justify-between">
											<div>
												<h2 className="text-lg font-bold text-gray-800">{selectedTeam.name}</h2>
												{selectedTeam.description && (
													<p className="text-sm text-gray-500 mt-1">{selectedTeam.description}</p>
												)}
											</div>
										</div>

										{!loadingDetail && (
											<div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-50">
												{[
													{ label: 'Members', value: selectedTeam.members?.length ?? 0, color: 'text-[#484bf2]' },
													{ label: 'Projects', value: projects.length, color: 'text-blue-500' },
													{ label: 'Tasks Done', value: tasksDone, color: 'text-emerald-500' },
													{ label: 'Active', value: tasksActive, color: 'text-amber-500' },
												].map(({ label, value, color }) => (
													<div key={label} className="text-center">
														<p className={`text-2xl font-bold ${color}`}>{value}</p>
														<p className="text-xs text-gray-400 mt-0.5">{label}</p>
													</div>
												))}
											</div>
										)}
									</div>

									{/* Tabs */}
									<div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
										{['members', 'projects'].map(tab => (
											<button
												key={tab}
												onClick={() => setActiveTab(tab)}
												className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${activeTab === tab
													? 'bg-white text-[#484bf2] shadow-sm'
													: 'text-gray-500 hover:text-gray-700'
													}`}
											>
												{tab}
												<span className="ml-1.5 text-gray-400">
													{tab === 'members' ? selectedTeam.members?.length ?? 0 : projects.length}
												</span>
											</button>
										))}
									</div>

									{/* Loading state */}
									{loadingDetail ? (
										<div className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center h-48">
											<div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#484bf2]" />
										</div>
									) : (
										<>
											{/* ── Members Tab ────────────────────────────────────────── */}
											{activeTab === 'members' && (
												<div className="space-y-3">
													{(selectedTeam.members ?? []).length === 0 ? (
														<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
															<EmptyState
																icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
																title="No members in this team"
																subtitle="Ask HR to add members to this team"
															/>
														</div>
													) : (
														(selectedTeam.members ?? []).map(member => {
															const tasks = memberTasks[member._id] ?? [];
															const done = tasks.filter(t => t.status === 'done').length;

															return (
																<div key={member._id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
																	{/* Member header */}
																	<div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
																		<div className="flex items-center gap-3">
																			<Avatar name={member.fullName} size="md" />
																			<div>
																				<p className="text-sm font-semibold text-gray-800">{member.fullName}</p>
																				<p className="text-xs text-gray-400">{member.email}</p>
																			</div>
																		</div>
																		<div className="text-right">
																			<p className="text-xs text-gray-400">
																				{tasks.length} task{tasks.length !== 1 ? 's' : ''}
																				{tasks.length > 0 && (
																					<span className="ml-1 text-emerald-500">· {done} done</span>
																				)}
																			</p>
																		</div>
																	</div>

																	{/* Member tasks */}
																	{tasks.length === 0 ? (
																		<div className="px-5 py-4 text-xs text-gray-400 text-center">
																			No tasks assigned
																		</div>
																	) : (
																		<div className="divide-y divide-gray-50">
																			{tasks.map(task => {
																				const projectId = task.projectId?._id ?? task.projectId;
																				return (
																					<div
																						key={task._id}
																						onClick={() => navigate(`/manager/projects/${projectId}/tasks/${task._id}`)}
																						className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
																					>
																						<div className="flex-1 min-w-0">
																							<p className="text-sm text-gray-700 font-medium truncate">{task.title}</p>
																							<p className="text-xs text-gray-400 mt-0.5 truncate">
																								{task.projectName}
																								{task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
																							</p>
																						</div>
																						<div className="flex items-center gap-3 shrink-0">
																							<PriorityDot priority={task.priority} />
																							<StatusBadge status={task.status} />
																							{/* Stop propagation so Edit doesn't also trigger row navigation */}
																							<button
																								onClick={e => {
																									e.stopPropagation();
																									navigate(`/manager/projects/${projectId}/tasks/${task._id}/edit`);
																								}}
																								className="text-xs text-[#484bf2] hover:underline font-medium"
																							>
																								Edit
																							</button>
																						</div>
																					</div>
																				);
																			})}
																		</div>
																	)}
																</div>
															);
														})
													)}
												</div>
											)}

											{/* ── Projects Tab ───────────────────────────────────────── */}
											{activeTab === 'projects' && (
												<div className="space-y-3">
													{projects.length === 0 ? (
														<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
															<EmptyState
																icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
																title="No projects for this team"
																subtitle="Create a project and assign it to this team"
															/>
														</div>
													) : (
														projects.map(project => {
															const projTasks = Object.values(memberTasks).flat()
																.filter(t => t.projectName === project.projectName);
															const projDone = projTasks.filter(t => t.status === 'done').length;
															const progress = projTasks.length > 0
																? Math.round((projDone / projTasks.length) * 100)
																: 0;

															return (
																<div
																	key={project._id}
																	className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-colors"
																>
																	<div className="flex items-start justify-between gap-4">
																		<div className="flex-1 min-w-0">
																			<div className="flex items-center gap-2 mb-1">
																				<p className="font-semibold text-gray-800 text-sm">{project.projectName}</p>
																				<StatusBadge status={project.status} />
																			</div>
																			{project.description && (
																				<p className="text-xs text-gray-400 truncate">{project.description}</p>
																			)}
																		</div>
																		<button
																			onClick={() => navigate(`/manager/projects/${project._id}`)}
																			className="text-xs text-[#484bf2] hover:underline font-medium shrink-0"
																		>
																			View
																		</button>
																	</div>

																	{projTasks.length > 0 && (
																		<div className="mt-3">
																			<div className="flex justify-between text-xs text-gray-400 mb-1">
																				<span>{projDone}/{projTasks.length} tasks done</span>
																				<span>{progress}%</span>
																			</div>
																			<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
																				<div
																					className="h-full bg-[#484bf2] rounded-full transition-all"
																					style={{ width: `${progress}%` }}
																				/>
																			</div>
																		</div>
																	)}

																	{(project.startDate || project.endDate) && (
																		<div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
																			{project.startDate && (
																				<span className="text-xs text-gray-400">
																					Start: {new Date(project.startDate).toLocaleDateString()}
																				</span>
																			)}
																			{project.endDate && (
																				<span className="text-xs text-gray-400">
																					End: {new Date(project.endDate).toLocaleDateString()}
																				</span>
																			)}
																		</div>
																	)}
																</div>
															);
														})
													)}
												</div>
											)}
										</>
									)}
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
};

export default ManagerTeams;