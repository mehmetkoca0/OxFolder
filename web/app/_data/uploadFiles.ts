import { revalidate } from "../revalidate";

export async function uploadFiles(files: File[]) {
  for (const file of files) {
    const data = new FormData();
    data.append("file", file);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add_file`, {
      method: "POST",
      body: data,
      mode: "no-cors",
    });

    await revalidate();
  }
}
