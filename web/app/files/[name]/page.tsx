import styles from "./page.module.scss";
import { getFileList } from "../../_data/getFileList";
import { PageContent } from "../../_components/page-content/PageContent";
import { notFound } from "next/navigation";
import { Button } from "../../_components/button/Button";
import { useRouter } from "next/router";
import { removeFile } from "../../_data/removeFile";
import { RemoveButton } from "./RemoveButton";

interface Props {
  params: {
    name: string;
  };
}

export default async function Page({ params }: Props) {
  const fileList = await getFileList();
  const file = fileList.find((file) => file.name === params.name);

  if (!file) {
    notFound();
  }

  return (
    <PageContent
      title={file.name + ".pdf"}
      actionButton={<RemoveButton filename={file.name} />}
    >
      <div className={styles["page-list"]}>
        {file.pages.map((page) => (
          <div key={page.page_num} className={styles["page"]}>
            <div className={styles["page-number"]}>Page {page.page_num}</div>
            {page.chunks.map((chunk) => (
              <div key={chunk.chunk_num} className={styles["chunk"]}>
                {chunk.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </PageContent>
  );
}
