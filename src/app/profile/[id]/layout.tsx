import { getUser } from "@/app/utils/getData";
import React from "react";
import NewNoteButton from "./components/NewPostButton";
import NoteTypeToggle from "./components/NoteTypeToggle";
import PostControl from "./components/PostControl";
import { LoggedInOptions } from "@components/Navbar/Options";
import OwnerOnlyStuff from "./components/OwnerOnlyStuff";
import SideSheet from "@components/SideSheet";
import SearchInput from "./components/SearchInput";
import PostPreviewLayout from "./components/PostPreviewLayout";
import NormalChildrenLayout from "./components/NormalChildrenLayout";
import SearchProvider from "./components/SearchProvider";

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
		<SearchProvider>
			<SideSheet>
				<LoggedInOptions
					{...{ name, notebook_title: notebookTitle, username }}
				/>
			</SideSheet>
			<div className="grid grid-cols-2 w-full h-full grid-rows-1 ">
				<div className="flex flex-col col-span-1 row-span-1 gap-4 pl-10 pt-20 ">
					<h1 className="font-mono text-4xl px-2">{notebookTitle}</h1>
					<OwnerOnlyStuff>
						<div className="flex justify-between col-span-1 px-2 mr-10">
							<PostControl className="font-mono text-gray-400" />
							<NewNoteButton />
						</div>
						<div className="flex justify-between px-2 col-span-1 mt-1 mr-10 relative">
							<NoteTypeToggle className="text-gray-400 " />
							<SearchInput className="basis-1/3" />
						</div>
					</OwnerOnlyStuff>
					<div className="h-[2px] bg-border col-span-1 mr-10 mt-4"></div>
					<div
						className="
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				mr-10
				"
					>
						<NormalChildrenLayout>{children}</NormalChildrenLayout>
					</div>
				</div>
				<PostPreviewLayout className="col-start-2 col-span-1 row-span-1 relative mt-20 border-l-[1px] border-gray-600">
					{postpreview}
				</PostPreviewLayout>
			</div>
		</SearchProvider>

		// <LayoutChange>
		// 	<>
		// 		<div className="flex w-full items-end justify-between">
		// 			<PostControl />
		// 			<input
		// 				type="text"
		// 				name=""
		// 				id=""
		// 				placeholder="Search"
		// 				className="h-6 p-4 bg-transparent border-[1px] border-gray-400 rounded-md w-32 focus:w-52 transition-all duration-200"
		// 			/>
		// 		</div>
		// 		{/* <div
		// 			className="grow overflow-y-auto
		// 		lg:scrollbar-thin
		// 		scrollbar-track-black
		// 		scrollbar-thumb-slate-700
		// 		"
		// 		> */}
		// 		{children}
		// 		{/* </div> */}
		// 	</>
		// 	{/* <SearchComponent
		// 		{...{
		// 			publishPostAction,
		// 			unpublishPostAction,
		// 			deletePostAction,
		// 		}}
		// 	/> */}
		// 	{/* <aside className="absolute top-[400px] left-[-30%]">
		// 		<Link href={"/write"}>
		// 			<Button className="px-2 py-1 gap-2">
		// 				<SlNote /> New Note
		// 			</Button>
		// 		</Link>
		// 	</aside> */}
		// 	<>{postpreview}</>
		// </LayoutChange>
	);
}

{
	/* <div className="w-full flex flex-col px-2 gap-4 h-full overflow-hidden relative ">
				
				<div className="flex justify-start gap-2 mr-4 ">
					<PostControl />
				</div>

				<div className="overflow-y-auto grow">{children}</div>
			</div> */
}
export default ProfilePostsLayout;
