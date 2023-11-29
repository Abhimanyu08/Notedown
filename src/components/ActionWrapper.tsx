"use client";
import React from "react";
import {
	Menubar,
	MenubarContent,
	MenubarMenu,
	MenubarTrigger,
} from "./ui/menubar";
import { SlOptions } from "react-icons/sl";
import {
	useParams,
	usePathname,
	useSelectedLayoutSegment,
} from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ToolTipComponent } from "./ToolTipComponent";
import Link from "next/link";

function ClosePreviewButton() {
	return (
		<ToolTipComponent
			tip="Close preview"
			className="
			absolute top-3 right-3 w-fit h-fit bg-gray-400 text-black rounded-full p-1 z-1000"
		>
			<Link href={`/note/null`} prefetch={false} replace={true}>
				<X size={12} />
			</Link>
		</ToolTipComponent>
	);
}

function ActionWrapper({ children }: { children: React.ReactNode }) {
	return (
		<Menubar
			className={cn(
				`absolute top-3 right-3 w-fit h-fit border-none
					rounded-md bg-transparent hover:bg-secondary
			`
			)}
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
