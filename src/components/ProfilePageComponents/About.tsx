import Blogger from "@/interfaces/Blogger";
import { ProfileUser } from "@/interfaces/ProfileUser";
import { SUPABASE_BLOGGER_TABLE, ABOUT_LENGTH } from "@utils/constants";
import tokenizer from "@utils/html2Jsx/tokenizer";
import transformer from "@utils/html2Jsx/transformer";
import mdToHtml from "@utils/mdToHtml";
import { sendRevalidationRequest } from "@utils/sendRequest";
import { supabase } from "@utils/supabaseClient";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import parser from "react-syntax-highlighter/dist/esm/languages/prism/parser";
const AboutJsxWrapper = ({ children }: { children: JSX.Element }) => {
	return (
		<div
			className="

prose prose-sm
				//-------------prose-headings------------
prose-headings:text-black
dark:prose-headings:text-white
prose-headings:font-sans
prose-h2:text-[26px]
prose-h3:text-[24px]
prose-h4:text-[22px]
prose-h5:text-[20px]
prose-h6:text-[18px]
				// ---------prose-p--------------
				prose-p:text-left
				md:prose-p:text-[16px]	
				prose-p: leading-7
				prose-p:font-sans
				prose-p:tracking-normal
				prose-p:text-black/80
				dark:prose-p:text-font-grey

				// -------------prose-li--------
				marker:prose-li:text-black
				dark:marker:prose-li:text-white
				prose-li:text-black/80
				prose-li:font-sans
				md:prose-li:text-[16px]	
				prose-li:leading-7
				dark:prose-li:text-font-grey

				// -----------prose-string-----------
				prose-strong:font-bold
				prose-strong:text-black
				dark:prose-strong:text-gray-100
				prose-strong:tracking-wide

				//-----------------prose-a-------------
			prose-a:text-black
			dark:prose-a:text-blue-400
			prose-a:font-semibold
			prose-a:no-underline
			hover:prose-a:underline
			hover:prose-a:underline-offset-2

			// ---------------prose-code---------------
			dark:prose-code:bg-gray-800
			dark:prose-code:text-gray-200
			prose-code:bg-white
			prose-code:text-black
			prose-code:px-2 
			md:prose-code:text-sm 
				prose-code:rounded-md
				prose-code:select-all

			prose-em:text-black
			dark:prose-em:text-gray-100

			//-----------------figcaption-------------

				prose-figcaption:text-black
				dark:prose-figcaption:text-font-grey

prose-blockquote:border-l-black prose-blockquote:border-l-4
dark:prose-blockquote:border-l-gray-300
dark:prose-blockquote:text-font-grey
prose-blockquote:text-black/80
				  prose-h1:mb-6   
				
		 "
		>
			{children}
		</div>
	);
};

export function About({
	userId,
	owner,
	originalAboutInHtml,
	originalAboutInMd,
	setProfile,
}: {
	userId: string;
	originalAboutInMd: string;
	originalAboutInHtml: string;
	owner: boolean;
	setProfile: Dispatch<SetStateAction<ProfileUser | undefined>>;
}) {
	// console.log("About ----------------->", about);
	const [editedAboutInHtml, setEditedAboutInHtml] =
		useState(originalAboutInHtml);
	const [editedAboutInMd, setEditedAboutInMd] = useState(originalAboutInMd);
	const [editing, setEditing] = useState(false);
	const [previewing, setPreviewing] = useState(false);

	const aboutMd2Html = async (editedAboutInMd: string) => {
		const html = await mdToHtml(editedAboutInMd || "");
		setEditedAboutInHtml(html);
	};
	useEffect(() => {
		aboutMd2Html(editedAboutInMd);
	}, [editedAboutInMd]);

	const aboutJSX = useMemo(() => {
		return (
			<AboutJsxWrapper>
				{transformer(parser(tokenizer(originalAboutInHtml)), {})}
			</AboutJsxWrapper>
		);
	}, [originalAboutInHtml]);

	const editedAboutJsx = useMemo(() => {
		return (
			<AboutJsxWrapper>
				{transformer(parser(tokenizer(editedAboutInHtml)), {})}
			</AboutJsxWrapper>
		);
	}, [editedAboutInHtml]);

	const onChangeAbout = async (
		editedAboutInMd: string,
		editedAboutInHtml: string
	) => {
		const { data } = await supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.update({
				about: editedAboutInMd,
			})
			.eq("id", userId);
		if (!data) return;
		const newProfile: ProfileUser = data.at(0) as Blogger;
		newProfile["htmlAbout"] = editedAboutInHtml;

		sendRevalidationRequest(`/profile/${userId}`);
		setPreviewing(false);
		setEditing(false);
		setProfile(newProfile);
	};

	if (editing) {
		return (
			<div className="w-full h-3/4 gap-2 relative flex flex-col mt-5 pl-1">
				<div className="flex gap-2 self-start capitalize">
					<div
						className="rounded-md py-1 px-2 profile-tool dark:profile-tool-dark text-xs lg:text-sm"
						onClick={() => setPreviewing((prev) => !prev)}
					>
						{previewing ? "Edit" : "Preview"}
					</div>
					<div
						className="rounded-md py-1 px-2 profile-tool dark:profile-tool-dark text-xs lg:text-sm"
						onClick={() =>
							onChangeAbout(editedAboutInMd, editedAboutInHtml)
						}
					>
						Done
					</div>
					<div
						className="rounded-md py-1 px-2 profile-tool dark:profile-tool-dark text-xs lg:text-sm"
						onClick={() => {
							setEditing(false);
							setPreviewing(false);
							setEditedAboutInMd(originalAboutInMd);
						}}
					>
						Cancel
					</div>
				</div>
				<>
					{previewing ? (
						editedAboutJsx
					) : (
						<>
							<p className="absolute top-2 right-2 text-xs lg:text-sm text-amber-400">
								{editedAboutInMd.length}/{ABOUT_LENGTH}
							</p>
							<textarea
								className="textarea w-full grow"
								placeholder="Markdown enabled"
								onChange={(e) => {
									if (e.target.value.length <= ABOUT_LENGTH)
										setEditedAboutInMd(e.target.value);
								}}
								value={editedAboutInMd}
							/>
						</>
					)}
				</>
			</div>
		);
	}
	if (editedAboutInMd === "") {
		return (
			<div className="flex h-full w-full justify-center">
				{owner ? (
					<p className="mt-10 text-white/70">
						Write something about yourself by clicking the Edit
						button
					</p>
				) : (
					<p>This person is still finding about himself</p>
				)}
			</div>
		);
	}
	return (
		<div className="w-full h-3/4 gap-2 relative flex flex-col mt-5 pl-1 text-xs lg:text-sm">
			{owner && (
				<div
					className="rounded-md py-1 px-2 w-fit profile-tool dark:profile-tool-dark lg:text-sm text-xs"
					onClick={() => setEditing(true)}
				>
					Edit
				</div>
			)}
			<AboutJsxWrapper>{aboutJSX}</AboutJsxWrapper>
		</div>
	);
}
