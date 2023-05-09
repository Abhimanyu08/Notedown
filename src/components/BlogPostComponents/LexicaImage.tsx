"use client";
import React, { useEffect, useState } from "react";
import { BsArrowRepeat } from "react-icons/bs";
import { getImages } from "../../../utils/sendRequest";

function LexicaImage({ alt }: { alt: string }) {
	const [lexicaLinks, setLexicaLinks] = useState<string[]>([]);
	const [lexicaLinkNumber, setLexicaLinkNumber] = useState(0);

	useEffect(() => {
		getImages({ caption: alt }).then((imageLinks) => {
			setLexicaLinks(imageLinks);
			setLexicaLinkNumber(0);
		});
	}, [alt]);

	useEffect(() => {
		const lexicaImageElem = document.getElementById(alt);
		if (!lexicaImageElem) return;
		(lexicaImageElem as HTMLImageElement).src =
			lexicaLinks[lexicaLinkNumber];
	}, [lexicaLinkNumber, lexicaLinks]);

	return (
		<div className="w-full mb-4">
			<div className="w-full aspect-video">
				<img
					src=""
					alt={alt}
					style={{ height: "100%", margin: "auto" }}
					id={alt}
				/>
			</div>
			<div className="flex items-end justify-center gap-4 ">
				<figcaption className="text-center text-white italic">
					{alt}
				</figcaption>
				<div
					className=" text-white lexica-regen"
					onClick={() => {
						setLexicaLinkNumber((prev) => {
							return (prev + 1) % lexicaLinks.length;
						});
					}}
				>
					<BsArrowRepeat />
				</div>
			</div>
		</div>
	);
}

export default LexicaImage;
