"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileButton } from "./ProfileButton";

function ProfileControl({ id }: { id: string }) {
	const pathname = usePathname();
	return (
		<div className="profile-control flex flex-col  gap-3 mt-10 text-sm">
			<Link href={`/profile/${id}`}>
				<ProfileButton className="px-3 py-1 hover:italic active:scale-95">
					About
					{!pathname?.includes("posts") &&
					!pathname?.startsWith("/post") ? (
						<motion.div
							className="absolute inset-0 bg-neutral-100 dark:bg-gray-800 rounded-sm z-[-1]"
							layoutId="sidebar"
							transition={{
								type: "spring",
								stiffness: 350,
								damping: 30,
							}}
						/>
					) : null}
				</ProfileButton>
			</Link>
			<Link href={`/profile/${id}/posts`}>
				<ProfileButton className="px-3 py-1 hover:italic active:scale-95">
					Posts
					{pathname?.includes("posts") ||
					pathname?.startsWith("/post") ? (
						<motion.div
							className="absolute inset-0 bg-neutral-100 dark:bg-gray-800 rounded-sm z-[-1]"
							layoutId="sidebar"
							transition={{
								type: "spring",
								stiffness: 350,
								damping: 30,
							}}
						/>
					) : null}
				</ProfileButton>
			</Link>
		</div>
	);
}

export default ProfileControl;
