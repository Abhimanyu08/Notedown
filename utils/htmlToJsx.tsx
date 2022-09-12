import Image from "next/image";
import React from "react";
import Code from "../src/components/Code";
import { SUPABASE_IMAGE_BUCKET } from "./constants";
import makeFolderName from "./makeFolderName";
import { supabase } from "./supabaseClient";

let BLOCK_NUMBER = -1;
interface htmlToJsxProps {
	html: string;
	language: string;
	ownerId: string;
	imageFolder?: string;
}
function htmlToJsx({
	html,
	language,
	ownerId,
	imageFolder,
}: htmlToJsxProps): JSX.Element {
	const re =
		/([^<>]*?)(<([a-z0-9]+)( [^<>]*?=\"[^<>]*\")*?>(.|\r|\n)*?<\/\3>)([^<>]*)/g;
	const matches = Array.from(html.matchAll(re));
	if (matches.length === 0) return <>{html}</>;
	const elem = (
		<>
			{matches.map((match) => {
				const string1 = match.at(1);
				const string2 = match.at(6);
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
								code={code || ""}
								blockNumber={BLOCK_NUMBER}
							/>
							{string2}
						</>
					);
				}
				if (type === "code") {
					let code = elem.match(/<code>((.|\r|\n)*)<\/code>/)?.at(1);
					return (
						<>
							<span>
								{string1} <code>{code}</code> {string2}
							</span>
						</>
					);
				}
				const content = elem.match(/<.*?>((.|\n|\r)*)<\/.*>/)?.at(1);
				const hasImage = Array.from(
					content?.matchAll(/((.|\n|\r)*?)(<img (.*)>)([^<>]*)/g) ||
						[]
				);
				if (hasImage.length !== 0 && imageFolder) {
					return Array.from(hasImage).map((imageMatch) => {
						const string1 = imageMatch.at(1);
						const string2 = imageMatch.at(5);
						let attrString = imageMatch.at(4);
						let attrs = makeAttrMap({ match: attrString });

						if (!Object.hasOwn(attrs, "src")) {
							return <></>;
						}
						let src = attrs["src"];
						let imageName = src.match(/([^\/]*\..*$)/)?.at(0);
						const { publicURL } = supabase.storage
							.from(SUPABASE_IMAGE_BUCKET)
							.getPublicUrl(`${imageFolder}/${imageName}`);
						return (
							<>
								<span>
									{htmlToJsx({
										html: string1 || "",
										language,
										ownerId,
										imageFolder,
									})}
								</span>
								<div className="">
									<div className="relative">
										<Image
											src={publicURL!}
											layout="responsive"
											objectFit="contain"
											className="resize w-full"
											width={175}
											alt={attrs["alt"]}
											height={120}
										/>
									</div>
									<figcaption className="text-center text-white italic">
										{attrs["alt"]}
									</figcaption>
								</div>
								<span className="">{string2}</span>
							</>
						);
					});
				}

				return (
					<>
						<span>{string1}</span>

						{React.createElement(
							type!,
							makeAttrMap({ type, content, match: match.at(4) }),
							htmlToJsx({
								html: content!,
								language,
								ownerId,
								imageFolder,
							})
						)}
						<span>{string2}</span>
					</>
				);
			})}
		</>
	);
	return elem;
}

function makeAttrMap({
	type,
	content,
	match,
}: {
	type?: string;
	content?: string;
	match?: string;
}) {
	let obj: Record<string, string> = {};
	if (type && /h\d/.test(type)) {
		obj["id"] = content!;
	}
	if (!match) return obj;
	const re = /(.*?)=\"(.*?)\"/g;
	const attrs = Array.from(match.matchAll(re));
	for (const attr of attrs) {
		obj[attr[1].trim()] = attr[2].trim();
	}
	if (type === "a") obj["target"] = "_blank";
	return obj;
}

export default htmlToJsx;

//to do -> resolve the case when <p>jf;lakjfdal;skdjfas;lkdj<img src="" alt="">
