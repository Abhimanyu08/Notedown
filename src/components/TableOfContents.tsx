import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MdOutlineArrowDropDown, MdOutlineArrowRight } from "react-icons/md";

const headingToMargin: Record<string, string> = {
	h2: "ml-0",
	h3: "ml-4",
	h4: "ml-8",
	h5: "ml-12",
	h6: "ml-16",
};

const headingToFontSize: Record<string, string> = {
	h2: "text-xl",
	h3: "text-lg",
	h4: "text-base",
	h5: "text-sm",
	h6: "text-xs",
};
const headingToFontWeight: Record<string, string> = {
	h2: "font-bold",
	h3: "font-semibold",
	h4: "font-medium",
	h5: "font-normal",
	h6: "font-light",
};

export function Toc({
	html,
	setShowContents,
}: {
	html?: string;
	setShowContents: Dispatch<SetStateAction<boolean>>;
}) {
	const [matches, setMatches] = useState<RegExpMatchArray[]>();
	const [open, setOpen] = useState(true);

	useEffect(() => {
		if (!html) return;
		const re = /<(h(\d))( .*)?>((.|\r|\n)*?)<\/\1>/g;
		setMatches(Array.from(html.matchAll(re)));
	}, [html]);

	return (
		<div
			className="flex flex-col gap-5 md:ml-10 text-white"
			onClick={() => setShowContents(false)}
		>
			<h3
				className="text-xl font-semibold flex flex-row items-center"
				onClick={() => setOpen((prev) => !prev)}
			>
				{open ? (
					<MdOutlineArrowDropDown size={36} />
				) : (
					<MdOutlineArrowRight size={36} />
				)}
				<span>Table of Contents</span>
			</h3>
			<div
				className={`ml-10 flex flex-col gap-3 ${
					open ? "" : "invisible"
				} prose prose-sm prose-li:text-amber-400 prose-a:text-white prose-a:no-underline`}
			>
				<li>
					<a href="#title" className="text-xl font-bold">
						Title
					</a>
				</li>
				<li>
					<a href="#jsx" className="text-xl font-bold">
						Introduction
					</a>
				</li>
				{matches?.map((match) => {
					return (
						<li
							className={`${headingToMargin[match.at(1)!]}`}
							key={match.at(4)}
						>
							<a
								href={`#${match.at(4)}`}
								className={`${headingToFontSize[match.at(1)!]}
							${headingToFontWeight[match.at(1)!]}
						 link-hover`}
							>
								{match.at(4)}
							</a>
						</li>
					);
				})}
			</div>
		</div>
	);
}
