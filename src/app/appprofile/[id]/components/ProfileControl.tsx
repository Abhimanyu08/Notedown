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
				<Link href={`/appprofile/${id}`}>About</Link>
				{!pathname?.endsWith("posts") &&
				!pathname?.startsWith("/apppost") ? (
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
				<Link href={`/appprofile/${id}/posts`}>Posts</Link>
				{pathname?.endsWith("posts") ||
				pathname?.startsWith("/apppost") ? (
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
