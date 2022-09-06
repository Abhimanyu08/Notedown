import { User } from "@supabase/supabase-js";
import { Router, useRouter } from "next/router";
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
			{!router.pathname.startsWith("/posts") && (
				<footer className="footer footer-center p-4 bg-slate-900 text-base-content border-t-2 border-white/25">
					<div>
						<p>Made by Abhimanyu</p>
					</div>
				</footer>
			)}
		</div>
	);
};

export default Layout;
