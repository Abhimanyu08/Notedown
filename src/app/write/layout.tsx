import React from "react";
import EditorContextProvider from "./components/EditorContext";
import BlogContextProvider from "../post/components/BlogState";
import GalleryModal from "./components/GalleryModal";

function WriteLayout({ children }: { children: React.ReactNode }) {
	return (
		<EditorContextProvider>
			<BlogContextProvider>
				<GalleryModal />
				{children}
			</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
