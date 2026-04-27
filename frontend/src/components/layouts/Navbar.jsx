import { useState, useRef, useEffect } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { HiOutlineBell } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import { BASE_URL } from "../../utils/apiPaths";
import SideMenu from "./SideMenu";

const Navbar = ({ activeMenuItem }) => {
	const [openSideMenu, setOpenSideMenu]   = useState(false);
	const [openDropdown, setOpenDropdown]   = useState(false);
	const dropdownRef                       = useRef(null);
	const { user, clearUser }               = useUserAuth();
	const navigate                          = useNavigate();

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setOpenDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getImageUrl = (imagePath) => {
		if (!imagePath) return "";
		if (imagePath.startsWith("http")) return imagePath;
		if (imagePath.startsWith("/uploads")) return `${BASE_URL}${imagePath}`;
		return `${BASE_URL}/uploads/${imagePath}`;
	};

	const handleLogout = () => {
		localStorage.clear();
		clearUser();
		navigate("/login");
	};

	const roleLabel = user?.role === "hr"
		? "HR"
		: user?.role === "manager"
			? "Manager"
			: "Employee";

	const profilePath = user?.role === "hr"
		? "/hr/profile"
		: user?.role === "manager"
			? "/manager/profile"
			: "/employee/profile";

	return (
		<div className="fixed top-0 left-0 right-0 z-50 shadow-sm flex items-center justify-between bg-white border-b border-gray-200/70 py-4 px-7 h-15.25">

			{/* ── Left: hamburger + logo ── */}
			<div className="flex items-center gap-4">
				<button
					className="block lg:hidden text-[#484bf2]"
					onClick={() => setOpenSideMenu(prev => !prev)}
				>
					{openSideMenu
						? <HiOutlineX className="text-2xl" />
						: <HiOutlineMenu className="text-2xl" />
					}
				</button>

				<h2 className="text-lg font-medium text-[#484bf2]">Taskly</h2>

				{/* Current page title — hidden on small screens */}
				{activeMenuItem && (
					<>
						<span className="hidden sm:block text-gray-300 text-lg select-none">/</span>
						<span className="hidden sm:block text-sm font-medium text-gray-500">
							{activeMenuItem}
						</span>
					</>
				)}
			</div>

			{/* ── Right: notifications + avatar ── */}
			<div className="flex items-center gap-3">

				{/* Notification bell */}
				<button className="relative p-2 rounded-lg text-gray-500 hover:text-[#484bf2] hover:bg-blue-50 transition-colors">
					<HiOutlineBell className="text-xl" />
				</button>

				{/* Avatar + dropdown */}
				<div className="relative" ref={dropdownRef}>
					<button
						onClick={() => setOpenDropdown(prev => !prev)}
						className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
					>
						{/* Avatar */}
						{user?.profileImageUrl ? (
							<img
								src={getImageUrl(user.profileImageUrl)}
								alt="Profile"
								className="w-8 h-8 rounded-full object-cover"
								onError={(e) => {
									e.target.style.display = "none";
									e.target.nextSibling.style.display = "flex";
								}}
							/>
						) : null}
						<div
							className={`w-8 h-8 rounded-full bg-[#484bf2] items-center justify-center text-white text-sm font-bold ${
								user?.profileImageUrl ? "hidden" : "flex"
							}`}
						>
							{user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
						</div>

						{/* Name + role — hidden on very small screens */}
						<div className="hidden sm:flex flex-col items-start leading-tight">
							<span className="text-sm font-medium text-gray-800 max-w-30truncate">
								{user?.fullName || user?.email || "User"}
							</span>
							<span className="text-[11px] text-[#484bf2]">{roleLabel}</span>
						</div>

						{/* Chevron */}
						<svg
							className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openDropdown ? "rotate-180" : ""}`}
							fill="none" stroke="currentColor" viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{/* Dropdown menu */}
					{openDropdown && (
						<div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden">
							<button
								onClick={() => { setOpenDropdown(false); navigate(profilePath); }}
								className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
							>
								<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								My Profile
							</button>

							<div className="border-t border-gray-100 my-1" />

							<button
								onClick={handleLogout}
								className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								Logout
							</button>
						</div>
					)}
				</div>
			</div>

			{/* ── Mobile side menu ── */}
			{openSideMenu && (
				<div className="fixed top-15.25 left-0 bottom-0 z-40 bg-white shadow-lg overflow-y-auto scrollbar-hide">
					<SideMenu activeMenuItem={activeMenuItem} />
				</div>
			)}
		</div>
	);
};

export default Navbar;