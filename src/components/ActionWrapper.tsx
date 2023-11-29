"use client";
import useOwner from "@/hooks/useOwner";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { SlOptions } from "react-icons/sl";
import { ToolTipComponent } from "./ToolTipComponent";
import {
	Menubar,
	MenubarContent,
	MenubarMenu,
	MenubarTrigger,
} from "./ui/menubar";
import Link from "next/link";

function ClosePreviewButton() {
	const params = useParams();
	const searchParams = useSearchParams();
	return (
		<ToolTipComponent
			tip="Close preview"
			className="
			absolute top-3 right-3 w-fit h-fit bg-gray-400 hover:bg-gray-100 active:scale-95 text-black rounded-full p-1 z-1000"
			side="right"
		>
			<Link
				href={
					`/notebook/${params?.id}` +
					(searchParams?.has("showtag")
						? `?showtag=${searchParams?.get("showtag")}`
						: "")
				}
			>
				<X size={12} />
			</Link>
		</ToolTipComponent>
	);
}

function ActionWrapper({
	children,
	tag,
	postId,
	slug,
	draftId,
}: {
	children: React.ReactNode;

	tag: string;
	postId?: number;
	slug?: string;
	draftId?: string;
}) {
	const searchParams = useSearchParams();

	const owner = useOwner();

	if (searchParams?.has("note") || searchParams?.has("draft")) {
		if (searchParams.get("tag") !== tag) return null;
		const draftParam = searchParams.get("draft");
		const noteParam = searchParams.get("note");
		if (draftParam && draftId) {
			if (draftId !== draftParam) return null;
			return <ClosePreviewButton />;
		}
		if (noteParam) {
			if (parseInt(noteParam as string) !== postId && noteParam !== slug)
				return null;
			return <ClosePreviewButton />;
		}
		return null;
	}
	if (!owner) return null;

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
