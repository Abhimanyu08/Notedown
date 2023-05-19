import React from "react";
import EditorContextProvider from "./components/EditorContext";
import BlogContextProvider from "../apppost/components/BlogState";

function WriteLayout({ children }: { children: React.ReactNode }) {
	return (
		<EditorContextProvider>
			<BlogContextProvider>{children}</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
