"use client";
import { RawObject } from "@utils/processDrafts";
import { DraftsDisplay } from "./DraftsDisplay";

export async function NoTagDrafts({ rawObjects }: { rawObjects: RawObject[] }) {
	return (
		<div className="pl-4 border-l-2 border-border ml-1">
			<DraftsDisplay rawObjects={rawObjects} />
		</div>
	);
}
