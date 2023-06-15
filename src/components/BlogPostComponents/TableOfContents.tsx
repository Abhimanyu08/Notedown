import parser, { HtmlNode } from "@utils/html2Jsx/parser";
import tokenizer from "@utils/html2Jsx/tokenizer";
import {
	createHeadingIdFromHeadingText,
	extractTextFromChildren,
} from "@utils/html2Jsx/transformer";
import { Dispatch, SetStateAction, memo } from "react";

const headingToMargin: Record<string, string> = {
	h2: "ml-0",
	h3: "ml-4",
	h4: "ml-8",
	h5: "ml-12",
	h6: "ml-16",
};

const Toc = memo(function Toc({
	html,
	setShowContents,
}: {
	html: string;
	setShowContents?: Dispatch<SetStateAction<boolean>>;
}) {
	// const { blogState } = useContext(BlogContext);
	// const html = blogState.blogMeta.content;

	const re = /<(h(\d))( .*)?>((.|\r|\n)*?)<\/\1>/g;
	const matches = Array.from(html?.matchAll(re) || []);
	const headings: string[] = [];
	const headingIds: string[] = [];
	const headingTypes: string[] = [];
	matches.forEach((match) => {
		const headingElem = parser(tokenizer(match.at(0)!))
			.children[0] as HtmlNode;
		const headingText = extractTextFromChildren(headingElem.children);
		const headingId = createHeadingIdFromHeadingText(headingText);

		headings.push(headingText);
		headingIds.push(headingId);
		headingTypes.push(headingElem.tagName);
	});

	// const [matches, setMatches] = useState<RegExpMatchArray[]>();
	// const [open, setOpen] = useState(true);

	// useEffect(() => {
	// 	if (!html) {
	// 		setMatches([]);
	// 		return;
	// 	}
	// 	const re = /<(h(\d))( .*)?>((.|\r|\n)*?)<\/\1>/g;
	// 	setMatches(Array.from(html.matchAll(re)));
	// }, [html]);

	return (
		<div
			className="flex ml-7 flex-col gap-2 text-xs font-jsx-prose tracking-wide  text-gray-700 dark:text-white/70 max-w-full pr-1"
			// onClick={() => {
			// 	if (setShowContents) setShowContents(false);
			// }}
		>
			<h3
				className=" flex flex-row items-center underline underline-offset-2 cursor-pointer font-bold"
				// onClick={() => setOpen((prev) => !prev)}
			>
				Table of Contents
			</h3>
			<ul
				className={` flex flex-col gap-2     ${
					true ? "" : "lg:invisible"
				}  pb-14 text-gray-700 dark:text-gray-100/75 tracking-wider font-base`}
			>
				<li>
					<a
						href="#title"
						className="hover:text-black hover:dark:text-white hover:font-bold"
					>
						Title
					</a>
				</li>
				{headings.map((heading, idx) => {
					return (
						<li
							className={`
							${headingToMargin[headingTypes[idx]]} 
							break-words`}
							key={heading}
						>
							<a
								href={`#${headingIds[idx]}`}
								className={`hover:text-black hover:font-bold hover:dark:text-white`}
							>
								{heading}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
});

export default Toc;
