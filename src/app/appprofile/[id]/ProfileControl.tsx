"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

function ProfileControl() {
	const [section, setSection] = useState<"About" | "Posts">("About");
	const pathname = usePathname();
	return (
		<div className="profile-control flex flex-col  gap-3 mt-10 text-sm">
			<ProfileButton onClick={() => setSection("About")}>
				<Link href={`${pathname?.split("/").slice(0, 3).join("/")}`}>
					About
				</Link>
				{!pathname?.endsWith("posts") ? (
					<motion.div
						className="absolute inset-0 bg-neutral-100 dark:bg-gray-800 rounded-md z-[-1]"
						layoutId="sidebar"
						transition={{
							type: "spring",
							stiffness: 350,
							damping: 30,
						}}
					/>
				) : null}
			</ProfileButton>
			<ProfileButton onClick={() => setSection("Posts")}>
				<Link href={`${pathname}/posts`}>Posts</Link>
				{pathname?.endsWith("posts") ? (
					<motion.div
						className="absolute inset-0 bg-neutral-100 dark:bg-gray-800 rounded-md z-[-1]"
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

function ProfileButton({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
	return (
		<button
			// className="text-sm bg-gray-800 hover:scale-105 active:scale-95  px-3  py-1 border-black border-[1px] transition-[scale]
			// duration-200 rounded-md"
			className="relative px-2 py-1 hover:scale-105 active:scale-95"
			onClick={onClick}
		>
			{children}
		</button>
	);
}

export default ProfileControl;
