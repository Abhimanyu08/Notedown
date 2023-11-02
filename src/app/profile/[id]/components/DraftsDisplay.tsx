"use client";
import { ProfileContext } from "@/contexts/ProfileContext";
import { useContext } from "react";
import { SingleDraft } from "./SingleDraft";

export function DraftsDisplay({ tag }: { tag: string }) {
	const { draftAndPostMap } = useContext(ProfileContext);
	console.log(tag, draftAndPostMap);

	if (draftAndPostMap.size === 0) {
		return <></>;
	}

	const drafts = draftAndPostMap.get(tag)!.drafts;
	return (
		<>
			{drafts.map((draft) => {
				return (
					<div
						className="flex flex-col relative gap-3"
						key={draft.timeStamp}
					>
						<SingleDraft draft={draft} tag={tag} />
					</div>
				);
			})}
		</>
	);
}
