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
		<div className="flex items-center p-3 md:p-4 justify-between grow-0 mb-4 md:mb-10 xl:px-64  px-5 md:px-32 z-10 opacity-100 border-b-2 border-white/10 font-semibold md:font-bold">
			<Link href="/">
				<p className="link-hover cursor-pointer md:text-base text-xs text-white">
					Home
				</p>
			</Link>
			{user ? (
				<div className="flex gap-5">
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
				<div className="flex items-center text-white">
					<span className="pr-4 text-xs md:text-sm">Login with</span>
					<div
						onClick={(e) => {
							e.preventDefault();
							handleSignIn("github", route);
						}}
						// className="btn btn-xs md:btn-sm normal-case w-fit text-white"
					>
						<AiFillGithub
							size={20}
							className=" w-4 md:w-6 text-white"
						/>
					</div>
					<div className="divider divider-horizontal"></div>
					<div
						onClick={(e) => {
							e.preventDefault();
							handleSignIn("google", route);
						}}
						// className="btn btn-xs w-fit md:btn-sm bg-base-100 text-white normal-case"
					>
						<AiFillGoogleCircle
							size={20}
							className="w-4 md:w-6 text-white"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

export default Navbar;
