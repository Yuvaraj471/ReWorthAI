export class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement;
  private captureIntervalId: NodeJS.Timeout | null = null;
  private onFrameCaptured: ((frameBase64: string) => void) | null = null;
  
  // Options
  private captureIntervalMs: number = 400;
  private targetSize: number = 640; // 640x640

  constructor() {
    // Create an off-screen canvas for image processing
    if (typeof window !== "undefined") {
      this.canvasElement = document.createElement("canvas");
      this.canvasElement.width = this.targetSize;
      this.canvasElement.height = this.targetSize;
    } else {
      this.canvasElement = {} as HTMLCanvasElement; // For SSR
    }
  }

  /**
   * Enumerates available video input devices
   */
  public async getCameras(): Promise<MediaDeviceInfo[]> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn("enumerateDevices not supported");
        return [];
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === "videoinput");
    } catch (error) {
      console.error("[Camera Error] Failed to enumerate devices:", error);
      return [];
    }
  }

  /**
   * Initializes the camera and starts the video stream
   */
  public async startCamera(videoRef: HTMLVideoElement, facingMode: "user" | "environment" = "environment", deviceId?: string): Promise<void> {
    try {
      this.videoElement = videoRef;
      
      const constraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };

      if (deviceId) {
        constraints.deviceId = { exact: deviceId };
      } else {
        constraints.facingMode = facingMode;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: constraints
      });
      
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
        console.log(`[Camera] Started (deviceId: ${deviceId || 'auto'}, facingMode: ${facingMode})`);
      }
    } catch (error) {
      console.error("[Camera Error] Failed to access camera:", error);
      throw error;
    }
  }

  /**
   * Stops the camera and releases the media stream
   */
  public stopCamera(): void {
    this.stopCapture();
    
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      console.log("[Camera] Stopped");
      console.log("[Cleanup] Completed");
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Switches between front and rear cameras
   */
  public async switchCamera(videoRef: HTMLVideoElement, currentFacingMode: "user" | "environment"): Promise<"user" | "environment"> {
    this.stopCamera();
    const nextMode = currentFacingMode === "user" ? "environment" : "user";
    await this.startCamera(videoRef, nextMode);
    return nextMode;
  }

  /**
   * Sets the callback to handle captured frames
   */
  public setFrameCallback(callback: (frameBase64: string) => void): void {
    this.onFrameCaptured = callback;
  }

  /**
   * Starts capturing frames at the defined interval
   */
  public startCapture(intervalMs: number = 400): void {
    this.captureIntervalMs = intervalMs;
    
    if (this.captureIntervalId) {
      this.stopCapture();
    }
    
    this.captureIntervalId = setInterval(() => {
      // Pause capture when browser tab is inactive
      if (document.hidden) {
        return;
      }
      this.captureFrame();
    }, this.captureIntervalMs);
  }

  /**
   * Stops the frame capture loop
   */
  public stopCapture(): void {
    if (this.captureIntervalId) {
      clearInterval(this.captureIntervalId);
      this.captureIntervalId = null;
    }
  }

  /**
   * Captures a single frame, resizes it, converts to Base64 JPEG, and triggers the callback
   */
  private captureFrame(): void {
    if (!this.videoElement || !this.stream || !this.onFrameCaptured) {
      return;
    }

    const ctx = this.canvasElement.getContext("2d");
    if (!ctx) return;

    // Calculate scaling to fit within targetSize while maintaining aspect ratio
    const videoWidth = this.videoElement.videoWidth;
    const videoHeight = this.videoElement.videoHeight;
    
    if (videoWidth === 0 || videoHeight === 0) return;

    // Scale so the largest dimension is targetSize
    const scale = Math.min(this.targetSize / videoWidth, this.targetSize / videoHeight);
    const drawWidth = videoWidth * scale;
    const drawHeight = videoHeight * scale;

    // Adjust canvas to the scaled video size
    this.canvasElement.width = drawWidth;
    this.canvasElement.height = drawHeight;

    // Draw full video frame to canvas (scaled proportionally)
    ctx.drawImage(
      this.videoElement,
      0, 0, videoWidth, videoHeight, // Source full
      0, 0, drawWidth, drawHeight    // Destination scaled
    );

    // Convert to JPEG Base64 (0.8 quality for compression)
    const base64 = this.canvasElement.toDataURL("image/jpeg", 0.8);
    
    // Strip the prefix for the backend
    const base64Data = base64.replace(/^data:image\/(png|jpeg);base64,/, "");
    
    console.log("[Camera] Frame Captured");
    this.onFrameCaptured(base64Data);
  }
}

export const cameraService = new CameraService();
