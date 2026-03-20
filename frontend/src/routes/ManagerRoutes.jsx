import React from 'react'
import Dashboard from '../pages/Manager/Dashboard';
import ManageProjects from '../pages/Manager/ManageProjects';
import Teams from '../pages/Shared/Teams';
import { Routes, Route } from 'react-router-dom'

const ManagerRoutes = () => {
	return (
		<>
			<Routes>
				<Route path='dashboard' element={<Dashboard />} />
				{/* Projects and tasks */}
				<Route path='projects' element={<ManageProjects />}>
					<Route path='create' element={<CreateProject />} />
					{/* Need outlet */}
					<Route path=':projectId' element={<ProjectDetails />} >
						<Route path='edit' element={<EditProject />} />
						{/* Need outlet */}
						<Route path='tasks' element={<Tasks />} >
							<Route path='create' element={<CreateTask />} />
							<Route path=':taskId' element={<TaskDetails />} >
								<Route path='edit' element={<EditTask />} />
							</Route>
						</Route>
					</Route>
				</Route>
				{/* Teams */}
				<Route path='teams' element={<Teams role='manager' />} >
					<Route path=':teamId' element={<TeamDetails />} />
				</Route>
			</Routes>
			{/* <Outlet /> */}
		</>
	)
}
export default ManagerRoutes;