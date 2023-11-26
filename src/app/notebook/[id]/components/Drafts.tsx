"use client";
import React, { useContext } from "react";
import { DraftsDisplay } from "./DraftsDisplay";
import { TaggedDrafts } from "./TaggedDrafts";
import { ProfileContext } from "@/contexts/ProfileContext";

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
}

export default Drafts;
