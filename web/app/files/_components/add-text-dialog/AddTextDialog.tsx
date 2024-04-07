"use client";
import styles from "./add-text-dialog.module.scss";
import { DialogContent } from "../../../_components/dialog/Dialog";
import { useRef, useState } from "react";
import { Button } from "../../../_components/button/Button";
import { DialogClose } from "@radix-ui/react-dialog";
import { addTextSnippet } from "../../../_data/addTextSnippet";

export const AddTextDialog = () => {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const closeRef = useRef<HTMLButtonElement>(null);

  async function onAdd() {
    setIsLoading(true);
    await addTextSnippet(value);
    closeRef.current?.click();
  }

  return (
    <DialogContent
      title="Create New Text Snippet"
      className={styles["container"]}
      footerButtons={
        <>
          <DialogClose ref={closeRef} asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={onAdd} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Snippet"}
          </Button>
        </>
      }
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={styles["text-area"]}
      />
    </DialogContent>
  );
};
