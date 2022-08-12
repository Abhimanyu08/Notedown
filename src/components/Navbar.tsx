import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { MouseEventHandler } from "react";
import { AiFillGithub } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { handleLogout, handleSignIn } from "../../utils/handleAuth";
import { supabase } from "../../utils/supabaseClient";

function Navbar({
	user,
	route,
	logoutCallback,
}: {
	user: User | null;
	route: string;
	logoutCallback: () => void;
}) {
	return (
		<div className="navbar mb-6 ">
			<div className="flex-1">
				<Link href="/" className="btn btn-ghost normal-case text-xl">
					Home
				</Link>
			</div>
			<div className="flex-none">
				<ul className="menu menu-horizontal menu-compact p-0">
					<li tabIndex={0}>
						<a>
							<GiHamburgerMenu />
						</a>
						<ul className="p-2 bg-cyan-500 text-black">
							{user ? (
								<>
									<li>
										<Link href={`/profile/${user.id}`}>
											Profile
										</Link>
									</li>
									<li>
										<button
											onClick={(e) => {
												e.preventDefault();
												handleLogout();
												logoutCallback();
											}}
										>
											Logout
										</button>
									</li>
								</>
							) : (
								<li>
									<button onClick={() => handleSignIn(route)}>
										Log In with <AiFillGithub />
									</button>
								</li>
							)}
						</ul>
					</li>
				</ul>
			</div>
		</div>
	);
}

export default Navbar;
