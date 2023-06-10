import React from "react";

function ProfileLoading() {
	return (
		<div className="w-full [&>*]:animate-pulse">
			<div className="bg-gray-800 h-10 w-64 rounded-md"></div>
			<div className="w-full h-[500px] bg-gray-800 mt-4 rounded-md"></div>
		</div>
	);
}

export default ProfileLoading;
