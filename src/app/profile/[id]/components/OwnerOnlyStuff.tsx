"use client";
import useOwner from "@/hooks/useOwner";
import useShortCut from "@/hooks/useShortcut";
import { useParams, useRouter } from "next/navigation";
import React from "react";

function OwnerOnlyStuff({ children }: { children: React.ReactNode }) {
	const owner = useOwner();

	const router = useRouter();
	const params = useParams();

	useShortCut({
		keys: ["Escape"],
		callback: () => router.push(`/profile/${params?.id}`),
	});

	if (!owner) return <></>;
	return <>{children}</>;
}

export default OwnerOnlyStuff;
