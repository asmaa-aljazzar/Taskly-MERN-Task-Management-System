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

const LoadingSpinner = () => (
	<DashboardLayout activeMenuItem="Employees">
		<div className="flex justify-center items-center h-96">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);

const ROLES = ['all', 'employee', 'manager', 'hr'];

const ManageUsers = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeRole, setActiveRole] = useState('all');
	const [search, setSearch] = useState('');

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const res = await axiosInstance.get(API_PATHS.USER.GET_ALL_USERS);
				const list = Array.isArray(res.data) ? res.data : res.data.users ?? [];
				setUsers(list);
			} catch {
				toast.error('Failed to load users. Please try again.');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <LoadingSpinner />;

	const total = users.length;
	const employees = users.filter(u => u.role === 'employee').length;
	const managers = users.filter(u => u.role === 'manager').length;
	const hrs = users.filter(u => u.role === 'hr').length;

	const filtered = users.filter(u => {
		const matchRole = activeRole === 'all' || u.role === activeRole;
		const matchSearch = !search ||
			u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			u.email?.toLowerCase().includes(search.toLowerCase());
		return matchRole && matchSearch;
	});

	const roleCount = (role) =>
		role === 'all' ? total
			: role === 'employee' ? employees
				: role === 'manager' ? managers
					: hrs;

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
					<StatCard label="Total Users" value={total} accent="bg-blue-50"
						icon={<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>}
					/>
					<StatCard label="Employees" value={employees} accent="bg-emerald-50"
						icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
					/>
					<StatCard label="Managers" value={managers} accent="bg-amber-50"
						icon={<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
					/>
					<StatCard label="HR Staff" value={hrs} accent="bg-[#eeeeff]"
						icon={<svg className="w-5 h-5 text-[#484bf2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
					/>
				</div>

				<SectionCard>
					<div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
						<div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
							{ROLES.map(role => (
								<button
									key={role}
									onClick={() => setActiveRole(role)}
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
											{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
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
					</div>

					{filtered.length > 0 && (
						<div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
							Showing {filtered.length} of {total} users
						</div>
					)}
				</SectionCard>

			</div>
		</DashboardLayout>
	);
};

export default ManageUsers;