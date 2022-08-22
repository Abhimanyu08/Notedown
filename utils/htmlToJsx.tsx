import React from "react";
import Code from "../src/components/Code";

let BLOCK_NUMBER = 0;
interface htmlToJsxProps {
	html: string;
	language: string;
	containerId: string;
}
function htmlToJsx({
	html,
	language,
	containerId,
}: htmlToJsxProps): JSX.Element {
	const re = /([^<>]*?)(<(\S*)(.*?=\".*\")*?>(.|\r|\n)*?<\/\3>)([^<>]*)/g;
	const matches = Array.from(html.matchAll(re));
	if (matches.length === 0) return <>{html}</>;
	const elem = (
		<>
			{matches.map((match) => {
				const string1 = <>{match.at(1)}</>;
				const string2 = <>{match.at(6)}</>;
				const elem = match.at(2)!;
				const type = match.at(3);
				const content = elem.match(/<.+?>((.|\n|\r)+)<\/.*>/);

				if (type === "code") {
					BLOCK_NUMBER += 1;
					return (
						<>
							{string1}
							<Code
								key={BLOCK_NUMBER}
								language={language}
								containerId={containerId}
								text={content!.at(1)!}
								blockNumber={BLOCK_NUMBER}
							/>
							{string2}
						</>
					);
				}
				return (
					<>
						{string1}

						{React.createElement(
							type!,
							makeAttrMap(match.at(4)),
							htmlToJsx({
								html: content!.at(1)!,
								language,
								containerId,
							})
						)}
						{string2}
					</>
				);
			})}
		</>
	);
	return elem;
}

function makeAttrMap(match?: string) {
	let obj: Record<string, string> = {};
	if (!match) return obj;
	const re = /(.*?)=\"(.*?)\"/g;
	const attrs = Array.from(match.matchAll(re));
	for (const attr of attrs) {
		obj[attr[1].trim()] = attr[2].trim();
	}
	return obj;
}

export default htmlToJsx;
