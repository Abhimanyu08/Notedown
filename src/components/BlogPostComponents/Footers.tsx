import { ToolTipComponent } from "@components/ToolTipComponent";
import { TagToJsx } from "@utils/html2Jsx/TagToJsx";
import { HtmlAstElement, transformer } from "@utils/html2Jsx/transformer";
import React from "react";

function Footers({
	footNotes,
	tagToJsxConverter,
}: {
	footNotes: { id: number; node: HtmlAstElement }[];
	tagToJsxConverter: TagToJsx;
}) {
	return (
		<div id="footer-section">
			{footNotes
				.sort((a, b) => (a.id < b.id ? -1 : 1))
				.map((footNote) => {
					return (
						<li className="flex gap-2 " key={footNote.id}>
							<span className="hover:underline text-gray-100 hover:text-white">
								<ToolTipComponent tip="Back to content">
									<a
										href={`#footnote-referrer-${footNote.id}`}
									>
										{footNote.id}.
									</a>
								</ToolTipComponent>
							</span>
							{transformer(footNote.node, tagToJsxConverter)}
						</li>
					);
				})}
		</div>
	);
}

export default Footers;
