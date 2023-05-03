import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { ABOUT_LENGTH, SUPABASE_BLOGGER_TABLE } from "../../../utils/constants";
import mdToHtml from "../../../utils/mdToHtml";
import { sendRevalidationRequest } from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import Blogger from "../../interfaces/Blogger";
import { ProfileUser } from "../../interfaces/ProfileUser";
import transformer from "../../../utils/html2Jsx/transformer";
import tokenizer from "../../../utils/html2Jsx/tokenizer";
import parser from "../../../utils/html2Jsx/parser";

const AboutJsxWrapper = ({ children }: { children: JSX.Element }) => {
	return (
		<div
			className="prose prose-code:bg-black prose-pre:bg-black dark:text-gray-300 prose-code:text-amber-400 md:prose-headings:my-4 prose-headings:my-2  text-black prose-headings:text-purple-700 prose-headings:font-mono prose-sm md:prose-base max-w-full pb-10 tracking-wide prose-a:decoration-sky-400 prose-a:underline
		 prose-a:text-sky-400 prose-a:underline-offset-2 prose-a:after:content-['_↗']
			prose-strong:font-extrabold prose-strong:text-black dark:prose-strong:text-gray-100 
			dark:prose-headings:text-amber-400 prose-p:font-serif

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
