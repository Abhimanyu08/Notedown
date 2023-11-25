import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import NewNoteButton from "@components/ProfileComponents/NewPostButton";
import NormalChildrenLayout from "@components/ProfileComponents/NormalChildrenLayout";
import OwnerOnlyStuff, {
	NotOwnerOnlyStuff,
} from "@components/ProfileComponents/OwnerOnlyStuff";
import PostPreviewLayout from "@components/ProfileComponents/PostPreviewLayout";
import SearchInput from "@components/ProfileComponents/SearchInput";
import SearchProvider from "@components/ProfileComponents/SearchProvider";
import SideSheet from "@components/SideSheet";
import { SUPABASE_POST_TABLE, SUPABASE_TAGS_TABLE } from "@utils/constants";
import { getUser } from "@utils/getData";
import { Draft } from "@utils/processDrafts";
import { cookies, headers } from "next/headers";
import React from "react";
import ProfileContextProvider from "@/contexts/ProfileContext";
import { TaggedDrafts } from "./components/TaggedDrafts";
import { postToDraft } from "@utils/postToDraft";
import PostDisplay from "@components/PostDisplay";
import { DraftsDisplay } from "./components/DraftsDisplay";
import { Metadata } from "next";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/interfaces/supabase";

export async function generateMetadata({
	params,
}: {
	params: { id: string };
}): Promise<Metadata | undefined> {
	if (params.id === "anon") return;
	let { name } = (await getUser(params.id))!;

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

async function ProfilePostsLayout({
	children,
	postpreview,
	params,
}: {
	children: React.ReactNode;
	postpreview: React.ReactNode;
	params: { id: string };
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
	const supabase = createSupabaseServerClient(cookies);
	const { data } = await supabase.auth.getUser();
	const loggedIn = !!data.user;

	const map = await getPostTagMap(supabase, params.id);

	return (
		<ProfileContextProvider tagToPostMap={map}>
			<SideSheet
				loggedInChildren={
					<LoggedInOptions
						{...{ name: loggedInName, username: loggedInUserName }}
					/>
				}
				notLoggedInChildren={<NotLoggedInOptions />}
			/>

			<div className="grid grid-cols-10 w-full h-screen grid-rows-1 ">
				<SearchProvider>
					<div className="flex flex-col col-span-3 row-span-1 pt-6 border-r-[1px] border-border">
						<SearchInput className="w-full px-5" />

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
							<NormalChildrenLayout>
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
										{children}
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

											{children}
										</TaggedDraftContainer>
									</OwnerOnlyStuff>
								)}
							</NormalChildrenLayout>
						</div>

						{!loggedIn && params.id === "anon" ? (
							<NewNoteButton />
						) : (
							<OwnerOnlyStuff id={params.id}>
								<NewNoteButton />
							</OwnerOnlyStuff>
						)}
					</div>
				</SearchProvider>
				<PostPreviewLayout
					className="col-span-7 h-full row-span-1 pt-10 relative  
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
		</ProfileContextProvider>
	);
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
				"tag_name, posts(id,title,description,created_at,timestamp,published,slug)"
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
			.select("id,title,description,created_at,timestamp,published,slug")
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

export default ProfilePostsLayout;