"use client";
import { useContext } from "react";
import { EditorContext } from "@/app/write/components/EditorContext";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NotLoggedInOptions } from "@components/Navbar/Options";
import { X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoginDialog({
	open,
	setOpen,
	dialog,
}: {
	dialog: string;
	open: boolean;
	setOpen: any;
}) {
	const { editorState } = useContext(EditorContext);
	const pathname = usePathname();
	return (
		<AlertDialog open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{dialog}</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex flex-row sm:justify-start">
					<NotLoggedInOptions
						className="flex-row items-center"
						redirectTo={
							pathname?.startsWith("/write")
								? `/write?draft=${editorState.timeStamp}`
								: undefined
						}
					/>
				</AlertDialogFooter>
				<AlertDialogCancel
					className="absolute top-2 right-2 p-2 border-0"
					onClick={() => setOpen(false)}
				>
					<X />
				</AlertDialogCancel>
			</AlertDialogContent>
		</AlertDialog>
	);
}
