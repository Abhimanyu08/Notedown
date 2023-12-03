import ProfileContextProvider from "@/contexts/ProfileContext";
import { Database } from "@/interfaces/supabase";
import PostDisplay from "@components/PostComponents/PostDisplay";
import NewNoteButton from "@components/ProfileComponents/NewPostButton";
import OwnerOnlyStuff, {
	NotOwnerOnlyStuff,
} from "@components/ProfileComponents/OwnerOnlyStuff";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_POST_TABLE, SUPABASE_TAGS_TABLE } from "@utils/constants";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { getUser } from "@utils/getData";
import { postToDraft } from "@utils/postToDraft";
import { Draft } from "@utils/processDrafts";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { cache } from "react";
import Drafts from "./components/Drafts";
import { DraftsDisplay } from "./components/DraftsDisplay";
import { TaggedDrafts } from "./components/TaggedDrafts";
import { supabase } from "@utils/supabaseClient";
import { redirect } from "next/navigation";
import { Input } from "@components/ui/input";
import { ToolTipComponent } from "@components/ToolTipComponent";
import Link from "next/link";
import { AiFillCloseCircle } from "react-icons/ai";

type LayoutProps = {
	children: React.ReactNode;
	params: { id: string };
};

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata | undefined> {
	if (params.id === "anon") return;
	let name = (await getUser(params.id))?.name;

	return {
		title: name,
		description: `${name || "Anon"}'s public notes`,
		openGraph: {
			title: name || "Anon",
			description: `${name || "Anon"}'s public notes`,
			type: "article",
			url: `https://notedown.art/notebook/${params.id}`,
		},
		twitter: {
			card: "summary",
			title: name || "Anon",
			description: `${name || "Anon"}'s public notes`,
		},
	};
}
async function ProfilePostsLayout({ children, params }: LayoutProps) {
	const supabase = createSupabaseServerClient(cookies);

	const map = await getPostTagMap(params.id, supabase);
	return (
		<>
			<div className="grid grid-cols-10 w-full h-screen grid-rows-1 ">
				<ProfileContextProvider tagToPostMap={map}>
					<div className="flex flex-col col-span-3 row-span-1 pt-6 border-r-[1px] border-border">
						<form
							action={async (formData) => {
								"use server";
								const query = formData.get("query");
								redirect(`/notebook/${params.id}?q=${query}`);
							}}
							className="flex gap-2 px-6"
						>
							<Input
								type="text"
								name="query"
								placeholder="Search"
							/>

							<ToolTipComponent
								tip="Clear search results"
								side="bottom"
								type="submit"
							>
								<Link href={`/notebook/${params.id}`} shallow>
									<AiFillCloseCircle size={20} />
								</Link>
							</ToolTipComponent>
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
							<div>
								<NotOwnerOnlyStuff id={params.id}>
									<TaggedDraftContainer>
										{Array.from(map.keys()).map((tag) => {
											const posts = map.get(tag);
											if (!posts || posts.length === 0)
												return <></>;
											return (
												<TaggedDrafts
													tag={tag}
													key={tag}
												>
													<PostDisplay
														posts={posts}
														tag={tag}
													/>
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
											{Array.from(map.keys()).map(
												(tag) => {
													const posts = map.get(tag);
													if (
														!posts ||
														posts.length === 0
													)
														return <></>;
													return (
														<TaggedDrafts
															tag={tag}
															key={tag}
														>
															<PostDisplay
																posts={posts}
																tag={tag}
															/>

															<DraftsDisplay
																tag={tag}
															/>
														</TaggedDrafts>
													);
												}
											)}

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
					</div>
				</ProfileContextProvider>
				{children}
			</div>
		</>
	);
}

async function getPostTagMap(id: string, supabase: SupabaseClient<Database>) {
	console.log(
		"----------------------------------running getPostTagMap-------------------------------------------"
	);
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
function TaggedDraftContainer({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-4 px-3">{children}</div>;
}
export default ProfilePostsLayout;
