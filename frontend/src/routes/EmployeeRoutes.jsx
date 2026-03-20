import React from 'react'
import MyTasks from '../pages/Employee/MyTasks';
import Dashboard from '../pages/Employee/Dashboard';
import Teams from '../pages/Shared/Teams';
import { Routes, Route } from 'react-router-dom'

const EmployeeRoutes = () => {
	return (
		<>
			<Routes>
				<Route path='dashboard' element={<Dashboard />} />
				<Route path='tasks' element={<MyTasks />}>
					<Route path=':taskId' element={<TaskDetails />} />
				</Route>
				{/* Need outlet */}
				<Route path='teams' element={<Teams role='employee' />} >
					<Route path=':teamId' element={<TeamDetails />} />
				</Route>
			</Routes>
			{/* <Outlet /> */}
		</>
	)
}

export default EmployeeRoutes;