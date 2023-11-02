"use client";
import { ProfileContext } from "@/contexts/ProfileContext";
import { useContext } from "react";
import { DraftsDisplay } from "./components/DraftsDisplay";
import { TaggedDrafts } from "./components/TaggedDrafts";

function Drafts() {
	const { draftAndPostMap } = useContext(ProfileContext);

	return (
		<>
			{Array.from(draftAndPostMap.keys()).map((tag) => {
				if (draftAndPostMap.get(tag)!.posts.length > 0) return;
				return (
					<TaggedDrafts key={tag} tag={tag}>
						<DraftsDisplay tag={tag} />
					</TaggedDrafts>
				);
			})}
		</>
	);

	// return (
	// 	<div className="flex flex-col gap-2 mt-20  items-center  text-gray-500 ">
	// 		<div className="text-left flex flex-col gap-2 font-serif text-xl italic tracking-wide">
	// 			<span>Lying in wait, set to pounce on the blank page,</span>
	// 			<span>are letters up to no good,</span>
	// 			<span>clutches of clauses so subordinate</span>
	// 			<span>they{`'`}ll never let her get away.</span>
	// 		</div>
	// 		<span className="underline underline-offset-2 text-sm self-center">
	// 			- The Joy Of Writing, Wislawa Szymborska
	// 		</span>
	// 		<Button
	// 			variant={"secondary"}
	// 			className="mt-10 w-fit px-3 py-1 self-center text-gray-400"
	// 		>
	// 			<Link href={"/write"}>Start writing</Link>
	// 		</Button>
	// 	</div>
	// );
}

export default Drafts;
