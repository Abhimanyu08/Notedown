import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import React from "react";
import Navbar from "./Navbar";

const Layout: React.FC<{
	children: JSX.Element[] | JSX.Element;
	user: User | null;
	route: string;
	logoutCallback: () => void;
}> = ({ children, user, route, logoutCallback }) => {
	return (
		<div className=" min-h-screen w-full ">
			<Navbar {...{ user, route, logoutCallback }} />
			{children}
		</div>
	);
};

export default Layout;
