import { ToolTipComponent } from "@components/ToolTipComponent";
import { BookOpen } from "lucide-react";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import React from "react";
import BlogContextProvider from "../../components/BlogPostComponents/BlogState";
import EditorContextProvider from "./components/EditorContext";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import ExpandedCanvasProvider from "@components/BlogPostComponents/ExpandedCanvas/ExpandedCanvasProvider";
import ExpandedImageProvider from "@components/BlogPostComponents/ExpandedImage/ExpandedImageProvider";

async function WriteLayout({ children }: { children: React.ReactNode }) {
	const supabase = createSupabaseServerClient(cookies);
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<EditorContextProvider>
			<ExpandedCanvasProvider>
				<ExpandedImageProvider>
					<ToolTipComponent
						tip="View all notes"
						className="absolute top-4 right-4 z-[100] text-gray-400 hover:text-gray-100 active:scale-95"
					>
						<Link
							href={
								session
									? `/notebook/${session.user.id}`
									: `/notebook/anon`
							}
						>
							<BookOpen />
						</Link>
					</ToolTipComponent>

					<BlogContextProvider>{children}</BlogContextProvider>
				</ExpandedImageProvider>
			</ExpandedCanvasProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
