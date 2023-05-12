"use client";
import React, { useState } from "react";
import { ProfileButton } from "../ProfileButton";
import { motion } from "framer-motion";

const PostTypes = ["Latest", "Greatest", "Private", "Upvoted"];

function PostControl() {
	const [postType, setPostType] =
		useState<(typeof PostTypes)[number]>("Latest");
	return (
		<div className="flex mx-auto justify-center gap-2">
			{PostTypes.map((type) => {
				return (
					<ProfileButton
						onClick={() => setPostType(type)}
						className="px-3 py-1 hover:italic active:scale-95"
						// className="text-sm bg-gray-800 hover:scale-105 active:scale-95  px-3  border-black border-[1px] transition-[scale] duration-200 rounded-md"
					>
						<span className="text-xs">{type}</span>
						{postType === type ? (
							<motion.div
								className="absolute inset-0 bg-neutral-100 dark:bg-gray-800 rounded-md z-[-1]"
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
		</div>
	);
}

export default PostControl;
