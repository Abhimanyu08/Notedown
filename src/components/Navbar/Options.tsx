"use client";
import { useSupabase } from "@/app/appContext";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import useOwner from "@/hooks/useOwner";
import { Database } from "@/interfaces/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@components/ui/button";
import Divider from "@components/ui/divider";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@components/ui/sheet";
import { useToast } from "@components/ui/use-toast";
import { handleLogout, handleSignIn } from "@utils/handleAuth";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { AiFillGithub, AiFillGoogleCircle } from "react-icons/ai";

export function NotLoggedInOptions({
	className,
}: React.ComponentPropsWithoutRef<"div">) {
	const pathname = usePathname();
	const { supabase } = useSupabase();
	const { session } = useSupabase();
	const { documentDb } = useContext(IndexedDbContext);
	const router = useRouter();

	useEffect(() => {
		if (!documentDb) return;

		const markdownObjectStore = getMarkdownObjectStore(
			documentDb,
			"readonly"
		);
		if (pathname === "/" && !session) {
			const countReq = markdownObjectStore.count();
			countReq.onsuccess = () => {
				if (countReq.result > 0) {
					router.push("/profile/anon");
				}
			};
		}
	}, [documentDb]);

	return (
		<div className={cn("flex flex-col gap-2 mt-4", className)}>
			<span>Login with:</span>
			<Button
				onClick={(e) => {
					e.preventDefault();
					handleSignIn(supabase, "github", pathname || "/");
				}}
				className="p-2 justify-center gap-2 bg-gray-200 hover:bg-gray-500 text-black"
			>
				<AiFillGithub size={20} className="w-4 md:w-6 " /> GitHub
			</Button>
			<Divider>Or</Divider>
			<Button
				onClick={(e) => {
					e.preventDefault();
					handleSignIn(supabase, "google", pathname || "/");
				}}
				className="p-2 justify-center gap-2 bg-gray-200 hover:bg-gray-500 text-black"
				// className="btn btn-xs w-fit md:btn-sm bg-base-100 text-white normal-case"
			>
				<AiFillGoogleCircle size={20} className="w-4 md:w-6" />
				Google
			</Button>
		</div>
	);
}

export function LoggedInOptions({
	name,
	username,
}: Partial<Database["public"]["Tables"]["bloggers"]["Row"]>) {
	const { supabase, session } = useSupabase();
	const nameRef = useRef<HTMLInputElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const userNameRef = useRef<HTMLInputElement>(null);
	const [userNameError, setUserNameError] = useState(false);
	const { toast } = useToast();
	//This component will only show up when user is on his or someone else'e profile. so if it's someone else's don't show the edit profile component.
	if (!session?.user) {
		return <NotLoggedInOptions />;
	}

	const onSubmit = async () => {
		const newName = nameRef.current?.value;
		const newTitle = titleRef.current?.value;
		const newUserName = userNameRef.current?.value;
		if (newName !== name) {
			await supabase
				.from("bloggers")
				.update({
					name: newName,
					notebook_title: newTitle,
				})
				.eq("id", session.user.id);
		}
		if (typeof newUserName === "string" && newUserName !== username) {
			const { error } = await supabase
				.from("bloggers")
				.update({
					username: newUserName,
				})
				.eq("id", session.user.id);
			if (error) setUserNameError(true);
		}
		toast({
			title: "Profile updated !",
		});
	};

	return (
		<div className="flex flex-col justify-between h-full [&>*]:px-2 [&>*]:py-1 mt-4 pb-4">
			<div className="">
				<SheetHeader>
					<SheetTitle>Edit profile</SheetTitle>
					<SheetDescription>
						Make changes to your profile here. Click save when you
						{`'`}re done.
					</SheetDescription>
				</SheetHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Name
						</Label>
						<Input
							id="name"
							defaultValue={name || ""}
							className="col-span-3"
							placeholder="Enter your name"
							ref={nameRef}
						/>
					</div>
					{/* <div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="username" className="text-right">
								Title
							</Label>
							<Input
								id="title"
								defaultValue={notebook_title || undefined}
								className="col-span-3"
								placeholder="A title for your note collection"
								ref={titleRef}
							/>
						</div> */}
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="username" className="text-right">
							Username
						</Label>
						<Input
							id="username"
							defaultValue={username || undefined}
							className="col-span-3"
							placeholder="Claim a username"
							ref={userNameRef}
						/>
					</div>
					{userNameError && (
						<div className="grid grid-cols-4 gap-4">
							<span className="col-start-2 col-span-3 text-xs text-red-400">
								Already taken. Please enter another username
							</span>
						</div>
					)}
				</div>

				<SheetFooter>
					<Button
						type="submit"
						className="px-2 py-1 gap-2 bg-gray-200 hover:bg-gray-500 text-black"
						onClick={() => onSubmit()}
					>
						<span>Save Changes</span>
					</Button>
				</SheetFooter>
			</div>
			<Button
				className="bg-gray-200 hover:bg-gray-500 text-black"
				onClick={() => handleLogout(supabase)}
			>
				Log Out
			</Button>
		</div>
	);
}
