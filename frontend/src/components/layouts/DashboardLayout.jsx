import { useUserAuth } from '../../hooks/useUserAuth';
import Navbar from './Navbar';
import SideMenu from './SideMenu';

const DashboardLayout = ({ children, activeMenuItem }) => {
	const { user } = useUserAuth();

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<Navbar activeMenuItem={activeMenuItem} />

			{user && (
				<div className="flex flex-1 overflow-hidden pt-15.25">
					{/* Sidebar — scrolls independently */}
					<div className="hidden lg:block shrink-0">
						<SideMenu activeMenuItem={activeMenuItem} />
					</div>

					{/* Main content — scrolls independently */}
					<div className="flex-1 overflow-y-auto bg-gray-50">
						<div className="mx-5">
							{children}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardLayout;