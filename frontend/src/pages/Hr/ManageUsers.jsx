import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const RoleBadge = ({ role }) => {
	const styles = {
		hr: 'bg-[#eeeeff] text-[#484bf2]',
		manager: 'bg-amber-100 text-amber-700',
		employee: 'bg-emerald-100 text-emerald-700',
	};
	const labels = { hr: 'HR', manager: 'Manager', employee: 'Employee' };
	return (
		<span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[role] ?? 'bg-gray-100 text-gray-600'}`}>
			{labels[role] ?? role}
		</span>
	);
};

const Avatar = ({ name, imageUrl }) => {
	const initial = name?.charAt(0)?.toUpperCase() || '?';
	if (imageUrl) {
		return (
			<img
				src={imageUrl}
				alt={name}
				className="w-9 h-9 rounded-full object-cover"
				onError={(e) => { e.target.style.display = 'none'; }}
			/>
		);
	}
	return (
		<div className="w-9 h-9 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-sm font-bold shrink-0">
			{initial}
		</div>
	);
};

const Th = ({ children }) => (
	<th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
		{children}
	</th>
);

const Td = ({ children, className = '' }) => (
	<td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

const SectionCard = ({ children, className = '' }) => (
	<div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
		{children}
	</div>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	if (totalPages <= 1) return null;

	const getPages = () => {
		const pages = [];
		const delta = 2;
		const left = currentPage - delta;
		const right = currentPage + delta;

		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= left && i <= right)) {
				pages.push(i);
			}
		}

		const withEllipsis = [];
		let prev = null;
		for (const page of pages) {
			if (prev && page - prev > 1) withEllipsis.push('...');
			withEllipsis.push(page);
			prev = page;
		}
		return withEllipsis;
	};

	return (
		<div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
			<p className="text-xs text-gray-400">
				Page {currentPage} of {totalPages}
			</p>
			<div className="flex items-center gap-1">
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				{getPages().map((page, i) =>
					page === '...' ? (
						<span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">…</span>
					) : (
						<button
							key={page}
							onClick={() => onPageChange(page)}
							className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${page === currentPage
									? 'bg-[#484bf2] text-white'
									: 'text-gray-500 hover:bg-gray-100'
								}`}
						>
							{page}
						</button>
					)
				)}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
	);
};

const ROLES = ['all', 'employee', 'manager', 'hr'];
const PAGE_SIZE = 10;

