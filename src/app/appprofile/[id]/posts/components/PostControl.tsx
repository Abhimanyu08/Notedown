"use client";
import React, { useContext, useState } from "react";
import { ProfileButton } from "../../components/ProfileButton";
import { motion } from "framer-motion";
import { PostTypeContext } from "./PostTypeContext";
import { PostTypesList } from "@/interfaces/PostTypes";
import { useSupabase } from "@/app/appContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

function PostControl() {
	// const { postType, setPostType } = useContext(PostTypeContext);
	const { session } = useSupabase();
	const pathname = usePathname();
	const profileId = pathname?.split("/").at(2);
	let postType = pathname?.split("/").at(-1);
	if (postType === "posts") postType = "latest";
	console.log(profileId, session?.user.id);
	return (
		<>
			{PostTypesList.filter((t) => t !== "postpreview").map((type) => {
				if (session?.user.id !== profileId && type === "private")
					return;
				return (
					<ProfileButton
						key={type}
						// onClick={() => setPostType(type)}
						className="px-3 py-1 hover:italic active:scale-95"
						// className="text-sm bg-gray-800 hover:scale-105 ative:scale-95  px-3  border-black border-[1px] transition-[scale] duration-200 rounded-md"
					>
						<Link
							href={`/appprofile/${profileId}/posts/${
								type === "latest" ? "" : type
							}`}
							className="flex items-center"
						>
							<span className="text-xs capitalize">{type}</span>
							{postType === type ? (
								<motion.div
									className="absolute inset-0 bg-neutral-100 dark:bg-gray-800 rounded-sm z-[-1]"
									layoutId="postbar"
									transition={{
										type: "spring",
										stiffness: 350,
										damping: 30,
									}}
								/>
							) : null}
						</Link>
					</ProfileButton>
				);
			})}
		</>
	);
}

export default PostControl;
