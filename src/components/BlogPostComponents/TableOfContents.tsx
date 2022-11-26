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
	h6: "text-sm",
};

export function Toc({
	html,
	setShowContents,
}: {
	html?: string;
	setShowContents: Dispatch<SetStateAction<boolean>>;
}) {
	const [matches, setMatches] = useState<RegExpMatchArray[]>();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!html) {
			setMatches([]);
			return;
		}
		const re = /<(h(\d))( .*)?>((.|\r|\n)*?)<\/\1>/g;
		setMatches(Array.from(html.matchAll(re)));
	}, [html]);

	return (
		<div
			className="flex flex-col gap-5  text-white max-w-full pr-1"
			onClick={() => setShowContents(false)}
		>
			<h3
				className="ml-8 lg:ml-0 text-xl font-semibold flex flex-row items-center"
				onClick={() => setOpen((prev) => !prev)}
			>
				{open ? (
					<MdOutlineArrowDropDown
						size={36}
						className="hidden lg:block"
					/>
				) : (
					<MdOutlineArrowRight
						size={36}
						className="hidden lg:block"
					/>
				)}
				<span className="underline underline-offset-2 cursor-pointer">
					Table of Contents
				</span>
			</h3>
			<div
				className={`ml-10 flex flex-col gap-3 ${
					open ? "" : "lg:invisible"
				} prose prose-sm prose-li:text-amber-400 prose-a:text-white prose-a:no-underline pb-10`}
			>
				<li>
					<a href="#title" className="text-xl font-bold">
						Title
					</a>
				</li>
				{matches?.map((match) => {
					return (
						<li
							className={`${
								headingToMargin[match.at(1)!]
							} break-words`}
							key={match.at(4)}
						>
							<a
								href={`#${match.at(4)}`}
								className={`${headingToFontSize[match.at(1)!]}
							font-semibold
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
