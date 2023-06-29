"use client";
import { useSupabase } from "@/app/appContext";
import { PostTypesList } from "@/interfaces/PostTypes";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ProfileButton } from "../../components/ProfileButton";
import useOwner from "@/hooks/useOwner";

function PostControl() {
	// const { postType, setPostType } = useContext(PostTypeContext);
	const { session } = useSupabase();
	const pathname = usePathname();
	const owner = useOwner();
	const params = useParams();
	let postType = pathname?.split("/").at(-1);
	return (
		<>
			{PostTypesList.map((type) => {
				if (!owner && (type === "private" || type === "drafts")) return;
				return (
					<Link
						href={`/profile/${params!.id}/posts/${type}`}
						className="flex items-center"
						key={type}
					>
						<ProfileButton
							// onClick={() => setPostType(type)}
							className="px-3 py-1 flex items-center justify-center hover:font-semibold active:scale-95"
							// className="text-sm bg-gray-800 hover:scale-105 ative:scale-95  px-3  border-black border-[1px] transition-[scale] duration-200 rounded-md"
						>
							<span className="text-xs capitalize">{type}</span>
							{postType === type ? (
								<motion.div
									className="absolute inset-0 bg-neutral-100 dark:bg-gray-800 rounded-sm z-[-1]"
									layoutId="postbar"
									transition={{
										type: "spring",
										stiffness: 350,
										damping: 30,
									}}
								/>
							) : null}
						</ProfileButton>
					</Link>
				);
			})}
		</>
	);
}

export default PostControl;
