import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black shadow-sm border border-neutral-900",
        studio:
          "bg-black text-white hover:bg-neutral-800 active:bg-neutral-950 font-semibold shadow-sm border border-black",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 active:bg-neutral-300",
        outline:
          "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 hover:text-black",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-black",
        destructive:
          "bg-neutral-900 text-white border border-neutral-900 hover:bg-red-600",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 px-2.5 text-[11px]",
        lg: "h-9 px-5 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
