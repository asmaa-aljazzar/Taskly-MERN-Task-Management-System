import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";

const Navbar = ({ activeMenuItem }) => {
	const [openSideMenu, setOpenSideMenu] = useState(false);

	return (
		<div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-5 bg-white border-b border-gray-200/70 py-4 px-7 h-15.25">
			<button
				className="block lg:hidden text-[#484bf2]"
				onClick={() => setOpenSideMenu(prev => !prev)}
			>
				{openSideMenu ? (
					<HiOutlineX className="text-2xl" />
				) : (
					<HiOutlineMenu className="text-2xl" />
				)}
			</button>

			<h2 className="text-lg font-medium text-[#484bf2]">Taskly</h2>

			{openSideMenu && (
				<div className="fixed top-15.25 left-0 bottom-0 z-40 bg-white shadow-lg overflow-y-auto scrollbar-hide">
					<SideMenu activeMenuItem={activeMenuItem} />
				</div>
			)}
		</div>
	);
};

export default Navbar;