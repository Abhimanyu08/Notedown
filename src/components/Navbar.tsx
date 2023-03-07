import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState } from "react";
import {
	AiFillGithub,
	AiFillGoogleCircle,
	AiFillCloseCircle,
} from "react-icons/ai";
import { HiMenu } from "react-icons/hi";
import { MdDarkMode, MdLightMode } from "react-icons/md";
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

	const [mode, setMode] = useState<"light" | "dark">(
		document.documentElement.classList.contains("dark") ? "dark" : "light"
	);

	return (
		<div className="flex items-center p-3 md:p-4 justify-between grow-0 mb-5 lg:mb-5 mx-52 z-10 opacity-100  border-white/25 font-semibold md:font-bold relative md:text-base text-sm text-black dark:text-white">
			<div className="flex gap-6 md:gap-14">
				<Link href="/">
					<p className="link-hover cursor-pointer">Home</p>
				</Link>
				<Link href="/posts/597">
					<p className="link-hover cursor-pointer">About</p>
				</Link>
			</div>
			<div className="flex gap-6 items-center md:gap-10">
				<div
					className="self-end"
					onClick={() => {
						if (mode === "dark") {
							document.documentElement.classList.remove("dark");
							setMode("light");
							return;
						}
						setMode("dark");
						document.documentElement.classList.add("dark");
					}}
				>
					{mode === "dark" ? (
						<MdDarkMode size={20} />
					) : (
						<MdLightMode size={20} />
					)}
				</div>
				<Link href={`/read`}>
					<p className="link-hover cursor-pointer">Read</p>
				</Link>
				<Link href={`/edit`}>
					<p className="link-hover cursor-pointer">Write</p>
				</Link>
				{user ? (
					<div className="relative">
						<div
							className=""
							onClick={() =>
								setShowProfileOptions((prev) => !prev)
							}
						>
							{showProfileOptions ? (
								<AiFillCloseCircle className="lg:text-xl" />
							) : (
								<HiMenu className={`lg:text-xl`} />
							)}
						</div>
						{showProfileOptions && (
							<OptionsComponent>
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
							</OptionsComponent>
						)}
					</div>
				) : (
					<div className="relative">
						<div
							className="cursor-pointer select-none"
							onClick={() => setShowLoginOptions((prev) => !prev)}
						>
							Login
						</div>
						{showLoginOptions && (
							<OptionsComponent>
								<div
									onClick={(e) => {
										e.preventDefault();
										handleSignIn("github", route);
									}}
									// className="btn btn-xs md:btn-sm normal-case w-fit text-white"
									className="flex gap-2 items-center hover:bg-gray-500 px-4 p-2  rounded-md cursor-pointer"
								>
									<AiFillGithub
										size={20}
										className="w-4 md:w-6 text-white "
									/>{" "}
									GitHub
								</div>
								<div
									onClick={(e) => {
										e.preventDefault();
										handleSignIn("google", route);
									}}
									// className="btn btn-xs w-fit md:btn-sm bg-base-100 text-white normal-case"
									className="flex gap-2 items-center hover:bg-gray-500 px-4 p-2  rounded-md cursor-pointer"
								>
									<AiFillGoogleCircle
										size={20}
										className="w-4 md:w-6 text-white "
									/>
									Google
								</div>
							</OptionsComponent>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

const OptionsComponent = ({ children }: { children: JSX.Element[] }) => {
	return (
		<div className="flex flex-col absolute top-8 right-10  p-4 rounded-md bg-black shadow-sm shadow-white gap-4">
			{children}
		</div>
	);
};

export default Navbar;
