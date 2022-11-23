import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState } from "react";
import {
	AiFillGithub,
	AiFillGoogleCircle,
	AiFillCloseCircle,
} from "react-icons/ai";
import { HiMenu } from "react-icons/hi";
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
	const [showProfileOptions, setShowProfileOptions] = useState(false);
	const [showLoginOptions, setShowLoginOptions] = useState(false);

	return (
		<div className="flex items-center p-3 md:p-4 justify-between grow-0 mb-10 lg:mb-14 xl:px-64  px-5 lg:px-32 z-10 opacity-100  border-white/25 font-semibold md:font-bold relative md:text-base text-sm">
			<div className="flex gap-6 lg:gap-20">
				<Link href="/">
					<p className="link-hover cursor-pointer  text-white">
						Home
					</p>
				</Link>
				<Link href="/posts/597">
					<p className="link-hover cursor-pointer  text-white">
						About
					</p>
				</Link>
			</div>
			{user ? (
				<div className="flex gap-8 items-end">
					<Link href={`/edit`}>
						<p className="link-hover cursor-pointer  text-white">
							Write
						</p>
					</Link>
					<div
						className="flex items-end"
						onClick={() => setShowProfileOptions((prev) => !prev)}
					>
						<HiMenu
							className={`${
								showProfileOptions ? "opacity-0" : "opacity-100"
							} transition-opacity translate-x-full text-base md:text-xl duration-500`}
						/>
						<AiFillCloseCircle
							className={`${
								showProfileOptions ? "opacity-100" : "opacity-0"
							}  transition-opacity text-base md:text-xl duration-500`}
						/>
					</div>
					{showProfileOptions && (
						<div className="flex flex-col absolute top-8 md:top-12 lg:right-40 right-10 xl:right-72 p-4 rounded-md bg-slate-700  gap-4">
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
					)}
				</div>
			) : (
				<div className="flex items-center text-white gap-6 md:gap-20">
					<Link href={`/edit`}>
						<p className="link-hover cursor-pointer  text-white">
							Write
						</p>
					</Link>
					<div
						className="cursor-pointer select-none"
						onClick={() => setShowLoginOptions((prev) => !prev)}
					>
						Login
					</div>
					{showLoginOptions && (
						<div className="flex flex-col absolute top-8 md:top-12 lg:right-40 right-10 xl:right-72 rounded-md bg-slate-700  gap-4">
							<div
								onClick={(e) => {
									e.preventDefault();
									handleSignIn("github", route);
								}}
								// className="btn btn-xs md:btn-sm normal-case w-fit text-white"
								className="flex gap-2 items-center hover:bg-black px-4 pt-2  rounded-t-md cursor-pointer"
							>
								<AiFillGithub
									size={20}
									className="w-4 md:w-6 text-white "
								/>{" "}
								GitHub
							</div>
							{/* <div className="divider divider-horizontal divide-white/30"></div> */}
							<div
								onClick={(e) => {
									e.preventDefault();
									handleSignIn("google", route);
								}}
								// className="btn btn-xs w-fit md:btn-sm bg-base-100 text-white normal-case"
								className="flex gap-2 items-end px-4 pb-2 hover:bg-black rounded-b-md cursor-pointer"
							>
								<AiFillGoogleCircle
									size={20}
									className="w-4 md:w-6 text-white "
								/>
								Google
							</div>
						</div>
					)}
					{/* <div className="flex divide-x-2">
						
					</div> */}
				</div>
			)}
		</div>
	);
}

export default Navbar;
