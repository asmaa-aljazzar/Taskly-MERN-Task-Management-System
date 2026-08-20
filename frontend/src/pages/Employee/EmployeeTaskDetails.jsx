import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badges';
import { DashboardLoading } from '../../components/ui/Display';

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => (
	<div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
		<span className="text-sm text-gray-500">{label}</span>
		<span className="text-sm font-medium text-gray-800">{value ?? '—'}</span>
	</div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = ['pending', 'in-progress', 'done'];
const STATUS_LABELS  = { pending: 'Pending', 'in-progress': 'In Progress', done: 'Done' };
const STATUS_ACTIVE  = { pending: 'bg-rose-500 text-white', 'in-progress': 'bg-amber-500 text-white', done: 'bg-emerald-500 text-white' };

// ─── Main Component ────────────────────────────────────────────────────────────

const EmployeeTaskDetails = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const [task,          setTask]          = useState(location.state?.task ?? null);
	const [saving,        setSaving]        = useState(false);
	const [statusSaving,  setStatusSaving]  = useState(false);
	const [checklist,     setChecklist]     = useState(location.state?.task?.checklist ?? []);
	const [dirty,         setDirty]         = useState(false);

	// ── Redirect if no task state ─────────────────────────────────────────────
	useEffect(() => {
		if (!location.state?.task) {
			toast.error('Task not found.');
			navigate('/employee/tasks');
		}
	}, [location.state, navigate]);

	// ── Toggle checklist item ─────────────────────────────────────────────────
	const toggleItem = (index) => {
		setChecklist(prev =>
			prev.map((item, i) => i === index ? { ...item, completed: !item.completed } : item)
		);
		setDirty(true);
	};

	// ── Save checklist via PATCH ──────────────────────────────────────────────
	const saveChecklist = async () => {
		if (!task) return;
		const projectId = task.projectId?._id ?? task.projectId;
		setSaving(true);
		try {
			const res = await axiosInstance.patch(
				API_PATHS.TASK.UPDATE_TASK_PROGRESS(projectId, task._id),
				{ checklist }
			);
			if (res.data.success) {
				toast.success('Checklist saved!');
				setTask(prev => ({ ...prev, checklist }));
				setDirty(false);
			} else {
				toast.error(res.data.message || 'Failed to save checklist');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Something went wrong.');
		} finally {
			setSaving(false);
		}
	};

	// ── Update status via PATCH ───────────────────────────────────────────────
	const handleStatusChange = async (newStatus) => {
		if (newStatus === task.status || statusSaving) return;
		const projectId = task.projectId?._id ?? task.projectId;
		setStatusSaving(true);
		try {
			const res = await axiosInstance.patch(
				API_PATHS.TASK.UPDATE_TASK_PROGRESS(projectId, task._id),
				{ status: newStatus }
			);
			if (res.data.success) {
				toast.success(`Status set to ${STATUS_LABELS[newStatus]}`);
				setTask(prev => ({ ...prev, status: newStatus }));
			} else {
				toast.error(res.data.message || 'Failed to update status');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Something went wrong.');
		} finally {
			setStatusSaving(false);
		}
	};

	if (!task) return <DashboardLoading activeMenuItem="My Tasks" />;

	const fmt        = (d) => d ? new Date(d).toLocaleDateString() : null;
	const checkDone  = checklist.filter(c => c.completed).length;
	const checkTotal = checklist.length;
	const progress   = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;
	const isOverdue  = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

	return (
		<DashboardLayout activeMenuItem="My Tasks">
			<div className="py-8 px-1 space-y-6">

				{/* Header */}
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-3">
						<button
							onClick={() => navigate('/employee/tasks')}
							className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 mt-0.5 shrink-0"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<div className="flex items-center gap-2 flex-wrap">
								<h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
								{isOverdue && (
									<span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
										OVERDUE
									</span>
								)}
							</div>
							<p className="text-sm text-gray-500 mt-0.5">
								{task.projectName ?? task.projectId?.projectName ?? 'Project'}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<StatusBadge status={task.status} />
						<PriorityBadge priority={task.priority} />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

					{/* ── Left: Details ─────────────────────────────────────────── */}
					<div className="lg:col-span-1 space-y-5">

						{/* Status Selector */}
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
							<h2 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h2>
							<div className="flex flex-col gap-2">
								{STATUSES.map(s => (
									<button
										key={s}
										onClick={() => handleStatusChange(s)}
										disabled={statusSaving}
										className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
											task.status === s
												? STATUS_ACTIVE[s]
												: 'bg-gray-50 text-gray-500 hover:bg-gray-100'
										} disabled:opacity-60`}
									>
										<span>{STATUS_LABELS[s]}</span>
										{task.status === s && (
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
											</svg>
										)}
									</button>
								))}
							</div>
						</div>

						{/* Task Info */}
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
							<h2 className="text-sm font-semibold text-gray-700 mb-3">Task Info</h2>
							<InfoRow label="Priority"        value={<PriorityBadge priority={task.priority} />} />
							<InfoRow label="Start Date"      value={fmt(task.startDate)} />
							<InfoRow label="Due Date"        value={
								task.dueDate ? (
									<span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
										{fmt(task.dueDate)}
									</span>
								) : null
							} />
							<InfoRow label="Estimated Hours" value={task.estimatedHours ? `${task.estimatedHours}h` : null} />
							<InfoRow label="Project"         value={task.projectName ?? task.projectId?.projectName} />
						</div>

						{/* Description */}
						{task.description && (
							<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
								<h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
								<p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
							</div>
						)}
					</div>

					{/* ── Right: Checklist ──────────────────────────────────────── */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h2 className="text-sm font-semibold text-gray-700">Checklist</h2>
									{checkTotal > 0 && (
										<p className="text-xs text-gray-400 mt-0.5">{checkDone} of {checkTotal} completed</p>
									)}
								</div>
								{dirty && (
									<button
										onClick={saveChecklist}
										disabled={saving}
										className="flex items-center gap-1.5 bg-[#484bf2] hover:bg-[#3a3dd4] disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
									>
										{saving ? (
											<><span className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" />Saving...</>
										) : (
											<><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>Save</>
										)}
									</button>
								)}
							</div>

							{/* Progress bar */}
							{checkTotal > 0 && (
								<div className="mb-5">
									<div className="flex justify-between text-xs text-gray-400 mb-1.5">
										<span>Progress</span>
										<span>{progress}%</span>
									</div>
									<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
										<div
											className="h-full bg-[#484bf2] rounded-full transition-all duration-300"
											style={{ width: `${progress}%` }}
										/>
									</div>
								</div>
							)}

							{/* Items */}
							{checkTotal === 0 ? (
								<div className="flex flex-col items-center justify-center py-10 text-center gap-2">
									<svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
									</svg>
									<p className="text-sm text-gray-400">No checklist items for this task</p>
								</div>
							) : (
								<ul className="space-y-2">
									{checklist.map((item, i) => (
										<li
											key={i}
											onClick={() => toggleItem(i)}
											className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors select-none ${
												item.completed ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'
											}`}
										>
											<div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
												item.completed ? 'bg-[#484bf2] border-[#484bf2]' : 'border-gray-300 bg-white'
											}`}>
												{item.completed && (
													<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
													</svg>
												)}
											</div>
											<span className={`text-sm transition-colors ${
												item.completed ? 'line-through text-gray-400' : 'text-gray-700'
											}`}>
												{item.text}
											</span>
										</li>
									))}
								</ul>
							)}

							{checkTotal > 0 && checkDone === checkTotal && (
								<div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-lg">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="text-sm font-medium">All items completed!</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default EmployeeTaskDetails;
