import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import cn from "classnames";
import { PageFrame } from "./PageFrame";

const montserrat = Montserrat({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oxfolder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(montserrat.className, "dark")}>
        <PageFrame>{children}</PageFrame>
      </body>
    </html>
  );
}
