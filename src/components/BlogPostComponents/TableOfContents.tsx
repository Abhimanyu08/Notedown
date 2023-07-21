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
		<ul
			className={` flex flex-col text-gray-700  dark:text-gray-400 tracking-wider gap-1 list-inside font-sans font-light text-sm list-disc text-left`}
		>
			<li className="">
				<a
					href="#title"
					className="hover:text-black hover:dark:text-white"
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
							className={`hover:text-black  hover:dark:text-white`}
						>
							{heading}
						</a>
					</li>
				);
			})}
		</ul>
	);
});

export default Toc;
