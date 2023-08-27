"use client";
import ActionWrapper from "@components/ActionWrapper";
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
		<ActionWrapper>
			<MenubarItem className="">
				<Link
					href={`/write?draft=${draft.timeStamp}`}
					prefetch={false}
					className="flex gap-2 items-center"
				>
					<AiFillEdit className="inline" size={15} />{" "}
					<span>Edit</span>
				</Link>
			</MenubarItem>
		</ActionWrapper>
	);
}
