import React from 'react'
import { Outlet } from 'react-router-dom'

const Teams = ({ role }) => {
	void role;
	return (
		<>
			Teams
			<Outlet />
		</>
	)
}

export default Teams;