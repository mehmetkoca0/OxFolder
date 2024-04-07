"use client";
import { ComponentProps, ReactNode } from "react";
import styles from "./dialog.module.scss";
import * as RadixDialog from "@radix-ui/react-dialog";
import cn from "classnames";

interface Props {
  children: ReactNode;
  content: ReactNode;
}

export const Dialog = (props: Props) => {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger asChild>{props.children}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles["dialog-overlay"]} />
        <div className={styles["dialog-content-wrapper"]}>{props.content}</div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

interface DialogContentProps
  extends Omit<ComponentProps<typeof RadixDialog.Content>, "title"> {
  title: string;
  footerButtons?: ReactNode;
}

export const DialogContent = (props: DialogContentProps) => {
  const { footerButtons, children, ...rest } = props;

  return (
    <RadixDialog.Content
      {...rest}
      className={cn(props.className, styles["dialog-content"])}
    >
      <div className={styles["dialog-header"]}>
        <div className={styles["dialog-title"]}>{props.title}</div>
      </div>
      <div className={styles["dialog-main"]}>{children}</div>
      <div className={styles["dialog-footer"]}>{props.footerButtons}</div>
    </RadixDialog.Content>
  );
};

export const DialogClose = RadixDialog.Close;
