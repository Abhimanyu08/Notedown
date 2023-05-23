import React from "react";
import EditorContextProvider from "./components/EditorContext";
import BlogContextProvider from "../apppost/components/BlogState";
import GalleryModal from "./components/GalleryModal";
import UploadModal from "./components/UploadModal";

function WriteLayout({ children }: { children: React.ReactNode }) {
	return (
		<EditorContextProvider>
			<BlogContextProvider>
				<GalleryModal />
				<UploadModal />
				{children}
			</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
