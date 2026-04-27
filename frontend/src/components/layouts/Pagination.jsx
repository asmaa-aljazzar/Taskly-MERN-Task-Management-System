const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	if (totalPages <= 1) return null;

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

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

				{pages.map(page => (
					<button
						key={page}
						onClick={() => onPageChange(page)}
						className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
							page === currentPage
								? 'bg-[#484bf2] text-white'
								: 'text-gray-500 hover:bg-gray-100'
						}`}
					>
						{page}
					</button>
				))}

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

export default Pagination;