import { Button } from "@components/ui/button";
import Link from "next/link";
import React from "react";
import { TfiPencilAlt } from "react-icons/tfi";

function NewNoteButton() {
	return (
		<Link href={"/write"} prefetch={false} className="w-full">
			<Button
				className="gap-2 w-full rounded-none"
				variant="secondary"
				size={"lg"}
			>
				<TfiPencilAlt size={14} />
				<span>New Note</span>
			</Button>
		</Link>
	);
}

export default NewNoteButton;
