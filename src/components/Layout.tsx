import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

const Layout: React.FC<{
	children: JSX.Element[] | JSX.Element;
	user: User | null;
	route: string;
	logoutCallback?: () => void;
}> = ({ children, user, route, logoutCallback }) => {
	const [mounted, setMounted] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
	}, []);
	return (
		<div className="flex flex-col h-screen w-full">
			{mounted && <Navbar {...{ user, route, logoutCallback }} />}
			{children}
			{/* {
				<footer className="footer footer-center p-4 bg-slate-800 text-base-content">
					<div>
						<p>Made by Abhimanyu</p>
					</div>
				</footer>
			} */}
		</div>
	);
};

export default Layout;
