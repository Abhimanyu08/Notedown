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
		<div className="navbar justify-between grow-0 mb-10 lg:px-64  px-5 md:px-32 z-10 opacity-100">
			<Link href="/">
				<p className="link-hover cursor-pointer">Home</p>
			</Link>
			{user ? (
				<div className="flex gap-5">
					<Link href={`/profile/${user.id}`}>
						<p className="link-hover cursor-pointer">Profile</p>
					</Link>
					<div
						onClick={(e) => {
							e.preventDefault();
							if (logoutCallback) logoutCallback();
							handleLogout();
						}}
						className="link-hover cursor-pointer"
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
							className="btn btn-sm btn-ghost normal-case w-32"
						>
							Login with{" "}
							<AiFillGithub size={20} className="ml-2" />
						</div>
						<div
							onClick={(e) => {
								e.preventDefault();
								handleSignIn("google", route);
							}}
							className="btn btn-sm btn-ghost normal-case w-32"
						>
							Login with{" "}
							<AiFillGoogleCircle size={20} className="ml-2" />
						</div>
					</>
				</div>
			)}
		</div>
	);
}

export default Navbar;
