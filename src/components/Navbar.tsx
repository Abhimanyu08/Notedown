import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { MouseEventHandler } from "react";
import { AiFillGithub } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import handleSignIn from "../../utils/handleSignIn";
import { supabase } from "../../utils/supabaseClient";

function Navbar({ user, route }: { user: User | null; route: string }) {
	const onLogout: MouseEventHandler = async (e) => {
		e.preventDefault();

		const { error } = await supabase.auth.signOut();
		if (error) {
			alert(error.message);
			console.log(error);
			return;
		}
	};
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
										<button onClick={onLogout}>
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
