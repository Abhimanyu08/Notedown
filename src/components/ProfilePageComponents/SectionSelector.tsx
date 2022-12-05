import { Dispatch, SetStateAction } from "react";

type SectionType = "posts" | "about";

export function SectionSelector({
	section,
	setSection,
}: {
	section: SectionType;
	setSection: Dispatch<SetStateAction<SectionType>>;
}) {
	return (
		<div className="tabs">
			<p
				className={`tab tab-md  rounded-t-md tab-bordered ${
					section === "about" ? "tab-active" : ""
				}  font-medium text-white text-xs md:text-base`}
				onClick={() => setSection("about")}
			>
				About
			</p>
			<p
				className={`tab tab-md rounded-t-md  tab-bordered ${
					section === "posts" ? "tab-active" : ""
				} font-medium text-white text-xs  md:text-base`}
				onClick={() => setSection("posts")}
			>
				Posts
			</p>
		</div>
	);
}
