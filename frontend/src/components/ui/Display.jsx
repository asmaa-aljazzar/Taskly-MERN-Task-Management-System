import DashboardLayout from '../layouts/DashboardLayout';

export const TableHeader = ({ children }) => (
	<th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
		{children}
	</th>
);

export const TableCell = ({ children, className = '' }) => (
	<td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

export const InfoRow = ({ label, value }) => (
	<div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
		<span className="text-sm text-gray-500">{label}</span>
		<span className="text-sm font-medium text-gray-800">{value ?? '—'}</span>
	</div>
);

export const DashboardLoading = ({ activeMenuItem }) => (
	<DashboardLayout activeMenuItem={activeMenuItem}>
		<div className="flex justify-center items-center h-96" role="status" aria-label="Loading">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[#484bf2]" />
		</div>
	</DashboardLayout>
);
