/**
 * Core sensor timing simulator
 * Pure TypeScript library - no React dependencies
 */

import type {
  SensorMode,
  SensorTiming,
  RowSchedule,
  SensorSimulation,
  SensorParams,
  ShutterType,
} from './types';

/**
 * Calculate sensor timing from mode parameters
 */
export function calculateTiming(params: SensorParams): SensorTiming {
  const {
    width,
    height,
    frameLengthLines,
    lineLengthPck,
    pixelClockMHz,
    lanes = 2,
    bitsPerPixel = 10,
    shutterType = 'rolling',
    exposureMarginLines = 10,
    laneRateMbps = 1000, // Default 1 Gbps per lane (MIPI CSI-2)
    receiverMaxFps = Infinity,
  } = params;

  // Convert pixel clock from MHz to Hz
  const pixelClockHz = pixelClockMHz * 1e6;

  // Line time = line_length_pck / pixel_clock
  const lineTime = lineLengthPck / pixelClockHz;

  // Frame time = FLL * line_time
  const frameTime = frameLengthLines * lineTime;

  // Sensor FPS = 1 / frame_time
  const sensorFps = 1 / frameTime;

  // Max exposure for rolling shutter (with margin)
  const maxExposureTime =
    shutterType === 'rolling'
      ? (frameLengthLines - exposureMarginLines) * lineTime
      : frameTime * 0.9; // Global shutter: 90% of frame time

  // Readout duration = active_rows * line_time (simplified)
  const readoutDuration = height * lineTime;

  // Calculate CSI-2 link bandwidth requirement
  // Payload per frame = width * height * bits_per_pixel
  const payloadBitsPerFrame = width * height * bitsPerPixel;
  const linkBandwidthMbps = payloadBitsPerFrame * sensorFps / 1e6;

  // Link capacity = lanes * lane_rate
  const linkCapacityMbps = lanes * laneRateMbps;

  // Effective FPS is limited by sensor, link, and receiver
  const linkLimitedFps = linkCapacityMbps / (payloadBitsPerFrame / 1e6);
  const effectiveFps = Math.min(sensorFps, linkLimitedFps, receiverMaxFps);

  const linkBottlenecked = linkBandwidthMbps > linkCapacityMbps * 0.95;

  return {
    lineTime,
    frameTime,
    sensorFps,
    maxExposureTime,
    readoutDuration,
    effectiveFps,
    linkBandwidthMbps,
    linkCapacityMbps,
    linkBottlenecked,
  };
}

/**
 * Generate per-row readout schedule
 */
export function generateRowSchedule(
  params: SensorParams,
  timing: SensorTiming,
  numFrames: number = 1
): RowSchedule[] {
  const { height, shutterType = 'rolling', exposureTime } = params;
  const { lineTime, frameTime } = timing;

  const schedule: RowSchedule[] = [];

  for (let frame = 0; frame < numFrames; frame++) {
    const frameStartTime = frame * frameTime;

    for (let row = 0; row < height; row++) {
      const readStartTime = frameStartTime + row * lineTime;
      const readEndTime = readStartTime + lineTime;

      let sampleTime: number | undefined;
      if (shutterType === 'rolling' && exposureTime !== undefined) {
        // For rolling shutter, sample time is when exposure ends
        // Exposure starts at readStartTime - exposureTime
        sampleTime = readStartTime;
      } else if (shutterType === 'global') {
        // Global shutter samples at frame start
        sampleTime = frameStartTime;
      }

      schedule.push({
        row: row + frame * height,
        readStartTime,
        readEndTime,
        sampleTime,
      });
    }
  }

  return schedule;
}

/**
 * Create a sensor simulation from parameters
 */
export function createSimulation(params: SensorParams): SensorSimulation {
  const mode: SensorMode = {
    id: 'custom',
    description: 'Custom Mode',
    width: params.width,
    height: params.height,
    frameLengthLines: params.frameLengthLines,
    lineLengthPck: params.lineLengthPck,
    pixelClockMHz: params.pixelClockMHz,
    lanes: params.lanes,
    bitsPerPixel: params.bitsPerPixel,
    shutterType: params.shutterType,
  };

  const timing = calculateTiming(params);
  const rowSchedule = generateRowSchedule(params, timing, 3); // Generate 3 frames for animation

  return {
    mode,
    timing,
    rowSchedule,
    currentTime: 0,
  };
}

/**
 * Get row state at a given time
 */
export function getRowStateAtTime(
  schedule: RowSchedule[],
  time: number,
  height: number
): {
  readingRows: number[];
  exposedRows: number[];
  idleRows: number[];
} {
  const readingRows: number[] = [];
  const exposedRows: number[] = [];
  const idleRows: number[] = [];

  // Normalize time to current frame
  const frameTime = schedule[height - 1]?.readEndTime || 0;
  const normalizedTime = time % frameTime;

  for (let row = 0; row < height; row++) {
    const rowSchedule = schedule[row];
    if (!rowSchedule) {
      idleRows.push(row);
      continue;
    }

    const rowNormalizedTime = normalizedTime % frameTime;
    if (
      rowNormalizedTime >= rowSchedule.readStartTime &&
      rowNormalizedTime < rowSchedule.readEndTime
    ) {
      readingRows.push(row);
    } else if (
      rowSchedule.sampleTime !== undefined &&
      rowNormalizedTime >= rowSchedule.sampleTime - 0.01 &&
      rowNormalizedTime < rowSchedule.readStartTime
    ) {
      exposedRows.push(row);
    } else {
      idleRows.push(row);
    }
  }

  return { readingRows, exposedRows, idleRows };
}

/**
 * Calculate exposure vs FLL/LL relationship
 */
export function calculateExposureVsFll(
  baseParams: SensorParams,
  fllRange: { min: number; max: number; step: number }
): Array<{ fll: number; maxExposure: number; fps: number }> {
  const results: Array<{ fll: number; maxExposure: number; fps: number }> = [];

  for (let fll = fllRange.min; fll <= fllRange.max; fll += fllRange.step) {
    const params = { ...baseParams, frameLengthLines: fll };
    const timing = calculateTiming(params);
    results.push({
      fll,
      maxExposure: timing.maxExposureTime,
      fps: timing.sensorFps,
    });
  }

  return results;
}

/**
 * Calculate FPS vs Line Length relationship
 */
export function calculateFpsVsLineLength(
  baseParams: SensorParams,
  llRange: { min: number; max: number; step: number }
): Array<{ lineLength: number; fps: number; maxExposure: number }> {
  const results: Array<{ lineLength: number; fps: number; maxExposure: number }> = [];

  for (let ll = llRange.min; ll <= llRange.max; ll += llRange.step) {
    const params = { ...baseParams, lineLengthPck: ll };
    const timing = calculateTiming(params);
    results.push({
      lineLength: ll,
      fps: timing.sensorFps,
      maxExposure: timing.maxExposureTime,
    });
  }

  return results;
}
