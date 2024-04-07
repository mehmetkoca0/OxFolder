import { revalidate } from "../revalidate";

export async function removeFile(filename: string) {
  const params = new URLSearchParams({ filename: filename + ".pdf" });

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/remove_file?${params}`, {
    method: "GET",
    mode: "no-cors",
  });

  await revalidate();
}
