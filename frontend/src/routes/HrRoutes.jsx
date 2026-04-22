import React from 'react'
import Dashboard from '../pages/Hr/HrDashboard';
import ManageUsers from '../pages/Hr/ManageUsers';
import Teams from '../pages/Shared/Teams';
import { Routes, Route } from 'react-router-dom'

const HrRoutes = () => {
	  console.log('HrRoutes rendered');

	return (
		<>
		<Routes>
			<Route path='dashboard' element={<Dashboard />} />
			{/* Users */}
			<Route path='users' element={<ManageUsers />} >
				<Route path='create' element={<CreateUser />} />
				{/* Need outlet */}
				<Route path=':userId' element={<UserDetails />} >
					<Route path='edit' element={<EditUser />} />
				</Route>
			</Route>
			{/* Teams */}
			<Route path='teams' element={<Teams role='hr' />} >
				<Route path='past' element={<PastTeams />} />
				<Route path='create' element={<CreateTeam />} />
				{/* Need outlet */}
				<Route path=':teamId' element={<TeamDetails />} >
					<Route path='edit' element={<EditTeam />} />
				</Route>
			</Route>
		</Routes>
			{/* <Outlet /> */}
		</>
	)
}

export default HrRoutes