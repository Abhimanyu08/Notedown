import EditorContextProvider from "@/app/write/components/EditorContext";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import React from "react";

function DraftPreviewLayout({ children }: { children: React.ReactNode }) {
	return (
		<BlogContextProvider>
			<EditorContextProvider>{children}</EditorContextProvider>
		</BlogContextProvider>
	);
}

export default DraftPreviewLayout;
