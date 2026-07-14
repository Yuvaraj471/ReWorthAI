import api from "@/lib/api";
import axios, { CancelTokenSource } from "axios";

export interface DetectionResponse {
  detections: {
    class: string;
    confidence: number;
    credits: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }[];
}

export class DetectionService {
  private cancelTokenSource: CancelTokenSource | null = null;

  /**
   * Sends a base64 encoded frame to the backend for AI detection.
   */
  public async detectFrame(frameBase64: string): Promise<DetectionResponse | null> {
    // Cancel previous request if it is still pending
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel("New frame captured, cancelling previous request.");
    }
    this.cancelTokenSource = axios.CancelToken.source();

    if (!frameBase64 || frameBase64.length < 20) {
       console.warn("[Detection API] Invalid or empty frame provided");
       return null;
    }

    try {
      const startTime = Date.now();
      console.log(`[Detection] Upload Started (length: ${frameBase64.length} chars)`);
      const response = await api.post<DetectionResponse>(
        "/api/v1/detect/frame",
        { frame: frameBase64 },
        { 
          cancelToken: this.cancelTokenSource.token,
          timeout: 5000 // 5 seconds timeout for detection
        }
      );
      console.log(`[Detection] Upload Finished in ${Date.now() - startTime}ms with ${response.data.detections?.length || 0} detections`);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("[Detection] Request cancelled");
        return null;
      }
      
      console.error("[Detection Error] Failed to process frame API:", error);
      // We return null instead of throwing to prevent crashing the dashboard
      return null;
    }
  }

  /**
   * Finalizes the current session's detection and awards credits.
   */
  public async finalizeDetection(detections: { category: string; confidence: number; x?: number; y?: number; width?: number; height?: number }[]): Promise<any> {
    try {
      const response = await api.post(
        "/api/v1/detect/finalize",
        { 
          detections: detections.map(d => ({
            waste_class: d.category,
            confidence: d.confidence,
            x: d.x,
            y: d.y,
            width: d.width,
            height: d.height
          }))
        }
      );
      return response.data;
    } catch (error) {
      console.error("[Detection Error] Failed to finalize detection:", error);
      throw error;
    }
  }

  /**
   * Cancels any ongoing detection request
   */
  public cancelOngoingDetection(): void {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel("Session ended or camera paused.");
      this.cancelTokenSource = null;
    }
  }
}

export const detectionService = new DetectionService();
