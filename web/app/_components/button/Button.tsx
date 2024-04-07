import { ComponentProps, forwardRef } from "react";
import styles from "./button.module.scss";
import cn from "classnames";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { variant = "primary", ...rest } = props;

    return (
      <button
        ref={ref}
        {...rest}
        data-disabled={props.disabled || undefined}
        className={cn(props.className, styles["button"], styles[variant])}
      />
    );
  },
);
