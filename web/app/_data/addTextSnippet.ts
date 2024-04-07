import { revalidate } from "../revalidate";

export async function addTextSnippet(str: string) {
  if (str.length > 0) {
    const params = new URLSearchParams({ text: str });

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update_text?${params}`, {
      method: "GET",
      mode: "no-cors",
    });

    await revalidate();
  }
  return null;
}
