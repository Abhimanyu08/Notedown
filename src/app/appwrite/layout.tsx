import React from "react";
import EditorContextProvider from "./components/EditorContext";

function WriteLayout({ children }: { children: React.ReactNode }) {
	return <EditorContextProvider>{children}</EditorContextProvider>;
}

export default WriteLayout;
