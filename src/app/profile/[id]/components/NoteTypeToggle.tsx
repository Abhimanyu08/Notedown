"use client";
import { cn } from "@/lib/utils";
import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import Link from "next/link";
import {
	useParams,
	usePathname,
	useSelectedLayoutSegment,
} from "next/navigation";
import React from "react";

function NoteTypeToggle({ className }: { className?: string }) {
	const params = useParams() as { id: string };
	const layout = useSelectedLayoutSegment();
	console.log("Layout from noteypetoggle", layout);

	return (
		<>
			<RadioGroup
				value={layout ? layout : "all"}
				className={cn("flex gap-4 py-2 font-mono", className)}
			>
				<Link
					href={`/profile/${params.id}`}
					className="flex items-center space-x-2"
				>
					<RadioGroupItem value="all" id="all" />
					<Label htmlFor="all">All</Label>
				</Link>
				<Link
					href={`/profile/${params.id}/public`}
					className="flex items-center space-x-2"
				>
					<RadioGroupItem value="public" id="public" />
					<Label htmlFor="public">Public</Label>
				</Link>
				<Link
					href={`/profile/${params.id}/private`}
					className="flex items-center space-x-2"
				>
					<RadioGroupItem value="private" id="private" />
					<Label htmlFor="private">Private</Label>
				</Link>
			</RadioGroup>
		</>
	);
}

export default NoteTypeToggle;
