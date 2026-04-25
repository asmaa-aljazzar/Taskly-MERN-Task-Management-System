import {
	LuLayoutDashboard,
	LuUsers,
	LuClipboardCheck,
	LuSquarePlus,
	LuLogOut,
	LuUser,
} from 'react-icons/lu';

// ========== HR MENU ==========
export const HR_SIDE_MENU_ITEMS_DATA = [
	{ id: '01', label: 'Dashboard', icon: LuLayoutDashboard, path: '/hr/dashboard' },
	{ id: '02', label: 'Employees', icon: LuUsers, path: '/hr/employees' },
	{ id: '03', label: 'Create Employee', icon: LuSquarePlus, path: '/hr/employees/create' },
	{ id: '04', label: 'Teams', icon: LuUsers, path: '/hr/teams' },
	{ id: '05', label: 'Create Team', icon: LuSquarePlus, path: '/hr/teams/create' },
	{ id: 'last', label: 'Logout', icon: LuLogOut, path: '/logout', isLogout: true },
];

// ========== MANAGER MENU ==========
export const MANAGER_SIDE_MENU_ITEMS_DATA = [
	{ id: '01', label: 'Dashboard', icon: LuLayoutDashboard, path: '/manager/dashboard' },
	{ id: '02', label: 'My Teams', icon: LuUsers, path: '/manager/teams' },
	{ id: '03', label: 'Projects', icon: LuClipboardCheck, path: '/manager/projects' },
	{ id: '04', label: 'Create Project', icon: LuSquarePlus, path: '/manager/projects/create' },
	{ id: '05', label: 'Profile', icon: LuUser, path: '/manager/profile' },
	{ id: 'last', label: 'Logout', icon: LuLogOut, path: '/logout', isLogout: true },
];

// ========== EMPLOYEE MENU ==========
export const EMPLOYEE_SIDE_MENU_ITEMS_DATA = [
	{ id: '01', label: 'Dashboard', icon: LuLayoutDashboard, path: '/employee/dashboard' },
	{ id: '02', label: 'My Tasks', icon: LuClipboardCheck, path: '/employee/tasks' },
	{ id: '03', label: 'Profile', icon: LuUser, path: '/employee/profile' },
	{ id: 'last', label: 'Logout', icon: LuLogOut, path: '/logout', isLogout: true },
];

export const PRIORITY_DATA = [
	{ id: 'low', label: 'Low' },
	{ id: 'medium', label: 'Medium' },
	{ id: 'high', label: 'High' },
];

export const STATUS_DATA = [
	{ id: 'todo', label: 'To Do' },
	{ id: 'in-progress', label: 'In Progress' },
	{ id: 'done', label: 'Done' },
];