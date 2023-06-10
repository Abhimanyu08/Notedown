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
			<ProfileButton className="px-3 py-1 hover:italic active:scale-95">
				<Link href={`/profile/${id}`}>About</Link>
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
			<ProfileButton className="px-3 py-1 hover:italic active:scale-95">
				<Link href={`/profile/${id}/posts`}>Posts</Link>
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
		</div>
	);
}

export default ProfileControl;
