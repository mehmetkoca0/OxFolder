"use client";
import { useRouter } from "next/navigation";
import { removeFile } from "../../_data/removeFile";
import { Button } from "../../_components/button/Button";

interface Props {
  filename: string;
}

export const RemoveButton = (props: Props) => {
  const router = useRouter();

  async function onRemove() {
    await removeFile(props.filename);
    router.push("/files");
  }

  return (
    <Button variant="danger" onClick={onRemove}>
      Remove File
    </Button>
  );
};
