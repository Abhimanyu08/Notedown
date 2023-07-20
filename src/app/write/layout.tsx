import React from "react";
import EditorContextProvider from "./components/EditorContext";
import BlogContextProvider from "../../components/BlogPostComponents/BlogState";

function WriteLayout({ children }: { children: React.ReactNode }) {
	return (
		<EditorContextProvider>
			<BlogContextProvider>{children}</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
