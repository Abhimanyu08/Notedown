"use client";
import React, { useContext } from "react";
import { SearchContext } from "./SearchProvider";
import PostComponent from "@components/PostComponent";
import { SinglePostLoading } from "./SinglePostLoading";
import { useSupabase } from "@/app/appContext";
import { sendRevalidationRequest } from "@utils/sendRequest";
import {
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "@utils/constants";

function NormalChildrenLayout({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	const { searchMeta } = useContext(SearchContext);
	const { supabase } = useSupabase();

	async function publishPostAction(postId: number) {
		await supabase
			.from(SUPABASE_POST_TABLE)
			.update({
				published: true,
				published_on: new Date().toISOString(),
			})
			.match({ id: postId });

		sendRevalidationRequest("/profile/[id]");
	}

	async function unpublishPostAction(postId: number) {
		await supabase
			.from(SUPABASE_POST_TABLE)
			.update({
				published: false,
			})
			.match({ id: postId });

		sendRevalidationRequest("/profile/[id]");
	}

	async function deletePostAction(postId: number) {
		const { data } = await supabase
			.from(SUPABASE_POST_TABLE)
			.delete()
			.match({ id: postId })
			.select("filename, image_folder, published")
			.single();

		if (data && data.filename) {
			await supabase.storage
				.from(SUPABASE_FILES_BUCKET)
				.remove([data.filename]);

			if (data.image_folder) {
				const { data: imageFiles } = await supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.list(data.image_folder);

				if (imageFiles) {
					const imageNames = imageFiles.map(
						(i) => `${data.image_folder}/${i.name}`
					);
					await supabase.storage
						.from(SUPABASE_IMAGE_BUCKET)
						.remove(imageNames);
				}
			}
			sendRevalidationRequest("/profile/[id]");
		}
	}

	if (searchMeta) {
		const { searchError, searchResults, searching } = searchMeta;

		if (searching) {
			return (
				<div className="flex flex-col gap-10 bg-black z-50">
					{Array.from({ length: 4 }).map((_, i) => (
						<SinglePostLoading key={i} />
					))}
				</div>
			);
		}

		if (searchError) {
			return (
				<p className="text-white bg-black p-4 rounded-sm border-[1px] border-gray-500">
					{searchError.message}
				</p>
			);
		}

		if (searchResults.length > 0) {
			return (
				<div className="flex flex-col gap-3">
					{searchResults.map((post) => (
						<PostComponent
							key={post.id}
							post={post}
							{...{
								publishPostAction,
								unpublishPostAction,
								deletePostAction,
							}}
						/>
					))}
				</div>
			);
		}
	}

	return <>{children}</>;
}

export default NormalChildrenLayout;
