import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { AiFillGithub, AiFillGoogleCircle } from "react-icons/ai";
import { handleLogout, handleSignIn } from "../../utils/handleAuth";

function Navbar({
	user,
	route,
	logoutCallback,
}: {
	user: User | null;
	route: string;
	logoutCallback?: () => void;
}) {
	return (
		<div className="navbar justify-between grow-0 mb-2 md:mb-10 xl:px-64  pl-5 pr-0 md:px-32 z-10 opacity-100">
			<Link href="/">
				<p className="link-hover cursor-pointer md:text-base text-xs text-white">
					Home
				</p>
			</Link>
			{user ? (
				<div className="flex gap-5 mr-2">
					<Link href={`/profile/${user.id}`}>
						<p className="link-hover cursor-pointer text-xs md:text-base text-white">
							Profile
						</p>
					</Link>
					<div
						onClick={(e) => {
							e.preventDefault();
							if (logoutCallback) logoutCallback();
							handleLogout();
						}}
						className="link-hover cursor-pointer text-xs md:text-base text-white"
					>
						Logout
					</div>
				</div>
			) : (
				<div className="">
					<>
						<div
							onClick={(e) => {
								e.preventDefault();
								handleSignIn("github", route);
							}}
							className="btn btn-xs md:btn-sm btn-ghost normal-case w-28 md:w-32 text-white"
						>
							Login with{" "}
							<AiFillGithub
								size={20}
								className="ml-2 w-4 md:w-6 text-white"
							/>
						</div>
						<div
							onClick={(e) => {
								e.preventDefault();
								handleSignIn("google", route);
							}}
							className="btn btn-xs md:btn-sm btn-ghost text-white normal-case w-28 md:w-32"
						>
							Login with{" "}
							<AiFillGoogleCircle
								size={20}
								className="ml-2 w-4 md:w-6 text-white"
							/>
						</div>
					</>
				</div>
			)}
		</div>
	);
}

export default Navbar;
