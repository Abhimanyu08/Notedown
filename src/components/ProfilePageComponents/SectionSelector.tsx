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
		<div className="tabs pl-1">
			<div
				className={`tab tab-md  rounded-t-md tab-bordered ${
					section === "about"
						? "tab-active font-semibold profile-tool dark:profile-tool-dark "
						: "font-normal dark:text-white/80 text-black"
				}   text-xs md:text-base `}
				onClick={() => setSection("about")}
			>
				About
			</div>
			<div
				className={`tab tab-md rounded-t-md  tab-bordered ${
					section === "posts"
						? "tab-active font-semibold profile-tool dark:profile-tool-dark"
						: "font-normal dark:text-white/80 text-black"
				}  text-xs  md:text-base `}
				onClick={() => setSection("posts")}
			>
				Posts
			</div>
		</div>
	);
}