const ManageUsers = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeRole, setActiveRole] = useState('all');
	const [search, setSearch] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState(null);
	const [stats, setStats] = useState({ total: 0, employees: 0, managers: 0, hrs: 0 });

	// Combined effect for fetching data based on role OR page changes
	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			try {
				const params = new URLSearchParams({ page: currentPage, limit: PAGE_SIZE });
				const url = activeRole !== 'all'
					? `${API_PATHS.USER.GET_USER_BY_ROLE(activeRole)}?${params}`
					: `${API_PATHS.USER.GET_ALL_USERS}?${params}`;

				const res = await axiosInstance.get(url);
				
				// Extract users array from response
				const usersList = res.data.users || [];
				setUsers(usersList);
				setPagination(res.data.pagination || null);
			} catch (error) {
				console.error('Error details:', error.response?.data || error.message);
				toast.error(`Failed to load users: ${error.response?.data?.message || error.message || 'Please try again.'}`);
				setUsers([]);
				setPagination(null);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [currentPage, activeRole]);

	// Fetch global stats once on mount
	useEffect(() => {
		const fetchStats = async () => {
			try {
				// Get total users count - use a larger limit to get all users or use a count endpoint
				// Since your backend might not return totalUsers correctly when filtered, let's get all users without pagination limit
				const totalRes = await axiosInstance.get(`${API_PATHS.USER.GET_ALL_USERS}?limit=1000`);
				
				// Get total count from pagination or from the users array length
				let total = totalRes.data.pagination?.totalUsers || 0;
				if (total === 0 && totalRes.data.users) {
					total = totalRes.data.users.length;
				}
				
				// For role counts, we can either use the role endpoints or filter from all users
				// Let's use the role endpoints as they're more efficient
				try {
					const [empRes, manRes, hrRes] = await Promise.all([
						axiosInstance.get(`${API_PATHS.USER.GET_USER_BY_ROLE('employee')}?limit=1`),
						axiosInstance.get(`${API_PATHS.USER.GET_USER_BY_ROLE('manager')}?limit=1`),
						axiosInstance.get(`${API_PATHS.USER.GET_USER_BY_ROLE('hr')}?limit=1`),
					]);
					
					setStats({
						total,
						employees: empRes.data.pagination?.totalUsers || 0,
						managers: manRes.data.pagination?.totalUsers || 0,
						hrs: hrRes.data.pagination?.totalUsers || 0,
					});
				} catch (error) {
					// If role endpoints fail, calculate from all users
					console.log('Role endpoints failed, calculating from all users', error);
					const allUsersRes = await axiosInstance.get(`${API_PATHS.USER.GET_ALL_USERS}?limit=1000`);
					const allUsers = allUsersRes.data.users || [];
					
					const employees = allUsers.filter(u => u.role === 'employee').length;
					const managers = allUsers.filter(u => u.role === 'manager').length;
					const hrs = allUsers.filter(u => u.role === 'hr').length;
					
					setStats({
						total: allUsers.length,
						employees,
						managers,
						hrs,
					});
				}
			} catch (error) {
				console.error('Error fetching stats:', error);
				// Set default values to avoid UI breaking
				setStats({ total: 0, employees: 0, managers: 0, hrs: 0 });
				toast.error('Failed to load user statistics');
			}
		};
		fetchStats();
	}, []);

	// Client-side search filter (applied on top of the current page)
	const filtered = search
		? users.filter(u =>
			u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			u.email?.toLowerCase().includes(search.toLowerCase())
		  )
		: users;

	const handleRoleChange = (role) => {
		if (role === activeRole) return;
		
		setActiveRole(role);
		setCurrentPage(1);
		setSearch('');
	};

	const handlePageChange = (page) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const roleCount = (role) => {
		if (role === 'all') return stats.total;
		if (role === 'employee') return stats.employees;
		if (role === 'manager') return stats.managers;
		if (role === 'hr') return stats.hrs;
		return 0;
	};

	return (
		<DashboardLayout activeMenuItem="Employees">
			<div className="py-8 px-1 bg-gray-50 min-h-screen space-y-8">

				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
						<p className="text-sm text-gray-500 mt-1">View and manage all employees, managers, and HR staff</p>
					</div>
					<button
						onClick={() => navigate('/hr/employees/create')}
						className="flex items-center gap-2 bg-[#484bf2] hover:bg-[#3a3dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Create Employee
					</button>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Total Users" value={stats.total} accent="bg-blue-50"
						icon={<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>}
					/>
					<StatCard label="Employees" value={stats.employees} accent="bg-emerald-50"
						icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
					/>
					<StatCard label="Managers" value={stats.managers} accent="bg-amber-50"
						icon={<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
					/>
					<StatCard label="HR Staff" value={stats.hrs} accent="bg-[#eeeeff]"
						icon={<svg className="w-5 h-5 text-[#484bf2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
					/>
				</div>

				<SectionCard>
					<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
						<div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
							{ROLES.map(role => (
								<button
									key={role}
									onClick={() => handleRoleChange(role)}
									className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${activeRole === role
											? 'bg-white text-[#484bf2] shadow-sm'
											: 'text-gray-500 hover:text-gray-700'
										}`}
								>
									{role === 'all' ? 'All' : role === 'hr' ? 'HR' : role.charAt(0).toUpperCase() + role.slice(1)}
									<span className="ml-1.5 text-gray-400">{roleCount(role)}</span>
								</button>
							))}
						</div>

						<div className="relative sm:ml-auto">
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search by name or email..."
								value={search}
								onChange={e => setSearch(e.target.value)}
								className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] w-64"
							/>
						</div>
					</div>

					<div className="overflow-x-auto">
						{loading ? (
							<div className="flex justify-center items-center h-48">
								<div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#484bf2]" />
							</div>
						) : (
							<table className="min-w-full">
								<thead>
									<tr className="border-b border-gray-100">
										<Th>User</Th>
										<Th>Role</Th>
										<Th>Email</Th>
										<Th>Joined</Th>
										<Th>Actions</Th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{filtered.length > 0 ? filtered.map((u, i) => (
										<tr key={u._id ?? i} className="hover:bg-gray-50 transition-colors">
											<Td>
												<div className="flex items-center gap-3">
													<Avatar name={u.fullName} imageUrl={u.profileImageUrl} />
													<span className="font-medium text-gray-800">{u.fullName}</span>
												</div>
											</Td>
											<Td><RoleBadge role={u.role} /></Td>
											<Td className="text-gray-500">{u.email}</Td>
											<Td className="text-gray-400 text-xs">
												{u.hireDate ? new Date(u.hireDate).toLocaleDateString() : '—'}
											</Td>
											<Td>
												<button
													onClick={() => navigate(`/hr/employees/edit/${u._id}`)}
													className="text-xs text-[#484bf2] hover:underline font-medium"
												>
													Edit
												</button>
											</Td>
										</tr>
									)) : (
										<tr>
											<td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
												{search ? `No users found matching "${search}"` : 'No users found'}
											</td>
										</tr>
									)}
								</tbody>
							</table>
						)}
					</div>

					{!loading && pagination && pagination.totalPages > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={pagination.totalPages}
							onPageChange={handlePageChange}
						/>
					)}

					{!loading && !pagination && filtered.length > 0 && (
						<div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
							Showing {filtered.length} users
						</div>
					)}
				</SectionCard>

			</div>
		</DashboardLayout>
	);
};

export default ManageUsers;