"use client";
import { RawObject, rawObjectToDraft } from "@utils/processDrafts";
import { SingleDraft } from "./SingleDraft";

export function DraftsDisplay({
	rawObjects,
	tag,
}: {
	rawObjects: RawObject[];
	tag?: string;
}) {
	const drafts = rawObjects.map((r) => rawObjectToDraft(r));
	return (
		<>
			{drafts.map((draft) => {
				return (
					<div
						className="flex flex-col  relative "
						key={draft.timeStamp}
					>
						<SingleDraft draft={draft} tag={tag} />
					</div>
				);
			})}
		</>
	);
}
