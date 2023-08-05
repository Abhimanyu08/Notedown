import React from "react";
import EditorContextProvider from "./components/EditorContext";
import BlogContextProvider from "../../components/BlogPostComponents/BlogState";
import IndexedDbContextProvider from "@components/Contexts/IndexedDbContext";

function WriteLayout({ children }: { children: React.ReactNode }) {
	return (
		<EditorContextProvider>
			<BlogContextProvider>
				<IndexedDbContextProvider>{children}</IndexedDbContextProvider>
			</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
