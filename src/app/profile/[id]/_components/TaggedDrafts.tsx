"use client";
import { RawObject } from "@utils/processDrafts";
import { DraftsDisplay } from "./DraftsDisplay";

export function TaggedDrafts({
	tag,
	rawObjects,
}: {
	tag: string;
	rawObjects: RawObject[];
}) {
	return (
		<details>
			<summary className="text-lg font-serif font-bold cursor-pointer">
				{tag}
			</summary>
			<div className="border-l-2 border-border ml-1 pl-4">
				<DraftsDisplay rawObjects={rawObjects} />
			</div>
		</details>
	);
}
