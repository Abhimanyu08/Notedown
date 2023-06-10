"use client";
import { useSupabase } from "@/app/appContext";
import { handleLogout, handleSignIn } from "@/utils/handleAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
	AiFillCloseCircle,
	AiFillGithub,
	AiFillGoogleCircle,
} from "react-icons/ai";
import { HiMenu } from "react-icons/hi";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export function NavbarClientComponent() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const [mode, setMode] = useState<"light" | "dark">(() => {
		if (typeof window !== "undefined") {
			return document?.documentElement.classList.contains("dark")
				? "dark"
				: "light";
		}
		return "dark";
	});
	return (
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
			<Link href={`/write`}>
				<p className="link-hover cursor-pointer">Write</p>
			</Link>
			{mounted && <ProfileMenu />}
		</div>
	);
}

function ProfileMenu() {
	const route = usePathname();
	const { supabase, session } = useSupabase();
	const [showProfileOptions, setShowProfileOptions] = useState(false);
	return (
		<>
			{session?.user ? (
				<div className="relative">
					<div
						className=""
						onClick={() => setShowProfileOptions((prev) => !prev)}
					>
						{showProfileOptions ? (
							<AiFillCloseCircle className="lg:text-xl" />
						) : (
							<HiMenu className={`lg:text-xl`} />
						)}
					</div>
					{showProfileOptions && (
						<OptionsComponent>
							<Link
								href={`/profile/${session.user.id}`}
								onClick={() => setShowProfileOptions(false)}
							>
								<p className="link-hover cursor-pointer text-xs md:text-base text-white">
									Profile
								</p>
							</Link>
							<div
								onClick={async (e) => {
									e.preventDefault();
									await handleLogout(supabase);
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
						onClick={() => setShowProfileOptions((prev) => !prev)}
					>
						Login
					</div>
					{showProfileOptions && (
						<OptionsComponent>
							<div
								onClick={(e) => {
									e.preventDefault();
									handleSignIn(
										supabase,
										"github",
										route || "/"
									);
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
									handleSignIn(
										supabase,
										"google",
										route || "/"
									);
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
		</>
	);
}

export const OptionsComponent = ({ children }: { children: JSX.Element[] }) => {
	return (
		<div className="flex flex-col absolute top-8 right-10  p-4 rounded-md bg-black shadow-sm shadow-white gap-4">
			{children}
		</div>
	);
};
