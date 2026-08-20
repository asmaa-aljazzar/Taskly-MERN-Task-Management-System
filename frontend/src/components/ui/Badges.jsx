const badgeBase = 'px-2 py-0.5 rounded-full text-xs font-semibold';

export const StatusBadge = ({ status }) => {
	const styles = {
		done: 'bg-emerald-100 text-emerald-700',
		'in-progress': 'bg-amber-100 text-amber-700',
		pending: 'bg-rose-100 text-rose-700',
	};
	const labels = { done: 'Done', 'in-progress': 'In Progress', pending: 'Pending' };

	return (
		<span className={`${badgeBase} ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
			{labels[status] ?? status ?? 'Unknown'}
		</span>
	);
};

export const PriorityBadge = ({ priority }) => {
	const styles = {
		urgent: 'bg-purple-100 text-purple-700',
		high: 'bg-rose-100 text-rose-700',
		medium: 'bg-amber-100 text-amber-700',
		low: 'bg-emerald-100 text-emerald-700',
	};

	return (
		<span className={`${badgeBase} capitalize ${styles[priority] ?? 'bg-gray-100 text-gray-600'}`}>
			{priority ?? 'Unknown'}
		</span>
	);
};
