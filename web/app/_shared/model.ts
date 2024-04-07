export interface UploadedFile {
  id: string;
  title: string;
  content: string[];
}

export interface TextSnippet {
  id: string;
  fileId: string;
  content: string;
}
