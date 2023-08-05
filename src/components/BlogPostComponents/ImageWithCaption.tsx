"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import Image from "next/image";
import { lazy, memo, useContext, useEffect, useState } from "react";
import { ExpandedImageContext } from "./ExpandedImage/ExpandedImageProvider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import useRecoverImages from "@/hooks/useRecoverImages";
const ImageUploader = lazy(
	() => import("@components/EditorComponents/ImageUploader")
);

function ImageWithCaption({
	name,
	alt,
	end,
}: {
	name: string;
	alt: string;
	end?: number;
}) {
	const { dispatch } = useContext(EditorContext);
	const { setImageUrl } = useContext(ExpandedImageContext);
	const [imageSrc, setImageSrc] = useState("");
	const pathname = usePathname();
	const indexStoreUrls = useRecoverImages({ imageNames: [name] });

	useEffect(() => {
		dispatch({ type: "add images to upload", payload: [name] });
		return () => {
			dispatch({ type: "remove image from upload", payload: [name] });
		};
	}, []);

	useEffect(() => {
		if (indexStoreUrls.length > 0) {
			setImageSrc(indexStoreUrls[0]);
		}
	}, [indexStoreUrls]);

	return (
		<div className="w-4/5 mx-auto relative">
			<figure className="w-full mb-4 mx-auto">
				{imageSrc && (
					<>
						<Image
							src={imageSrc}
							alt={alt}
							width={1440}
							height={1080}
							onClick={() => setImageUrl && setImageUrl(imageSrc)}
							className="cursor-zoom-in"
						/>
						<figcaption
							className={cn(
								"text-center italic",
								alt ? "" : "invisible"
							)}
						>
							{alt || "hello"}
						</figcaption>
					</>
				)}
			</figure>
			{pathname?.startsWith("/write") && (
				<ImageUploader add={true} end={end} />
			)}
		</div>
	);
}

export default memo(ImageWithCaption);
