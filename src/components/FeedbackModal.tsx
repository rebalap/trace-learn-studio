import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  isOpen: boolean;
  success: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ isOpen, success, onClose }: FeedbackModalProps) => {
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    if (isOpen && success) {
      const newConfetti = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(newConfetti);
    }
  }, [isOpen, success]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative bg-card rounded-3xl p-8 shadow-playful animate-bounce-in",
          "flex flex-col items-center gap-4 min-w-[280px]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {success && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((c) => (
              <div
                key={c.id}
                className="absolute w-3 h-3 animate-confetti"
                style={{
                  left: `${c.left}%`,
                  bottom: "50%",
                  animationDelay: `${c.delay}s`,
                  backgroundColor: ["hsl(15, 90%, 60%)", "hsl(45, 95%, 60%)", "hsl(200, 90%, 55%)", "hsl(140, 70%, 45%)"][
                    c.id % 4
                  ],
                  borderRadius: c.id % 2 === 0 ? "50%" : "0",
                }}
              />
            ))}
          </div>
        )}

        <div
          className={cn(
            "text-7xl animate-pop",
            success ? "" : "animate-wiggle"
          )}
        >
          {success ? "🎉" : "🤔"}
        </div>

        <h2
          className={cn(
            "text-3xl font-display",
            success ? "text-success" : "text-accent"
          )}
        >
          {success ? "Great Job!" : "Keep Trying!"}
        </h2>

        <p className="text-muted-foreground text-center">
          {success
            ? "You traced it perfectly!"
            : "Connect all the dots in order. You can do it!"}
        </p>

        <button
          onClick={onClose}
          className={cn(
            "btn-bounce mt-2 px-8 py-3 rounded-xl font-display text-lg",
            success
              ? "bg-success text-success-foreground"
              : "bg-accent text-accent-foreground"
          )}
        >
          {success ? "Next!" : "Try Again"}
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
