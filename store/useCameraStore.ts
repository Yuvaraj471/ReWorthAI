import { create } from "zustand";

interface CameraState {
  isActive: boolean;
  isPermissionDenied: boolean;
  facingMode: "user" | "environment";
  error: string | null;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string | null;
  setIsActive: (isActive: boolean) => void;
  setPermissionDenied: (denied: boolean) => void;
  setFacingMode: (mode: "user" | "environment") => void;
  setError: (error: string | null) => void;
  setDevices: (devices: MediaDeviceInfo[]) => void;
  setSelectedDeviceId: (id: string | null) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  isActive: false,
  isPermissionDenied: false,
  facingMode: "environment",
  error: null,
  devices: [],
  selectedDeviceId: null,

  setIsActive: (isActive) => set({ isActive }),
  setPermissionDenied: (isPermissionDenied) => set({ isPermissionDenied }),
  setFacingMode: (facingMode) => set({ facingMode }),
  setError: (error) => set({ error }),
  setDevices: (devices) => set({ devices }),
  setSelectedDeviceId: (selectedDeviceId) => set({ selectedDeviceId }),
}));
