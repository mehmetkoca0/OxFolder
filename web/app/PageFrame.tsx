"use client";
import { ReactNode } from "react";
import styles from "./page-frame.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    title: "Manage Files",
    path: "/files",
  },
  {
    title: "Explore Graph",
    path: "/graph",
  },
  {
    title: "All Snippets",
    path: "/all-snippets",
  },
];

interface Props {
  children: ReactNode;
}

export const PageFrame = (props: Props) => {
  const { children } = props;

  const currentPath = usePathname();

  return (
    <div className={styles["page-container"]}>
      <div className={styles["sidebar"]}>
        <h1 className={styles["logo"]}>Oxfolder</h1>
        <nav className={styles["nav"]}>
          {LINKS.map(({ title, path }) => {
            const selected = currentPath.startsWith(path);
            return (
              <Link
                key={path}
                href={path}
                data-selected={selected || undefined}
              >
                <span>{title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className={styles["page-content"]}>{children}</div>
    </div>
  );
};
