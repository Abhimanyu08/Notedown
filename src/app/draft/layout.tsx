"use client";
import IndexedDbContextProvider from "@components/Contexts/IndexedDbContext";
import React from "react";

function DraftLayout({ children }: { children: React.ReactNode }) {
	return <IndexedDbContextProvider>{children}</IndexedDbContextProvider>;
}

export default DraftLayout;
