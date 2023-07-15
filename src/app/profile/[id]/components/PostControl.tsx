"use client";
import { useSupabase } from "@/app/appContext";
import useOwner from "@/hooks/useOwner";
import { PostTypesList } from "@/interfaces/PostTypes";
import Tabs, { TabChildren } from "@components/ui/tabs";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

function PostControl() {
	// const { postType, setPostType } = useContext(PostTypeContext);
	const { session } = useSupabase();
	const pathname = usePathname();
	const owner = useOwner();
	// console.log("Layout ->", layout);
	let postType = pathname?.split("/").at(-1);
	return (
		<Tabs className="gap-2 mt-2 border-b-2 border-border w-fit">
			{PostTypesList.map((type) => {
				if (!owner && (type === "private" || type === "drafts")) return;
				return (
					<TabChildren
						active={postType === type}
						className="px-3 py-2 capitalize"
					>
						<Link href={`/profile/${session?.user.id}/${type}`}>
							{type}
						</Link>
					</TabChildren>
				);
			})}
		</Tabs>
	);
}

export default PostControl;
