import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

type ProgressVariant = "default" | "quota";

function Progress({
  className,
  value,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  variant?: ProgressVariant;
}) {
  // For quota variant, color based on percentage
  const getIndicatorColor = () => {
    if (variant !== "quota") return "bg-primary";
    const percentage = value || 0;
    if (percentage < 50) return "bg-[var(--status-green)]";
    if (percentage < 80) return "bg-[var(--status-amber)]";
    return "bg-[var(--status-red)]";
  };

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-muted relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all",
          getIndicatorColor()
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
