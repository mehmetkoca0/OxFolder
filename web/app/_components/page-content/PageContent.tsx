import { ReactNode } from "react";
import styles from "./page-content.module.scss";

interface Props {
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
  children?: ReactNode;
}

export const PageContent = (props: Props) => {
  return (
    <div className={styles["container"]}>
      <div className={styles["header"]}>
        <div>
          <h2 className={styles["page-title"]}>{props.title}</h2>
          {props.subtitle && (
            <div className={styles["page-subtitle"]}>{props.subtitle}</div>
          )}
        </div>
        {props.actionButton && props.actionButton}
      </div>
      <div className={styles["content"]}>{props.children}</div>
    </div>
  );
};
