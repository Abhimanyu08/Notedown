import React from "react";
import { VscLoading } from "react-icons/vsc";

function UploadModal() {
	return (
		<>
			<input
				type="checkbox"
				name=""
				id="upload"
				className="modal-input"
			/>
			<label htmlFor="upload" className="modal-box">
				<div className="flex flex-col bg-black p-10 gap-4">
					<StageUpdates status="Uploading post file" />
					<StageUpdates status="Uploading photos" />
					<StageUpdates status="Uploading canvas images" />
				</div>
			</label>
		</>
	);
}

const StageUpdates = ({ status }: { status: string }) => {
	return (
		<div className="flex items-center w-52">
			<span className="basis-10/12">{status}</span>
			<VscLoading className="animate-spin font-semibold" />
		</div>
	);
};

export default UploadModal;
