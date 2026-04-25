import React from 'react'
import { Outlet } from 'react-router-dom'

const Profile = ({ role }) => {
	void role;
	return (
		<>
			Profile
			<Outlet />
		</>
	)
}

export default Profile;