import Image from "next/image";
import React from "react";
import Code from "../src/components/Code";
import { SUPABASE_IMAGE_BUCKET } from "./constants";
import { supabase } from "./supabaseClient";

let BLOCK_NUMBER = 0;
interface htmlToJsxProps {
	html: string;
	language: string;
	ownerId: string;
	blogTitle: string;
}
function htmlToJsx({
	html,
	language,
	ownerId,
	blogTitle,
}: htmlToJsxProps): JSX.Element {
	const re =
		/([^<>]*?)(<([a-z0-9]+)( [^<>]*?=\"[^<>]*\")*?>(.|\r|\n)*?<\/\3>)([^(<>|\n|\r)]*)/g;
	const matches = Array.from(html.matchAll(re));
	if (matches.length === 0) return <>{html}</>;
	const elem = (
		<>
			{matches.map((match) => {
				const string1 = <>{match.at(1)}</>;
				const string2 = <>{match.at(6)}</>;
				const elem = match.at(2)!;
				const type = match.at(3);
				if (type === "pre") {
					let code = elem.match(/<code>((.|\r|\n)*)<\/code>/)?.at(1);
					BLOCK_NUMBER += 1;
					return (
						<>
							{string1}
							<Code
								key={BLOCK_NUMBER}
								language={language}
								text={code || ""}
								blockNumber={BLOCK_NUMBER}
							/>
							{string2}
						</>
					);
				}
				const content = elem.match(/<.*?>((.|\n|\r)*)<\/.*>/)?.at(1);

				if (content?.startsWith("<img")) {
					let attrString = content.match(/<img (.*)>/)?.at(1);
					let attrs = makeAttrMap(attrString);
					console.log(attrs);
					if (!Object.hasOwn(attrs, "src")) {
						return <></>;
					}
					let src = attrs["src"];
					let imageName = src.match(/([^\/]*\..*$)/)?.at(0);
					const { publicURL } = supabase.storage
						.from(SUPABASE_IMAGE_BUCKET)
						.getPublicUrl(`${ownerId}/${blogTitle}/${imageName}`);
					return (
						<div className="relative m-4">
							<Image
								src={publicURL!}
								layout="responsive"
								objectFit="contain"
								className="resize w-full"
								width={200}
								height={120}
							/>
							<figcaption className="text-center text-white italic">
								{attrs["alt"]}
							</figcaption>
						</div>
					);
				}
				return (
					<>
						{string1}

						{React.createElement(
							type!,
							makeAttrMap(match.at(4)),
							htmlToJsx({
								html: content!,
								language,
								ownerId,
								blogTitle,
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

//to do -> resolve the case when <p>jf;lakjfdal;skdjfas;lkdj<img src="" alt="">
