import React from "react";
import Code from "../src/components/Code";

let BLOCK_NUMBER = 0;
interface htmlToJsxProps {
	html: string;
	language: string;
	containerId: string;
	runTillThisPoint: ((blockNumber: number) => void) | null;
}
function htmlToJsx({
	html,
	language,
	containerId,
	runTillThisPoint,
}: htmlToJsxProps): JSX.Element {
	const re = /([^<>]*?)(<(.*?)>(.|\r|\n)*?<\/\3>)([^<>]*)/g;
	const matches = Array.from(html.matchAll(re));
	if (matches.length === 0) return <>{html}</>;
	const elem = (
		<>
			{matches.map((match) => {
				const string1 = <>{match.at(1)}</>;
				const string2 = <>{match.at(5)}</>;
				const elem = match.at(2)!;
				const type = elem.match(/^<(.*?)>/)?.at(1);
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
								runTillThisPoint={runTillThisPoint}
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
							{},
							htmlToJsx({
								html: content!.at(1)!,
								language,
								containerId,
								runTillThisPoint,
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

export default htmlToJsx;
