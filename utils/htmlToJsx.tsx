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
	const re = /<.*>[^<>]*<\/.*>/g;
	const firstMatches = Array.from(html.matchAll(re));
	if (firstMatches.length === 0) return <>{html}</>;
	const matches = firstMatches.map((match) => match[0]);
	const elem = (
		<>
			{matches.map((match) => {
				const type = match.match(/^<(.*?)>/)?.at(1);
				const content = match.match(/<.+?>((.|\n|\r)+)<\/.*>/);

				if (type === "code") {
					BLOCK_NUMBER += 1;
					return (
						<Code
							key={BLOCK_NUMBER}
							language={language}
							containerId={containerId}
							text={content!.at(1)!}
							blockNumber={BLOCK_NUMBER}
							runTillThisPoint={runTillThisPoint}
						/>
					);
				}
				return React.createElement(
					type!,
					{},
					htmlToJsx({
						html: content!.at(1)!,
						language,
						containerId,
						runTillThisPoint,
					})
				);
			})}
		</>
	);
	return elem;
}
// console.log(/^<(.*?)>/.exec("<h1>Hello world</h1>")?.at(1));
// htmlToJsx(
// 	"<h1>Python Basics</h1>\n<p>This blog post will teach you the basics of python</p>\n<h2>Variable Initialization</h2>\n<p>You can initialize a variable in python like so</p>\n<pre><code>a = 2\n</code></pre>\n<p>You can then print it as shown</p>\n<pre><code>print(a)\n</code></pre>\n<p>You can do all kinds of things with this variable</p>\n<pre><code>b = a*2\r\nprint(b)\n</code></pre>\n<div><h1>finish <p>hehe</p></h1></div>"
// );

// console.log(htmlToJsx("<h1>this is a simple string</h1>"));
export default htmlToJsx;
