"use client";
import styles from "./page.module.scss";
import { useSessionStorage } from "../_shared/hooks/useSessionStorage";
import { UploadIcon } from "../_components/icons/upload";
import cn from "classnames";
import { useFilePicker } from "use-file-picker";
import { FileContent } from "use-file-picker/types";
import { nanoid } from "nanoid";
import { PlusIcon } from "../_components/icons/plus";
import { NewSnippetDialog } from "../_shared/components/new-snippet-dialog/new-sippet-dialog";
import { useState } from "react";
import { TextSnippet, UploadedFile } from "../_shared/model";
import { PageContent } from "../_components/page-content/PageContent";

export default function Page() {
  return <PageContent title="All Snippets" />;
}
