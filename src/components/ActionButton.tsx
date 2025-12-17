import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick: () => void;
  variant: "validate" | "hint";
  children: ReactNode;
  disabled?: boolean;
}

const ActionButton = ({ onClick, variant, children, disabled }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-bounce flex items-center gap-2 px-6 py-4 rounded-2xl font-display text-xl",
        "shadow-button transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "validate" && "bg-success text-success-foreground hover:brightness-110",
        variant === "hint" && "bg-secondary text-secondary-foreground hover:brightness-95"
      )}
    >
      {children}
    </button>
  );
};

export default ActionButton;
