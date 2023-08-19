import { LoggedInOptions } from "@components/Navbar/Options";
import NewNoteButton from "@components/ProfileComponents/NewPostButton";
import NormalChildrenLayout from "@components/ProfileComponents/NormalChildrenLayout";
import OwnerOnlyStuff, {
	NotOwnerOnlyStuff,
} from "@components/ProfileComponents/OwnerOnlyStuff";
import PostControl from "@components/ProfileComponents/PostControl";
import PostPreviewLayout from "@components/ProfileComponents/PostPreviewLayout";
import SearchInput from "@components/ProfileComponents/SearchInput";
import SearchProvider from "@components/ProfileComponents/SearchProvider";
import SideSheet from "@components/SideSheet";
import {
	createServerComponentSupabaseClient,
	createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { SUPABASE_POST_TABLE, SUPABASE_TAGS_TABLE } from "@utils/constants";
import { getUser } from "@utils/getData";
import { Draft } from "@utils/processDrafts";
import { cookies, headers } from "next/headers";
import React from "react";
import ProfileContextProvider from "./_components/ProfileContext";
import { TaggedDrafts } from "./_components/TaggedDrafts";

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
	const supabase = createServerComponentSupabaseClient({ headers, cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	let notebookTitle =
		notebook_title !== null
			? notebook_title
			: name
			? `${name}'s Notebook`
			: "Anon's Notebook";

	const { data: tagsData } = await supabase
		.from(SUPABASE_TAGS_TABLE)
		.select(
			"tag_name, posts(id,title,description,created_at,timestamp,published)"
		)
		.match({ created_by: params.id });

	const postWithTagIds = [];
	const map = new Map<string, Draft[]>();
	if (tagsData) {
		for (let tagData of tagsData) {
			if (tagData.posts) {
				const posts = tagData.posts;
				if (Array.isArray(posts)) {
					map.set(
						tagData.tag_name,
						posts.map((p) => {
							postWithTagIds.push(p.id);
							return {
								date: p.created_at,
								timeStamp: p.timestamp,
								title: p.title,
								description: p.description,
								postId: p.id,
								published: p.published,
							};
						})
					);
				} else {
					postWithTagIds.push(posts.id);
					map.set(tagData.tag_name, [
						{
							date: posts.created_at as string,
							timeStamp: posts.timestamp,
							title: posts.title,
							description: posts.description,
							postId: posts.id,
						},
					]);
				}
			}
		}
	}

	const { data } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("id,title,description,created_at,timestamp,published")
		.not("id", "in", `(${postWithTagIds.join(",")})`);

	if (data) {
		map.set(
			"notag",
			data.map((p) => {
				return {
					date: p.created_at,
					timeStamp: p.timestamp,
					title: p.title,
					description: p.description,
					postId: p.id,
					published: p.published,
				};
			})
		);
	}
	return (
		<ProfileContextProvider tagToPostMap={map}>
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

						<OwnerOnlyStuff id={params.id} session={session}>
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
								<NotOwnerOnlyStuff
									id={params.id}
									session={session}
								>
									<div className="flex flex-col gap-4 flex-initial overflow-y-auto">
										{Array.from(map.keys()).map((tag) => {
											return (
												<TaggedDrafts
													posts={map.get(tag) || []}
													drafts={[]}
													tag={tag}
													key={tag}
												/>
											);
										})}
									</div>
								</NotOwnerOnlyStuff>
								<OwnerOnlyStuff
									id={params.id}
									session={session}
								>
									{children}
								</OwnerOnlyStuff>
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
		</ProfileContextProvider>
	);
}

export default ProfilePostsLayout;
