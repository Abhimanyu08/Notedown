import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { ABOUT_LENGTH, SUPABASE_BLOGGER_TABLE } from "../../utils/constants";
import htmlToJsx from "../../utils/htmlToJsx";
import mdToHtml from "../../utils/mdToHtml";
import { sendRevalidationRequest } from "../../utils/sendRequest";
import { supabase } from "../../utils/supabaseClient";
import Blogger from "../interfaces/Blogger";
import { ProfileUser } from "../interfaces/ProfileUser";

const AboutJsxWrapper = ({ children }: { children: JSX.Element }) => {
	return (
		<div
			className="prose prose-code:bg-black prose-pre:bg-black prose-code:text-amber-400 md:prose-headings:my-4 prose-headings:my-2  text-gray-100 prose-headings:text-amber-400 prose-sm md:prose-base max-w-full pb-10 tracking-wide prose-a:decoration-amber-400 prose-a:underline
		 prose-a:text-amber-400 prose-a:underline-offset-2 prose-a:after:content-['_↗']
			prose-strong:font-extrabold prose-strong:text-white
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
				{htmlToJsx({
					html: originalAboutInHtml,
				})}
			</AboutJsxWrapper>
		);
	}, [originalAboutInHtml]);

	const editedAboutJsx = useMemo(() => {
		return (
			<AboutJsxWrapper>
				{htmlToJsx({
					html: editedAboutInHtml,
				})}
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
			<div className="w-full h-3/4 gap-2 relative flex flex-col mt-5">
				<div className="flex gap-2 self-start text-white capitalize">
					<div
						className="rounded-md py-1 px-2 bg-slate-600 text-sm"
						onClick={() => setPreviewing((prev) => !prev)}
					>
						{previewing ? "Edit" : "Preview"}
					</div>
					<div
						className="rounded-md py-1 px-2 bg-slate-600 text-sm"
						onClick={() =>
							onChangeAbout(editedAboutInMd, editedAboutInHtml)
						}
					>
						Done
					</div>
					<div
						className="rounded-md py-1 px-2 bg-slate-600 text-sm"
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
							<p className="absolute bottom-10 lg:right-8 right-6 text-sm text-amber-400">
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
		<div className="w-full h-3/4 gap-2 relative flex flex-col mt-5">
			{owner && (
				<div
					className="rounded-md py-1 px-2 w-fit bg-slate-600 text-sm"
					onClick={() => setEditing(true)}
				>
					Edit
				</div>
			)}
			<AboutJsxWrapper>{aboutJSX}</AboutJsxWrapper>
		</div>
	);
}
