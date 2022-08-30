import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

const Layout: React.FC<{
	children: JSX.Element[] | JSX.Element;
	user: User | null;
	route: string;
	logoutCallback: () => void;
}> = ({ children, user, route, logoutCallback }) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);
	return (
		<div className=" min-h-screen w-full ">
			{mounted && <Navbar {...{ user, route, logoutCallback }} />}
			{children}
		</div>
	);
};

export default Layout;
