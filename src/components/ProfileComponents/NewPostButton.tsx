import { Button } from "@components/ui/button";
import Link from "next/link";
import React from "react";
import { TfiPencilAlt } from "react-icons/tfi";

function NewNoteButton() {
	return (
		<Link href={"/write"} prefetch={false}>
			<Button
				className="gap-2 text-gray-300"
				variant="secondary"
				size={"sm"}
			>
				<TfiPencilAlt size={14} />
				<span>New Note</span>
			</Button>
		</Link>
	);
}

export default NewNoteButton;
