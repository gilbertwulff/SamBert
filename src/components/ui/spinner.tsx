import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-6 h-6"
  };

  return (
    <div
      className={cn(
        "border-2 border-white border-t-transparent rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}
