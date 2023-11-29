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
	useRouter,
	useSearchParams,
} from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { ToolTipComponent } from "./ToolTipComponent";
import Link from "next/link";

function ClosePreviewButton() {
	const router = useRouter();
	const params = useParams();
	return (
		<ToolTipComponent
			tip="Close preview"
			className="
			absolute top-3 right-3 w-fit h-fit bg-gray-400 text-black rounded-full p-1 z-1000"
			onClick={() =>
				router.replace(`/notebook/${params?.id}`, { shallow: true })
			}
		>
			<X size={12} />
		</ToolTipComponent>
	);
}

function ActionWrapper({
	children,
	postId,
	slug,
	draftId,
}: {
	children: React.ReactNode;
	postId?: number;
	slug?: string;
	draftId?: string;
}) {
	const searchParams = useSearchParams();

	if (searchParams?.has("note") || searchParams?.has("draft")) {
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
