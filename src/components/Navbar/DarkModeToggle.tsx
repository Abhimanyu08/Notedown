"use client";
import React, { useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

function DarkModeToggle() {
	const [mode, setMode] = useState<"light" | "dark">(() => {
		if (typeof window !== "undefined") {
			return document?.documentElement.classList.contains("dark")
				? "dark"
				: "light";
		}
		return "dark";
	});
	return (
		<div
			className="self-end"
			onClick={() => {
				if (mode === "dark") {
					document.documentElement.classList.remove("dark");
					setMode("light");
					return;
				}
				setMode("dark");
				document.documentElement.classList.add("dark");
			}}
		>
			{mode === "dark" ? (
				<MdDarkMode size={20} />
			) : (
				<MdLightMode size={20} />
			)}
		</div>
	);
}

export default DarkModeToggle;
