import IndexedDbContextProvider from "@components/Contexts/IndexedDbContext";
import React from "react";

function DraftPreviewLayout({ children }: { children: React.ReactNode }) {
	return <IndexedDbContextProvider>{children}</IndexedDbContextProvider>;
}

export default DraftPreviewLayout;
