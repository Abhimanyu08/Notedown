"use client";
import { useSupabase } from "@/app/appContext";
import useOwner from "@/hooks/useOwner";
import { cn } from "@/lib/utils";
import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

function NoteTypeToggle({ className }: { className?: string }) {
	const { session } = useSupabase();
	const owner = useOwner();
	const layout = useSelectedLayoutSegment();

	if (!owner) return <></>;

	return (
		<>
			<RadioGroup
				value={layout ? layout : "all"}
				className={cn("flex gap-4 py-2 font-mono", className)}
			>
				<Link
					href={`/profile/${session?.user.id}`}
					className="flex items-center space-x-2"
				>
					<RadioGroupItem value="all" id="all" />
					<Label htmlFor="all">All</Label>
				</Link>
				<Link
					href={`/profile/${session?.user.id}/public`}
					className="flex items-center space-x-2"
				>
					<RadioGroupItem value="public" id="public" />
					<Label htmlFor="public">Public</Label>
				</Link>
				<Link
					href={`/profile/${session?.user.id}/private`}
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
