import { getUser } from "@utils/getData";
import React from "react";
import NewNoteButton from "@components/ProfileComponents/NewPostButton";
import NoteTypeToggle from "@components/ProfileComponents/NoteTypeToggle";
import PostControl from "@components/ProfileComponents/PostControl";
import { LoggedInOptions } from "@components/Navbar/Options";
import OwnerOnlyStuff from "@components/ProfileComponents/OwnerOnlyStuff";
import SideSheet from "@components/SideSheet";
import SearchInput from "@components/ProfileComponents/SearchInput";
import PostPreviewLayout from "@components/ProfileComponents/PostPreviewLayout";
import NormalChildrenLayout from "@components/ProfileComponents/NormalChildrenLayout";
import SearchProvider from "@components/ProfileComponents/SearchProvider";
import IndexedDbContextProvider from "@components/Contexts/IndexedDbContext";

async function ProfilePostsLayout({
	children,
	postpreview,
	params,
}: {
	children: React.ReactNode;
	postpreview: React.ReactNode;
	params: { id: string };
}) {
	const { name, notebook_title, username } = (await getUser(params.id))!;

	let notebookTitle =
		notebook_title !== null
			? notebook_title
			: name
			? `${name}'s Notebook`
			: "Anon's Notebook";
	return (
		<>
			<SideSheet>
				<LoggedInOptions
					{...{ name, notebook_title: notebookTitle, username }}
				/>
			</SideSheet>

			<div className="grid grid-cols-3 w-full h-screen grid-rows-1 ">
				<SearchProvider>
					<div className="flex flex-col col-span-1 row-span-1 gap-4 p-4 pt-10">
						<h1 className="font-serif text-4xl px-2">
							{notebookTitle}
						</h1>

						{/* @ts-expect-error Async Server Component  */}
						<OwnerOnlyStuff id={params.id}>
							{/* <div className="flex justify-between col-span-1 px-2 mr-10">
								<PostControl className="font-mono text-gray-400" />
								<NoteTypeToggle className="text-gray-400 " />
							</div> */}
							<div className="flex justify-between px-2 col-span-1 mt-1 relative">
								<SearchInput className="basis-1/2" />
								<NewNoteButton />
							</div>
						</OwnerOnlyStuff>
						<div className="h-[2px] bg-border col-span-1 mt-4"></div>
						<div
							className="
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				px-2
				"
						>
							<NormalChildrenLayout>
								{children}
							</NormalChildrenLayout>
						</div>
					</div>
				</SearchProvider>
				<PostPreviewLayout
					className="col-start-2  col-span-2 h-full row-span-1 pt-10 relative border-l-[1px] border-gray-600 
				overflow-y-auto
		lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				scroll-smooth
	
				"
				>
					{postpreview}
				</PostPreviewLayout>
			</div>
		</>
	);
}

export default ProfilePostsLayout;
