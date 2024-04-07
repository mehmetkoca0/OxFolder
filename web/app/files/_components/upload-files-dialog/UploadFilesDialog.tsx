"use client";
import styles from "./upload-files-dialog.module.scss";
import { DialogContent } from "../../../_components/dialog/Dialog";
import { useRef, useState } from "react";
import { useFilePicker } from "use-file-picker";
import { FileContent } from "use-file-picker/types";
import { Button } from "../../../_components/button/Button";
import { DialogClose } from "@radix-ui/react-dialog";
import cn from "classnames";
import { UploadIcon } from "../../../_components/icons/upload";
import { uploadFiles } from "../../../_data/uploadFiles";

export const UploadFilesDialog = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const closeRef = useRef<HTMLButtonElement>(null);

  const { openFilePicker } = useFilePicker({
    accept: [".txt", ".pdf"],
    multiple: true,
    onFilesSuccessfullySelected: ({
      filesContent,
      plainFiles,
    }: {
      filesContent: FileContent<string>[];
      plainFiles: File[];
    }) => {
      plainFiles.forEach((file) => {
        setUploadedFiles((prev) => [...prev, file]);
      });
    },
  });

  function deleteFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onUpload() {
    setIsLoading(true);
    await uploadFiles(uploadedFiles);
    closeRef.current?.click();
  }

  return (
    <DialogContent
      title="Upload Files"
      className={styles["container"]}
      footerButtons={
        <>
          <DialogClose ref={closeRef} asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={onUpload} disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload Files"}
          </Button>
        </>
      }
    >
      {uploadedFiles.length > 0 && (
        <div className={styles["file-list"]}>
          {uploadedFiles.map((file, i) => (
            <div key={i} className={styles["row"]}>
              {file.name}
              <button
                className={styles["remove-button"]}
                onClick={() => deleteFile(i)}
              >
                X
              </button>
            </div>
          ))}
          <div
            className={cn(styles["row"], styles["add-more-row"])}
            onClick={openFilePicker}
          >
            Add more files...
          </div>
        </div>
      )}
      {uploadedFiles.length === 0 && (
        <button className={styles["big-upload"]} onClick={openFilePicker}>
          <UploadIcon />
          <span>Upload Files...</span>
        </button>
      )}
    </DialogContent>
  );
};
