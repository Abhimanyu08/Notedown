import { Input } from "@components/ui/input";
import Drafts from "./components/Drafts";
import { redirect } from "next/navigation";
import PostDisplay from "@components/PostDisplay";
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
import { supabase } from "@utils/supabaseClient";
import { Database } from "@/interfaces/supabase";
import DraftSearch from "./components/DraftSearch";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { AiFillCloseCircle } from "react-icons/ai";
import Link from "next/link";

async function Page({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: { [key: string]: string | string[] | undefined };
}) {
	console.log(searchParams);
	const searchQuery = searchParams?.["q"] as string;
	let SearchResultJsx: JSX.Element | null = null;

	if (searchQuery) {
		const searchFunction = "search";
		const searchArgs = {
			user_id: params!.id as string,
			search_term: searchQuery,
		};

		const { data: searchResults } = await supabase.rpc(
			searchFunction,
			searchArgs
		);

		if (searchResults) {
			SearchResultJsx = (
				<div className="flex flex-col gap-4">
					<PostDisplay
						posts={searchResults.map((result) =>
							postToDraft(result)
						)}
					/>
					<DraftSearch query={searchQuery} />
				</div>
			);
		}
	}

	const map = await getPostTagMap(supabase, params.id);
	return (
		<ProfileContextProvider tagToPostMap={map}>
			<form
				action={async (formData) => {
					"use server";
					const query = formData.get("query");
					redirect(`/notebook/${params.id}?q=${query}`);
				}}
				className="flex gap-2 px-7"
			>
				<Input type="text" name="query" placeholder="Search" />

				{SearchResultJsx && (
					<ToolTipComponent
						tip="Clear search results"
						side="bottom"
						type="submit"
					>
						<Link href={`/notebook/${params.id}?q`}>
							<AiFillCloseCircle size={20} />
						</Link>
					</ToolTipComponent>
				)}
			</form>

			<div className="h-[2px] bg-border col-span-1 my-4"></div>
			<div
				className="
							overflow-y-auto
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				px-2
				grow
				"
			>
				{SearchResultJsx}
				<div className={`${SearchResultJsx ? "hidden" : ""}`}>
					<NotOwnerOnlyStuff id={params.id}>
						<TaggedDraftContainer>
							{Array.from(map.keys()).map((tag) => {
								const posts = map.get(tag);
								if (!posts || posts.length === 0) return <></>;
								return (
									<TaggedDrafts tag={tag} key={tag}>
										<PostDisplay posts={posts} tag={tag} />
									</TaggedDrafts>
								);
							})}
						</TaggedDraftContainer>
					</NotOwnerOnlyStuff>

					{params.id === "anon" ? (
						<TaggedDraftContainer>
							<Drafts />
						</TaggedDraftContainer>
					) : (
						<OwnerOnlyStuff id={params.id}>
							<TaggedDraftContainer>
								{Array.from(map.keys()).map((tag) => {
									const posts = map.get(tag);
									if (!posts || posts.length === 0)
										return <></>;
									return (
										<TaggedDrafts tag={tag} key={tag}>
											<PostDisplay
												posts={posts}
												tag={tag}
											/>

											<DraftsDisplay tag={tag} />
										</TaggedDrafts>
									);
								})}

								<Drafts />
							</TaggedDraftContainer>
						</OwnerOnlyStuff>
					)}
				</div>
			</div>

			{params.id === "anon" ? (
				<NewNoteButton />
			) : (
				<OwnerOnlyStuff id={params.id}>
					<NewNoteButton />
				</OwnerOnlyStuff>
			)}
		</ProfileContextProvider>
	);

	// return (
	// 	<div className="flex flex-col gap-2 mt-20  items-center  text-gray-500 ">
	// 		<div className="text-left flex flex-col gap-2 font-serif text-xl italic tracking-wide">
	// 			<span>Lying in wait, set to pounce on the blank page,</span>
	// 			<span>are letters up to no good,</span>
	// 			<span>clutches of clauses so subordinate</span>
	// 			<span>they{`'`}ll never let her get away.</span>
	// 		</div>
	// 		<span className="underline underline-offset-2 text-sm self-center">
	// 			- The Joy Of Writing, Wislawa Szymborska
	// 		</span>
	// 		<Button
	// 			variant={"secondary"}
	// 			className="mt-10 w-fit px-3 py-1 self-center text-gray-400"
	// 		>
	// 			<Link href={"/write"}>Start writing</Link>
	// 		</Button>
	// 	</div>
	// );
}

function TaggedDraftContainer({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-4 px-3">{children}</div>;
}

async function getPostTagMap(supabase: SupabaseClient<Database>, id: string) {
	const map = new Map<string, Draft[]>();
	if (id !== "anon") {
		const { data: tagsData } = await supabase
			.from(SUPABASE_TAGS_TABLE)
			.select(
				"tag_name, posts(id,title,description,created_at,timestamp,published,slug,created_by)"
			)
			.match({ created_by: id });

		const postWithTagIds: number[] = [];
		if (tagsData) {
			for (let tagData of tagsData) {
				if (tagData.posts) {
					const posts = tagData.posts;
					if (Array.isArray(posts)) {
						map.set(
							tagData.tag_name!,
							posts.map((p) => {
								postWithTagIds.push(p.id);
								return postToDraft(p);
							})
						);
					}
				}
			}
		}

		const { data: postWithoutTags } = await supabase
			.from(SUPABASE_POST_TABLE)
			.select(
				"id,title,description,created_at,timestamp,published,slug,created_by"
			)
			.match({ created_by: id })
			.not("id", "in", `(${postWithTagIds.join(",")})`);

		if (postWithoutTags) {
			map.set(
				"notag",
				postWithoutTags.map((p) => postToDraft(p))
			);
		}
	}
	return map;
}
export default Page;
