import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`glass-card rounded-lg p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}