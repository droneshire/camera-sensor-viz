/**
 * Core types for camera sensor timing simulation
 */

export type ShutterType = 'rolling' | 'global';

export interface SensorMode {
  /** Mode identifier (e.g., "A30", "B30") */
  id: string;
  /** Mode description */
  description: string;
  /** Horizontal resolution (active pixels) */
  width: number;
  /** Vertical resolution (active lines) */
  height: number;
  /** Frame Length Lines (FLL) - total lines per frame including blanking */
  frameLengthLines: number;
  /** Line Length PCK - total pixel clocks per line including blanking */
  lineLengthPck: number;
  /** Pixel clock frequency in MHz */
  pixelClockMHz: number;
  /** Number of MIPI CSI-2 lanes */
  lanes: number;
  /** Bits per pixel */
  bitsPerPixel?: number;
  /** Shutter type */
  shutterType?: ShutterType;
}

export interface SensorTiming {
  /** Line time in seconds */
  lineTime: number;
  /** Frame time in seconds */
  frameTime: number;
  /** Sensor FPS (1 / frameTime) */
  sensorFps: number;
  /** Maximum exposure time for rolling shutter (with margin) */
  maxExposureTime: number;
  /** Readout duration for all rows */
  readoutDuration: number;
  /** Effective FPS (limited by link/receiver) */
  effectiveFps: number;
  /** CSI-2 link bandwidth requirement in Mbps */
  linkBandwidthMbps: number;
  /** CSI-2 link capacity in Mbps */
  linkCapacityMbps: number;
  /** Whether link is bottlenecked */
  linkBottlenecked: boolean;
}

export interface RowSchedule {
  /** Row index (0-based) */
  row: number;
  /** Start time of row readout (seconds) */
  readStartTime: number;
  /** End time of row readout (seconds) */
  readEndTime: number;
  /** Sample time for rolling shutter (when exposure ends) */
  sampleTime?: number;
}

export interface SensorSimulation {
  /** Input mode */
  mode: SensorMode;
  /** Calculated timing */
  timing: SensorTiming;
  /** Per-row readout schedule */
  rowSchedule: RowSchedule[];
  /** Current simulation time (for animation) */
  currentTime: number;
}

export interface SensorParams {
  /** Horizontal resolution */
  width: number;
  /** Vertical resolution */
  height: number;
  /** Frame Length Lines */
  frameLengthLines: number;
  /** Line Length PCK */
  lineLengthPck: number;
  /** Pixel clock in MHz */
  pixelClockMHz: number;
  /** Number of lanes */
  lanes: number;
  /** Bits per pixel (default 10 for RAW) */
  bitsPerPixel?: number;
  /** Shutter type */
  shutterType?: ShutterType;
  /** Exposure time in seconds (for visualization) */
  exposureTime?: number;
  /** Margin lines for max exposure calculation */
  exposureMarginLines?: number;
  /** MIPI CSI-2 lane rate in Mbps per lane */
  laneRateMbps?: number;
  /** Receiver processing limit FPS */
  receiverMaxFps?: number;
}
