import { cn } from "@bingle/ui/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

const Spinner = React.forwardRef<
  SVGSVGElement,
  React.HTMLAttributes<SVGSVGElement> & { size?: number }
>(({ className, size = 35, ...props }, ref) => (
  <Loader2
    ref={ref}
    size={size}
    className={cn("text-primary/60 animate-spin p-0", className)}
    {...props}
  />
));
Spinner.displayName = "Spinner";

export default Spinner;
