import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { AiFillGithub, AiFillGoogleCircle } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
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
		<div className="navbar grow-0 mb-6 lg:px-64 xl:px-80 px-5 md:px-32 z-10 opacity-100 bg-slate-900">
			<div className="flex-1">
				<Link href="/" className="btn btn-ghost normal-case text-xl ">
					Home
				</Link>
			</div>
			<div className="flex-none">
				<div className="dropdown dropdown-left lg:dropdown-hover ">
					<label>
						<GiHamburgerMenu />
					</label>
					<label className="dropdown-content  menu rounded-md menu-normal w-fit bg-base-100  ">
						{user ? (
							<>
								<div className="btn btn-ghost normal-case">
									<Link href={`/profile/${user.id}`}>
										Profile
									</Link>
								</div>
								<div
									onClick={(e) => {
										e.preventDefault();
										if (logoutCallback) logoutCallback();
										handleLogout();
									}}
									className="btn btn-ghost normal-case "
								>
									Logout
								</div>
							</>
						) : (
							<>
								<div
									onClick={(e) => {
										e.preventDefault();
										handleSignIn("github", route);
									}}
									className="btn btn-ghost normal-case w-40"
								>
									Login with{" "}
									<AiFillGithub size={20} className="ml-2" />
								</div>
								<div
									onClick={(e) => {
										e.preventDefault();
										handleSignIn("google", route);
									}}
									className="btn btn-ghost normal-case w-40"
								>
									Login with{" "}
									<AiFillGoogleCircle
										size={20}
										className="ml-2"
									/>
								</div>
							</>
						)}
					</label>
				</div>
			</div>
		</div>
	);
}

export default Navbar;
