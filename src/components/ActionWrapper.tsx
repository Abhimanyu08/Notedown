"use client";
import React from "react";
import {
	Menubar,
	MenubarContent,
	MenubarMenu,
	MenubarTrigger,
} from "./ui/menubar";
import { SlOptions } from "react-icons/sl";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

function ActionWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	return (
		<Menubar
			className={`absolute top-3 right-3 w-fit h-fit border-none
					rounded-md bg-transparent hover:bg-secondary
					${!(pathname?.includes("post") || pathname?.includes("draft")) ? "" : "hidden"}
			`}
		>
			<MenubarMenu>
				<MenubarTrigger className="p-[2px] rounded-md">
					<SlOptions size={12} />
				</MenubarTrigger>
				<MenubarContent className="min-w-0 border-border">
					{children}
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}

export default ActionWrapper;
