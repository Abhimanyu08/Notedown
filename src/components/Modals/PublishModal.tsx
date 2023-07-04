"use client";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { ToastContext } from "@/contexts/ToastProvider";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import { useRouter } from "next/navigation";
import React, { useContext, useTransition } from "react";
import { BiCheck } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { VscLoading } from "react-icons/vsc";

function PublishModal({
	publishPostAction,
}: {
	publishPostAction: (postId: number) => Promise<void>;
}) {
	const { blogState } = useContext(BlogContext);
	const toastContext = useContext(ToastContext);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	return (
		<>
			<input
				type="checkbox"
				className="modal-input"
				id="private-publish"
			/>
			<label
				htmlFor="private-publish"
				className="modal-box bg-black/70 backdrop-blur-sm"
			>
				<label
					htmlFor=""
					className="bg-black rounded-sm flex gap-2  border-[1px] border-gray-400 p-4 text-gray-300"
				>
					<span>Publish</span>
					<span className="font-semibold text-white">
						{blogState.blogMeta.title} ?
					</span>
					<button
						className="p-1 rounded-full hover:bg-gray-700"
						onClick={() => {
							startTransition(() =>
								publishPostAction(blogState.blogMeta.id!).then(
									() => {
										toastContext?.setMessage(
											"Post Published !"
										);
										router.replace(
											`/post/${blogState.blogMeta.id}`
										);
									}
								)
							);
						}}
					>
						{isPending ? (
							<VscLoading className="animate-spin" />
						) : (
							<BiCheck />
						)}
					</button>
					<label
						htmlFor={`private-publish`}
						className="p-1 rounded-full hover:bg-gray-700"
					>
						<IoMdClose />
					</label>
				</label>
			</label>
		</>
	);
}

export default PublishModal;
