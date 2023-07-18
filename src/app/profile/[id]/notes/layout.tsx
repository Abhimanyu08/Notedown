// import NoteTypeToggle from "./components/NoteTypeToggle";

function NotesLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{/* <NoteTypeToggle /> */}
			<div
				className="grow overflow-y-auto
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				"
			>
				{children}
			</div>
		</>
	);
}

export default NotesLayout;
