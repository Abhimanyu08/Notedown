"use client";
import { useSupabase } from "@/app/appContext";
import { handleLogout, handleSignIn } from "@utils/handleAuth";
import Link from "next/link";
import { AiFillGithub, AiFillGoogleCircle } from "react-icons/ai";
import { HiMenu } from "react-icons/hi";

function Options({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col absolute top-8 right-10  p-4 rounded-sm group-focus:visible bg-black shadow-sm shadow-white gap-4 invisible group-hover:visible transition-all duration-500">
			{children}
		</div>
	);
}

export function LoggedInOptions({ userId }: { userId: string }) {
	const { supabase } = useSupabase();
	return (
		<Options>
			<Link href={`/profile/${userId}`}>
				<p className="cursor-pointer p-2 hover:bg-gray-500 rounded-sm text-xs md:text-base text-white">
					Profile
				</p>
			</Link>
			<div
				onClick={async (e) => {
					e.preventDefault();
					await handleLogout(supabase);
				}}
				className="cursor-pointer text-xs p-2 rounded-sm md:text-base hover:bg-gray-500 text-white"
			>
				Logout
			</div>
		</Options>
	);
}

export function NotLoggedInOptions() {
	const { supabase } = useSupabase();
	return (
		<Options>
			<div
				onClick={(e) => {
					e.preventDefault();
					handleSignIn(supabase, "github", "/");
				}}
				// className="btn btn-xs md:btn-sm normal-case w-fit text-white"
				className="flex gap-2 items-center hover:bg-gray-500 px-4 p-2  rounded-sm cursor-pointer"
			>
				<AiFillGithub size={20} className="w-4 md:w-6 text-white " />{" "}
				GitHub
			</div>
			<div
				onClick={(e) => {
					e.preventDefault();
					handleSignIn(supabase, "google", "/");
				}}
				// className="btn btn-xs w-fit md:btn-sm bg-base-100 text-white normal-case"
				className="flex gap-2 items-center hover:bg-gray-500 px-4 p-2  rounded-sm cursor-pointer"
			>
				<AiFillGoogleCircle
					size={20}
					className="w-4 md:w-6 text-white "
				/>
				Google
			</div>
		</Options>
	);
}
