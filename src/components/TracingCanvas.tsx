import { useRef, useEffect, useState, useCallback } from "react";
import { DotPoint } from "@/data/letterPaths";

interface TracingCanvasProps {
  character: string;
  dots: DotPoint[];
  onComplete: (success: boolean) => void;
  showHint: boolean;
  validate: boolean;
  onValidationComplete: () => void;
}

const TracingCanvas = ({
  character,
  dots,
  onComplete,
  showHint,
  validate,
  onValidationComplete,
}: TracingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [connectedDots, setConnectedDots] = useState<number[]>([]);
  const [currentDotIndex, setCurrentDotIndex] = useState(0);
  const [drawnLines, setDrawnLines] = useState<{ from: DotPoint; to: DotPoint }[]>([]);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const canvasSize = 280;
  const dotRadius = 14;
  const hitRadius = 28;

  const scalePoint = useCallback(
    (point: DotPoint) => ({
      x: (point.x / 100) * canvasSize,
      y: (point.y / 100) * canvasSize,
    }),
    [canvasSize]
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw hint lines if showing hint
    if (showHint) {
      ctx.strokeStyle = "hsl(45, 95%, 60%)";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      dots.forEach((dot, index) => {
        const scaled = scalePoint(dot);
        if (index === 0) {
          ctx.moveTo(scaled.x, scaled.y);
        } else {
          ctx.lineTo(scaled.x, scaled.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw user's traced lines
    ctx.strokeStyle = "hsl(140, 70%, 45%)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawnLines.forEach((line) => {
      const from = scalePoint(line.from);
      const to = scalePoint(line.to);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    // Draw dots
    dots.forEach((dot, index) => {
      const scaled = scalePoint(dot);
      const isConnected = connectedDots.includes(index);
      const isNext = index === currentDotIndex;
      const isFirst = index === 0 && currentDotIndex === 0;

      // Outer glow for next dot
      if (isNext || isFirst) {
        ctx.beginPath();
        ctx.arc(scaled.x, scaled.y, dotRadius + 6, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(15, 90%, 60%, 0.3)";
        ctx.fill();
      }

      // Main dot
      ctx.beginPath();
      ctx.arc(scaled.x, scaled.y, dotRadius, 0, Math.PI * 2);
      if (isConnected) {
        ctx.fillStyle = "hsl(140, 70%, 45%)";
      } else if (isNext || isFirst) {
        ctx.fillStyle = "hsl(15, 90%, 60%)";
      } else {
        ctx.fillStyle = "hsl(200, 90%, 55%)";
      }
      ctx.fill();

      // Number label
      ctx.fillStyle = "white";
      ctx.font = "bold 14px 'Fredoka One', cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(dot.order), scaled.x, scaled.y);
    });

    // Draw the large character watermark
    ctx.font = "bold 180px 'Fredoka One', cursive";
    ctx.fillStyle = "hsla(200, 30%, 85%, 0.25)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(character, canvasSize / 2, canvasSize / 2);
  }, [dots, connectedDots, currentDotIndex, drawnLines, showHint, character, scalePoint]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (validate) {
      const isComplete = connectedDots.length === dots.length;
      onComplete(isComplete);
      onValidationComplete();
    }
  }, [validate, connectedDots.length, dots.length, onComplete, onValidationComplete]);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const checkDotHit = (x: number, y: number): number => {
    for (let i = 0; i < dots.length; i++) {
      const scaled = scalePoint(dots[i]);
      const distance = Math.sqrt((x - scaled.x) ** 2 + (y - scaled.y) ** 2);
      if (distance <= hitRadius) {
        return i;
      }
    }
    return -1;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const hitDot = checkDotHit(coords.x, coords.y);
    if (hitDot === currentDotIndex) {
      setIsDrawing(true);
      if (!connectedDots.includes(hitDot)) {
        setConnectedDots([...connectedDots, hitDot]);
      }
      setLastPoint(coords);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const hitDot = checkDotHit(coords.x, coords.y);
    if (hitDot === currentDotIndex + 1 && currentDotIndex < dots.length - 1) {
      // Connected to next dot
      setDrawnLines([
        ...drawnLines,
        { from: dots[currentDotIndex], to: dots[hitDot] },
      ]);
      setConnectedDots([...connectedDots, hitDot]);
      setCurrentDotIndex(hitDot);
      setLastPoint(coords);
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const resetCanvas = useCallback(() => {
    setConnectedDots([]);
    setCurrentDotIndex(0);
    setDrawnLines([]);
    setLastPoint(null);
  }, []);

  useEffect(() => {
    resetCanvas();
  }, [character, dots, resetCanvas]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="bg-card rounded-2xl shadow-playful border-4 border-primary/20 touch-none cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
      <p className="text-lg text-muted-foreground">
        Connect the dots: <span className="text-primary font-bold">1</span> →{" "}
        <span className="text-primary font-bold">{dots.length}</span>
      </p>
    </div>
  );
};

export default TracingCanvas;
