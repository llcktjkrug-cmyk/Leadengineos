import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Semantic status variants
        requested:
          "border-transparent bg-[var(--status-gray)]/15 text-[var(--status-gray-foreground)]",
        queued:
          "border-transparent bg-[var(--status-blue)]/15 text-[var(--status-blue-foreground)]",
        running:
          "border-transparent bg-[var(--status-indigo)]/15 text-[var(--status-indigo-foreground)]",
        needs_info:
          "border-transparent bg-[var(--status-amber)]/20 text-[var(--status-amber-foreground)]",
        done:
          "border-transparent bg-[var(--status-green)]/15 text-[var(--status-green-foreground)]",
        success:
          "border-transparent bg-[var(--status-green)]/15 text-[var(--status-green-foreground)]",
        failed:
          "border-transparent bg-[var(--status-red)]/15 text-[var(--status-red-foreground)]",
        paused:
          "border-transparent bg-[var(--status-gray)]/10 text-[var(--status-gray)]",
        active:
          "border-transparent bg-[var(--status-green)]/15 text-[var(--status-green-foreground)]",
        past_due:
          "border-transparent bg-[var(--status-red)]/15 text-[var(--status-red-foreground)]",
        canceled:
          "border-transparent bg-[var(--status-gray)]/10 text-[var(--status-gray)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
