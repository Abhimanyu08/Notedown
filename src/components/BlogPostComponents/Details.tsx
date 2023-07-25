"use client";
import { mdToHast, transformer } from "@utils/html2Jsx/transformer";
import { memo, useEffect, useState } from "react";

function Details({
	summaryText,
	detailsText,
}: {
	detailsText: string;
	summaryText: string;
}) {
	const [summaryJsx, setSummaryJsx] = useState<JSX.Element>(<></>);
	const [detailsJsx, setDetailsJsx] = useState<JSX.Element>(<></>);

	useEffect(() => {
		// setSummaryText(st)

		if (summaryText) {
			setSummaryJsx(transformer(mdToHast(summaryText)));
		}
		if (detailsText) {
			setDetailsJsx(transformer(mdToHast(detailsText)));
		}
	}, [summaryText, detailsText]);

	return (
		<details className="marker:text-white py-3 px-4 rounded-sm border-[1px] border-gray-200">
			<summary className="[&>p]:inline cursor-pointer text-lg ">
				{summaryJsx}
			</summary>
			<section className="px-4">{detailsJsx}</section>
		</details>
	);
}

export default memo(Details);
