"use client";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@components/ui/menubar";
import { Draft } from "@utils/processDrafts";
import Link from "next/link";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";

export function DraftActions({ draft }: { draft: Draft }) {
	return (
		<Menubar
			className="absolute top-3 right-3 w-fit h-fit border-none
					rounded-full bg-transparent hover:bg-accent
				"
		>
			<MenubarMenu>
				<MenubarTrigger className="p-1">
					<SlOptions size={12} />
				</MenubarTrigger>
				<MenubarContent className="min-w-0 border-border">
					<MenubarItem className="">
						<Link
							href={
								draft.postId
									? `/write/${draft.postId}?draft=${draft.timeStamp}`
									: `/write?draft=${draft.timeStamp}`
							}
							prefetch={false}
							className="flex gap-2 items-center"
						>
							<AiFillEdit className="inline" size={15} />{" "}
							<span>Edit</span>
						</Link>
					</MenubarItem>
					<MenubarItem>
						<AiFillDelete className="inline" size={15} /> Delete
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
