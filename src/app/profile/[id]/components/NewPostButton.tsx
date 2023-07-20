import Button from "@components/ui/button";
import Link from "next/link";
import React from "react";
import { TfiPencilAlt } from "react-icons/tfi";

function NewNoteButton() {
	return (
		<Link href={"/write"}>
			<Button className="px-3 py-1 text-sm gap-2 hover:bg-secondary">
				<TfiPencilAlt />
				<span>New Note</span>
			</Button>
		</Link>
	);
}

export default NewNoteButton;
