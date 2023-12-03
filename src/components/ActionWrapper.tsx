"use client";
import useOwner from "@/hooks/useOwner";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
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

	let href = `/notebook/${params?.id}`;

	if (searchParams?.get("showtag")) {
		href += `?showtag=${searchParams.get("showtag")}`;
	}
	if (searchParams?.get("q")) {
		href += `?q=${searchParams.get("q")}`;
	}
	return (
		<ToolTipComponent
			tip="Close preview"
			className="
			absolute top-3 right-3 w-fit h-fit bg-gray-400 hover:bg-gray-100 active:scale-95 text-black rounded-full p-1 z-1000"
			side="right"
		>
			<Link href={href}>
				<X size={12} />
			</Link>
		</ToolTipComponent>
	);
}

function ActionWrapper({
	children,
	href,
}: {
	children: React.ReactNode;

	href: string;
}) {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const owner = useOwner();

	if (pathname + "?" + searchParams?.toString() === href) {
		return <ClosePreviewButton />;
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
