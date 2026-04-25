import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import { EMPLOYEE_SIDE_MENU_ITEMS_DATA, HR_SIDE_MENU_ITEMS_DATA, MANAGER_SIDE_MENU_ITEMS_DATA } from '../../utils/data';
import { BASE_URL } from '../../utils/apiPaths';

const SideMenu = ({ activeMenuItem }) => {
	const { user, clearUser } = useUserAuth();
	const navigate = useNavigate();

	const getImageUrl = (imagePath) => {
		if (!imagePath) return '';
		if (imagePath.startsWith('http')) return imagePath;
		if (imagePath.startsWith('/uploads')) return `${BASE_URL}${imagePath}`;
		return `${BASE_URL}/uploads/${imagePath}`;
	};

	const sideMenuItemsData = user?.role === 'hr' ? HR_SIDE_MENU_ITEMS_DATA
		: user?.role === 'manager' ? MANAGER_SIDE_MENU_ITEMS_DATA
			: EMPLOYEE_SIDE_MENU_ITEMS_DATA;

	const handleClick = (route) => {
		if (route === '/logout') {
			handleLogout();
			return;
		}
		navigate(route);
	};

	const handleLogout = () => {
		localStorage.clear();
		clearUser();
		navigate('/login');
	};

	return (
		<>
			<style>{`
				.scrollbar-hide::-webkit-scrollbar { display: none; }
				.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
			`}</style>

			<div className="w-64 h-full bg-white border-r border-gray-200/50 overflow-y-auto scrollbar-hide">
				<div className="flex flex-col items-center justify-center mb-7 pt-5">
					<div className="relative">
						{user?.profileImageUrl ? (
							<img
								src={getImageUrl(user.profileImageUrl)}
								alt="Profile"
								className="w-20 h-20 rounded-full object-cover"
								onError={(e) => {
									e.target.style.display = 'none';
									e.target.nextSibling.style.display = 'flex';
								}}
							/>
						) : null}
						<div className={`w-20 h-20 rounded-full bg-[#484bf2] flex items-center justify-center text-white text-2xl font-bold ${user?.profileImageUrl ? 'hidden' : 'flex'}`}>
							{user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
						</div>
					</div>

					<div className="text-[10px] text-white bg-[#484bf2] px-3 py-0.5 rounded mt-1">
						{user?.role === 'hr' && <p>HR</p>}
						{user?.role === 'manager' && <p>Manager</p>}
						{user?.role === 'employee' && <p>Employee</p>}
					</div>

					<h5 className="text-gray-950 font-medium leading-6 mt-3">{user?.fullName || ""}</h5>
					<p className="text-gray-500 text-[12px]">{user?.email || ""}</p>
				</div>

				{sideMenuItemsData.map((item, index) => (
					<button
						key={`menu_item_${index}`}
						className={`w-full flex items-center gap-4 text-[15px] ${activeMenuItem == item.label
							? "text-[#484bf2] bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3 border-[#484bf2]"
							: "text-gray-700 hover:text-[#484bf2] hover:bg-linear-to-r hover:from-blue-50/40 hover:to-blue-100/50"
						} py-3 px-6 mb-1 cursor-pointer transition-all duration-200`}
						onClick={() => handleClick(item.path)}
					>
						<item.icon className="text-xl" />
						{item.label}
					</button>
				))}
			</div>
		</>
	);
};

export default SideMenu;