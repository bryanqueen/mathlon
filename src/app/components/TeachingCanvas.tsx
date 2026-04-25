import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface TeachingCanvasProps {
  isTeaching: boolean;
  currentStep: string;
  onClear?: () => void;
}

interface CanvasElement {
  content: string;
  timestamp: number;
}

export function TeachingCanvas({ isTeaching, currentStep, onClear }: TeachingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const lastStepRef = useRef<string>('');

  const [panOffset, setPanOffset] = useState({ x: 100, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    setCtx(context);

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);


  useEffect(() => {
    if (currentStep && currentStep !== lastStepRef.current) {
      lastStepRef.current = currentStep;
      setElements(prev => [...prev, { content: currentStep, timestamp: Date.now() }]);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    elements.forEach((element, index) => {
      const yOffset = index * 400;
      drawTeachingContent(ctx, element.content, rect.width / zoom, rect.height / zoom, yOffset);
    });

    ctx.restore();
  }, [ctx, elements, panOffset, zoom]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.touches.length === 2 && lastPinchDistance !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const delta = (distance - lastPinchDistance) * 0.003;
      const newZoom = Math.min(Math.max(0.1, zoom + delta), 5);

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = centerX - rect.left;
        const mouseY = centerY - rect.top;

        const zoomRatio = newZoom / zoom;
        setPanOffset({
          x: mouseX - (mouseX - panOffset.x) * zoomRatio,
          y: mouseY - (mouseY - panOffset.y) * zoomRatio,
        });
      }

      setZoom(newZoom);
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setLastPinchDistance(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY * -0.003;
      const newZoom = Math.min(Math.max(0.1, zoom + delta), 5);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomRatio = newZoom / zoom;
      setPanOffset({
        x: mouseX - (mouseX - panOffset.x) * zoomRatio,
        y: mouseY - (mouseY - panOffset.y) * zoomRatio,
      });

      setZoom(newZoom);
    } else {
      setPanOffset({
        x: panOffset.x - e.deltaX,
        y: panOffset.y - e.deltaY,
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.1));
  };

  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 100, y: 50 });
  };

  const drawTeachingContent = (
    context: CanvasRenderingContext2D,
    step: string,
    width: number,
    height: number,
    yOffset: number
  ) => {
    const isDark = document.documentElement.classList.contains('dark');
    context.font = '32px Caveat, Kalam, cursive';
    context.fillStyle = isDark ? '#f0f0f0' : '#2d2d2d';
    context.strokeStyle = isDark ? '#f0f0f0' : '#2d2d2d';
    context.lineWidth = 2;

    const lines = step.split('\n');
    let y = 60 + yOffset;

    lines.forEach((line, index) => {
      if (line.startsWith('[DIAGRAM:')) {
        return;
      }

      if (line.includes('=')) {
        const parts = line.split('=');
        context.fillText(parts[0] + ' =', 40, y);
        context.fillStyle = isDark ? '#6b9bd1' : '#1e6bb8';
        context.fillText(parts[1], 40 + context.measureText(parts[0] + ' = ').width, y);
        context.fillStyle = isDark ? '#f0f0f0' : '#2d2d2d';
      } else if (line.includes('→')) {
        context.fillStyle = isDark ? '#8bd18b' : '#2d8b2d';
        context.fillText(line, 40, y);
        context.fillStyle = isDark ? '#f0f0f0' : '#2d2d2d';
      } else {
        context.fillText(line, 40, y);
      }
      y += 50;
    });

    const diagramYOffset = yOffset + 200;

    if (step.includes('[DIAGRAM:SINE]')) {
      drawSineGraph(context, width, height, diagramYOffset);
    } else if (step.includes('[DIAGRAM:TRIANGLE]')) {
      drawRightTriangle(context, width, height, diagramYOffset);
    } else if (step.includes('[DIAGRAM:CIRCLE]')) {
      drawUnitCircle(context, width, height, diagramYOffset);
    } else if (step.includes('[DIAGRAM:PARABOLA]')) {
      drawParabola(context, width, height, diagramYOffset);
    } else if (step.includes('[DIAGRAM:COORDINATE]')) {
      drawCoordinateSystem(context, width, height, diagramYOffset);
    }
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setElements([]);
    lastStepRef.current = '';
    setPanOffset({ x: 100, y: 50 });
    setZoom(1);
    if (onClear) onClear();
  };

  const drawSineGraph = (context: CanvasRenderingContext2D, width: number, height: number, yOffset: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    const centerX = width / 2;
    const centerY = Math.min(yOffset + 200, height - 150);
    const scale = 40;

    context.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(40, centerY);
    context.lineTo(width - 40, centerY);
    context.stroke();

    context.beginPath();
    context.moveTo(centerX, centerY - 100);
    context.lineTo(centerX, centerY + 100);
    context.stroke();

    context.strokeStyle = isDark ? '#d16b6b' : '#b83b1e';
    context.lineWidth = 3;
    context.beginPath();

    for (let x = -Math.PI * 2; x <= Math.PI * 2; x += 0.1) {
      const y = Math.sin(x);
      const canvasX = centerX + x * scale;
      const canvasY = centerY - y * scale;

      if (x === -Math.PI * 2) {
        context.moveTo(canvasX, canvasY);
      } else {
        context.lineTo(canvasX, canvasY);
      }
    }
    context.stroke();

    context.font = '24px Caveat';
    context.fillStyle = isDark ? '#f0f0f0' : '#2d2d2d';
    context.fillText('sin(x)', width - 100, centerY - 70);
  };

  const drawRightTriangle = (context: CanvasRenderingContext2D, width: number, height: number, yOffset: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    const startX = width / 2 - 100;
    const startY = Math.min(yOffset + 250, height - 180);
    const baseLength = 200;
    const heightLength = 150;

    context.strokeStyle = isDark ? '#6b9bd1' : '#1e6bb8';
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(startX + baseLength, startY);
    context.lineTo(startX + baseLength, startY - heightLength);
    context.closePath();
    context.stroke();

    context.fillStyle = isDark ? '#8bd18b' : '#2d8b2d';
    context.font = '28px Caveat';
    context.fillText('a', startX + baseLength / 2, startY + 30);
    context.fillText('b', startX + baseLength + 20, startY - heightLength / 2);
    context.fillText('c', startX + baseLength / 2 - 30, startY - heightLength / 2);

    const squareSize = 15;
    context.strokeStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
    context.lineWidth = 1;
    context.strokeRect(startX + baseLength - squareSize, startY - squareSize, squareSize, squareSize);
  };

  const drawUnitCircle = (context: CanvasRenderingContext2D, width: number, height: number, yOffset: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    const centerX = width / 2;
    const centerY = Math.min(yOffset + 220, height - 200);
    const radius = 120;

    context.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(centerX - radius - 20, centerY);
    context.lineTo(centerX + radius + 20, centerY);
    context.stroke();

    context.beginPath();
    context.moveTo(centerX, centerY - radius - 20);
    context.lineTo(centerX, centerY + radius + 20);
    context.stroke();

    context.strokeStyle = isDark ? '#6b9bd1' : '#1e6bb8';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.stroke();

    const angle = Math.PI / 4;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY - radius * Math.sin(angle);

    context.strokeStyle = isDark ? '#d16b6b' : '#b83b1e';
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x, y);
    context.stroke();

    context.fillStyle = isDark ? '#d16b6b' : '#b83b1e';
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fill();

    context.font = '24px Caveat';
    context.fillStyle = isDark ? '#f0f0f0' : '#2d2d2d';
    context.fillText('θ', centerX + 20, centerY - 10);
    context.fillText('(cos θ, sin θ)', x + 10, y - 10);
  };

  const drawParabola = (context: CanvasRenderingContext2D, width: number, height: number, yOffset: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    const centerX = width / 2;
    const centerY = Math.min(yOffset + 300, height - 100);
    const scale = 20;

    context.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(40, centerY);
    context.lineTo(width - 40, centerY);
    context.stroke();

    context.beginPath();
    context.moveTo(centerX, height - 50);
    context.lineTo(centerX, 50);
    context.stroke();

    context.strokeStyle = isDark ? '#8bd18b' : '#2d8b2d';
    context.lineWidth = 3;
    context.beginPath();

    for (let x = -6; x <= 6; x += 0.1) {
      const y = x * x;
      const canvasX = centerX + x * scale;
      const canvasY = centerY - y * scale;

      if (x === -6) {
        context.moveTo(canvasX, canvasY);
      } else {
        context.lineTo(canvasX, canvasY);
      }
    }
    context.stroke();

    context.fillStyle = isDark ? '#d16b6b' : '#b83b1e';
    context.beginPath();
    context.arc(centerX + 2 * scale, centerY - 4 * scale, 5, 0, 2 * Math.PI);
    context.fill();

    context.beginPath();
    context.arc(centerX + 3 * scale, centerY - 9 * scale, 5, 0, 2 * Math.PI);
    context.fill();

    context.font = '24px Caveat';
    context.fillStyle = isDark ? '#f0f0f0' : '#2d2d2d';
    context.fillText('y = x²', width - 120, 100);
  };

  const drawCoordinateSystem = (context: CanvasRenderingContext2D, width: number, height: number, yOffset: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    const gridWidth = 400;
    const gridHeight = 300;
    const startX = (width - gridWidth) / 2;
    const startY = yOffset + 50;
    const centerX = startX + gridWidth / 2;
    const centerY = startY + gridHeight / 2;
    const gridSize = 40;

    context.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    context.lineWidth = 1;

    for (let x = startX; x <= startX + gridWidth; x += gridSize) {
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, startY + gridHeight);
      context.stroke();
    }

    for (let y = startY; y <= startY + gridHeight; y += gridSize) {
      context.beginPath();
      context.moveTo(startX, y);
      context.lineTo(startX + gridWidth, y);
      context.stroke();
    }

    context.strokeStyle = isDark ? '#f0f0f0' : '#2d2d2d';
    context.lineWidth = 2;

    context.beginPath();
    context.moveTo(startX, centerY);
    context.lineTo(startX + gridWidth, centerY);
    context.stroke();

    context.beginPath();
    context.moveTo(centerX, startY);
    context.lineTo(centerX, startY + gridHeight);
    context.stroke();

    context.fillStyle = isDark ? '#f0f0f0' : '#2d2d2d';
    context.font = '24px Caveat';
    context.fillText('x', startX + gridWidth - 20, centerY - 10);
    context.fillText('y', centerX + 10, startY + 20);
    context.fillText('0', centerX + 5, centerY + 25);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          background: 'var(--canvas-bg)',
          cursor: isPanning ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <div className="px-3 py-1 bg-card border border-border rounded-lg shadow-lg text-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {elements.length > 0 && (
        <button
          onClick={clearCanvas}
          className="absolute top-4 right-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg shadow-lg hover:opacity-90 transition-opacity text-lg"
        >
          Clear Canvas
        </button>
      )}

      {elements.length > 0 && (
        <div className="absolute bottom-4 right-4 px-3 py-2 bg-card/80 border border-border rounded-lg shadow-lg text-sm backdrop-blur-sm">
          {isPanning ? '🖐️ Panning...' : '✋ Drag to Pan • Ctrl + Scroll to Zoom • Pinch to Zoom'}
        </div>
      )}
    </div>
  );
}
