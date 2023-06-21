import parser, { HtmlNode, TextNode } from "@utils/html2Jsx/parser";
import tokenizer from "@utils/html2Jsx/tokenizer";
import transformer from "@utils/html2Jsx/transformer";
import mdToHtml from "@utils/mdToHtml";
import React, { memo, useEffect, useState } from "react";

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
			setSummaryJsx(
				transformer(
					parser(tokenizer(mdToHtml(summaryText))).children.at(0) || {
						tagName: "text",
						text: "",
					}
				)
			);
		}
		if (detailsText) {
			setDetailsJsx(
				transformer(
					parser(tokenizer(mdToHtml(detailsText))).children.at(0) || {
						tagName: "text",
						text: "",
					}
				)
			);
		}
	}, [summaryText, detailsText]);

	return (
		<details className="marker:text-white p-4 bg-slate-900">
			<summary className="[&>p]:inline cursor-pointer text-lg ">
				{summaryJsx}
			</summary>
			{detailsJsx}
		</details>
	);
}

export default memo(Details);
