import * as Dialog from "@radix-ui/react-dialog";
import styles from "./new-snippet-dialog.module.scss";
import { TextSnippet, UploadedFile } from "../../model";
import { useState } from "react";
import cn from "classnames";
import {useTextSelection} from "use-text-selection";
import {nanoid} from "nanoid";

interface NewSnippetDialogProps {
  files: UploadedFile[];
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onCreateSnippet: (snippet: TextSnippet) => void;
}

export const NewSnippetDialog = (props: NewSnippetDialogProps) => {
  const { files, onCreateSnippet } = props;

  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const { textContent } = useTextSelection()

  function onAddSnippet() {
    if (textContent?.trim() && selectedFile) {
      onCreateSnippet({
        id: nanoid(6),
        fileId: selectedFile.id,
        content: textContent
      })
      props.onOpenChange(false)
    }
  }

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles["overlay"]} />
        <Dialog.Content className={styles["content"]}>
          <div className={styles["heading"]}>Select File</div>
          <div className={styles["file-list"]}>
            {files.map((file) => {
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                  className={cn(
                    selectedFile?.id === file.id && styles["selected"],
                  )}
                >
                  {file.title}
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 30}}/>
          <div className={styles["heading"]}>Highlight Text</div>
          <div className={styles["text-area"]}>
            {selectedFile && selectedFile.content.map((paragraph, i) => <p key={i}>{paragraph} </p>)}
          </div>

          <button className={styles["create-button"]} onClick={onAddSnippet}>Add Snippet!</button>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
