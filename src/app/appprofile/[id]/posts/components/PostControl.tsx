"use client";
import React, { useContext, useState } from "react";
import { ProfileButton } from "../../components/ProfileButton";
import { motion } from "framer-motion";
import { PostTypeContext } from "./PostTypeContext";
import { PostTypesList } from "@/interfaces/PostTypes";

function PostControl() {
	const { postType, setPostType } = useContext(PostTypeContext);
	return (
		<>
			{PostTypesList.filter((t) => t !== "postpreview").map((type) => {
				return (
					<ProfileButton
						key={type}
						onClick={() => setPostType(type)}
						className="px-3 py-1 hover:italic active:scale-95"
						// className="text-sm bg-gray-800 hover:scale-105 ative:scale-95  px-3  border-black border-[1px] transition-[scale] duration-200 rounded-md"
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
					</ProfileButton>
				);
			})}
		</>
	);
}

export default PostControl;
