import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface BoundingBox {
  id: string;
  className: string;
  confidence: number;
  credits: number;
  x?: number; // Normalized coordinates 0-1
  y?: number;
  width?: number;
  height?: number;
}

interface DetectionOverlayProps {
  detections: BoundingBox[];
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = React.memo(({ detections }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {detections.map((det) => (
          <motion.div
            key={det.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute border-2 border-emerald-500 bg-emerald-500/10 p-3 rounded-lg shadow-lg flex flex-col items-center justify-center"
            style={
              det.x !== undefined && det.y !== undefined
                ? {
                    left: `${det.x * 100}%`,
                    top: `${det.y * 100}%`,
                    width: det.width ? `${det.width * 100}%` : "auto",
                    height: det.height ? `${det.height * 100}%` : "auto",
                    transform: "translate(-50%, -50%)",
                  }
                : {
                    // Fallback centering if no bounding box coordinates provided
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }
            }
          >
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-1 drop-shadow-md">
              {det.className}
            </span>
            <span className="text-[10px] text-white font-mono drop-shadow-md">
              CONFIDENCE: {(det.confidence * 100).toFixed(1)}%
            </span>
            {det.credits > 0 && (
              <span className="text-[10px] text-lime-400 font-bold drop-shadow-md mt-1">
                +{det.credits} CREDITS
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
