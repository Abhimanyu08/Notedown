"use client";
import { useSupabase } from "@/app/appContext";
import useOwner from "@/hooks/useOwner";
import { PostTypesList } from "@/interfaces/PostTypes";
import { cn } from "@/lib/utils";
import Tabs, { TabChildren } from "@components/ui/tabs";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";

function PostControl({ className }: { className?: string }) {
	// const { postType, setPostType } = useContext(PostTypeContext);
	const { session } = useSupabase();
	const layout = useSelectedLayoutSegment();
	const params = useParams();
	const owner = useOwner();

	// console.log("Layout ->", layout);

	return (
		<Tabs className={cn("gap-8  w-fit", className)}>
			{PostTypesList.map((type) => {
				if (!owner && type === "drafts") return;
				return (
					<TabChildren
						className="py-1 capitalize"
						active={
							type === "notes"
								? layout !== "drafts"
								: layout === "drafts"
						}
						key={type}
					>
						<Link
							href={
								type === "notes"
									? `/profile/${params?.id}`
									: `/profile/${session?.user.id}/${type}`
							}
						>
							{type}
						</Link>
					</TabChildren>
				);
			})}
		</Tabs>
	);
}

export default PostControl;
