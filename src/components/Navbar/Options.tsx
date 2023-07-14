"use client";
import { useSupabase } from "@/app/appContext";
import { cn } from "@/lib/utils";
import Button from "@components/ui/button";
import Divider from "@components/ui/divider";
import { handleSignIn } from "@utils/handleAuth";
import { AiFillGithub, AiFillGoogleCircle } from "react-icons/ai";

export function NotLoggedInOptions({
	className,
}: React.ComponentPropsWithoutRef<"div">) {
	const { supabase } = useSupabase();
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Button
				onClick={(e) => {
					e.preventDefault();
					handleSignIn(supabase, "github", "/");
				}}
				className="p-2 justify-center gap-2"
			>
				<AiFillGithub size={20} className="w-4 md:w-6 text-white " />{" "}
				GitHub
			</Button>
			<Divider>Or</Divider>
			<Button
				onClick={(e) => {
					e.preventDefault();
					handleSignIn(supabase, "google", "/");
				}}
				className="p-2 justify-center gap-2"
				// className="btn btn-xs w-fit md:btn-sm bg-base-100 text-white normal-case"
			>
				<AiFillGoogleCircle
					size={20}
					className="w-4 md:w-6 text-white "
				/>
				Google
			</Button>
		</div>
	);
}
