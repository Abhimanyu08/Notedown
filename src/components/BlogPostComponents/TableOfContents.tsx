import { Dispatch, SetStateAction, useEffect, useState } from "react";

const headingToMargin: Record<string, string> = {
	h2: "ml-0",
	h3: "ml-4",
	h4: "ml-8",
	h5: "ml-12",
	h6: "ml-16",
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
		if (!html) {
			setMatches([]);
			return;
		}
		const re = /<(h(\d))( .*)?>((.|\r|\n)*?)<\/\1>/g;
		setMatches(Array.from(html.matchAll(re)));
	}, [html]);

	return (
		<div
			className="flex ml-7 flex-col gap-2 text-xs font-jsx-prose tracking-wide  text-gray-700 dark:text-white/70 max-w-full pr-1"
			onClick={() => setShowContents(false)}
		>
			<h3
				className=" flex flex-row items-center underline underline-offset-2 cursor-pointer font-bold"
				onClick={() => setOpen((prev) => !prev)}
			>
				Table of Contents
			</h3>
			<ul
				className={` flex flex-col gap-2     ${
					open ? "" : "lg:invisible"
				}  pb-14 text-gray-700 dark:text-gray-100/75 tracking-wider font-medium`}
			>
				<li>
					<a
						href="#title"
						className="hover:text-black hover:dark:text-white hover:font-bold"
					>
						Title
					</a>
				</li>
				{matches?.map((match) => {
					return (
						<li
							className={`
							${headingToMargin[match.at(1)!]} 
							break-words`}
							key={match.at(4)}
						>
							<a
								href={`#${match.at(4)}`}
								className={`hover:text-black hover:font-bold hover:dark:text-white`}
							>
								{match.at(4)}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
