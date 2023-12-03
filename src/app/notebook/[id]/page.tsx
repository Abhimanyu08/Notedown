import { Input } from "@components/ui/input";
import Drafts from "./components/Drafts";
import { redirect } from "next/navigation";
import PostDisplay from "@components/PostComponents/PostDisplay";
import NewNoteButton from "@components/ProfileComponents/NewPostButton";
import OwnerOnlyStuff, {
	NotOwnerOnlyStuff,
} from "@components/ProfileComponents/OwnerOnlyStuff";
import { DraftsDisplay } from "./components/DraftsDisplay";
import { TaggedDrafts } from "./components/TaggedDrafts";
import ProfileContextProvider from "@/contexts/ProfileContext";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_TAGS_TABLE, SUPABASE_POST_TABLE } from "@utils/constants";
import { postToDraft } from "@utils/postToDraft";
import { Draft } from "@utils/processDrafts";
import { Database } from "@/interfaces/supabase";
import DraftSearch from "./components/DraftSearch";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { AiFillCloseCircle } from "react-icons/ai";
import Link from "next/link";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { cookies } from "next/headers";
import { getUser } from "@utils/getData";
import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import PostPreview from "./components/PostPreviewComponents/PostPreview";
import { Suspense } from "react";
import PostLoading from "@components/BlogPostComponents/PostLoading";
import DraftPreview from "./components/DraftPreview";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import EditorContextProvider from "@/app/write/components/EditorContext";
import { Button } from "@components/ui/button";

async function Page({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: { [key: string]: string | string[] | undefined };
}) {
	let loggedInName = "",
		loggedInUserName = "";
	if (params.id !== "anon") {
		let userDetails = (await getUser(params.id))!;
		if (!userDetails) return;
		const { name, username } = userDetails;
		loggedInName = name || "";
		loggedInUserName = username || "";
	}
	// const searchQuery = searchParams?.["q"] as string;
	// let SearchResultJsx: JSX.Element | null = null;

	// if (searchQuery) {
	// 	const searchFunction = "search";
	// 	const searchArgs = {
	// 		user_id: params!.id as string,
	// 		search_term: searchQuery,
	// 	};

	// 	const { data: searchResults } = await supabase.rpc(
	// 		searchFunction,
	// 		searchArgs
	// 	);

	// 	if (searchResults) {
	// 		SearchResultJsx = (
	// 			<div className="flex flex-col gap-4 px-2">
	// 				<PostDisplay
	// 					posts={searchResults.map((result) =>
	// 						postToDraft(result)
	// 					)}
	// 				/>
	// 				<DraftSearch query={searchQuery} />
	// 			</div>
	// 		);
	// 	}
	// }

	return (
		<>
			<SideSheet
				loggedInChildren={
					<LoggedInOptions
						{...{ name: loggedInName, username: loggedInUserName }}
					/>
				}
				notLoggedInChildren={<NotLoggedInOptions />}
			/>

			<div
				className="col-span-7 h-full row-span-1 pt-10 relative  
				overflow-y-auto
		lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				scroll-smooth
	
				"
			>
				<Suspense>
					{searchParams?.["draft"] && (
						<BlogContextProvider
							key={searchParams?.["draft"] as string}
						>
							<EditorContextProvider>
								<DraftPreview
									params={{
										draftId: searchParams?.[
											"draft"
										] as string,
									}}
								/>
							</EditorContextProvider>
						</BlogContextProvider>
					)}
					{searchParams?.["note"] && (
						<PostPreview
							postId={searchParams?.["note"] as string}
						/>
					)}
					<NoPreviewScreen />
				</Suspense>
			</div>
		</>
	);
}

function NoPreviewScreen() {
	return (
		<div className="flex-col h-full justify-center gap-2  items-center  text-gray-500 hidden first:flex">
			<div className="text-left flex flex-col gap-2 font-serif text-xl italic tracking-wide">
				<span>Lying in wait, set to pounce on the blank page,</span>
				<span>are letters up to no good,</span>
				<span>clutches of clauses so subordinate</span>
				<span>they{`'`}ll never let her get away.</span>
			</div>
			<span className="underline underline-offset-2 text-sm self-center">
				- The Joy Of Writing, Wislawa Szymborska
			</span>
		</div>
	);
}

export default Page;
