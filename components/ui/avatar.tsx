import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  className,
  size = "md",
  children,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base font-semibold",
    xl: "h-20 w-20 text-xl font-bold",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-semibold shadow-2xs select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || "Avatar"}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("flex h-full w-full items-center justify-center font-bold tracking-tight uppercase", className)}
      {...props}
    >
      {children}
    </span>
  );
}
