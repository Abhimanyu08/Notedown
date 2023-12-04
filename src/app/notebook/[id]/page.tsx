import EditorContextProvider from "@/app/write/components/EditorContext";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import { getUser } from "@utils/getData";
import { Suspense } from "react";
import DraftPreview from "./components/DraftPreview";
import PostPreview from "./components/PostPreviewComponents/PostPreview";

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
