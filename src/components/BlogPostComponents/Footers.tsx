import { HtmlNode } from "@utils/html2Jsx/parser";
import transformer from "@utils/html2Jsx/transformer";
import React from "react";

function Footers({
	footNotes,
}: {
	footNotes: { id: number; node: HtmlNode }[];
}) {
	return (
		<div id="footer-section">
			{footNotes
				.sort((a, b) => (a.id < b.id ? -1 : 1))
				.map((footNote) => {
					return (
						<li className="flex gap-2 " key={footNote.id}>
							<span className="hover:underline text-gray-100 hover:text-white">
								<a
									href={`#footnote-referrer-${footNote.id}`}
									className="tooltip tooltip-top"
									data-tip="Back to content"
								>
									{footNote.id}.
								</a>
							</span>
							{transformer(footNote.node)}
						</li>
					);
				})}
		</div>
	);
}

export default Footers;
