import styles from "./page.module.scss";
import { PageContent } from "../_components/page-content/PageContent";
import Link from "next/link";
import { getFileList } from "../_data/getFileList";
import { Dialog } from "../_components/dialog/Dialog";
import { Button } from "../_components/button/Button";
import { UploadFilesDialog } from "./_components/upload-files-dialog/UploadFilesDialog";
import cn from "classnames";
import { AddTextDialog } from "./_components/add-text-dialog/AddTextDialog";

export default async function Page() {
  const fileList = await getFileList();

  return (
    <PageContent
      title="All Files"
      subtitle={`You've uploaded ${fileList.length} files`}
    >
      <div className={styles["file-grid"]}>
        {fileList.map((file) => (
          <Link
            key={file.name}
            href={`/files/${file.name}`}
            className={styles["file-item"]}
          >
            <div className={styles["filename"]}>{file.name}.pdf</div>
            <div className={styles["sep"]} />
            <div className={styles["stat"]}>
              Pages: <span>{file.pages.length}</span>
            </div>
            <div className={styles["stat"]}>
              Total Chunks: <span>{file.total_chunks}</span>
            </div>
            <div className={styles["view-text"]}>View File {">"}</div>
          </Link>
        ))}
        <div className={cn(styles["file-item"], styles["new-data-item"])}>
          <Dialog content={<UploadFilesDialog />}>
            <Button>Add Files...</Button>
          </Dialog>
          <Dialog content={<AddTextDialog />}>
            <Button variant="secondary">Create Text Snippet...</Button>
          </Dialog>
        </div>
      </div>
    </PageContent>
  );
}
