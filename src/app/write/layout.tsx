import React from "react";
import BlogContextProvider from "../../components/BlogPostComponents/BlogState";
import EditorContextProvider from "./components/EditorContext";

function WriteLayout({ children }: { children: React.ReactNode }) {
	return (
		<EditorContextProvider>
			<BlogContextProvider>{children}</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
