/**
 * PixiJS-based sensor visualization with rolling shutter animation
 */

import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import type { SensorSimulation, RowSchedule } from '../../utils/sensor-timing/types';
import { getRowStateAtTime } from '../../utils/sensor-timing/simulator';

interface SensorVisualizationProps {
  simulation: SensorSimulation;
  isPlaying: boolean;
  playbackSpeed: number;
  onTimeUpdate?: (time: number) => void;
}

const SENSOR_COLOR_IDLE = 0x1a1a1a;
const SENSOR_COLOR_EXPOSED = 0x4a90e2;
const SENSOR_COLOR_READING = 0x50c878;
const SENSOR_COLOR_READ = 0x888888;

export function SensorVisualization({
  simulation,
  isPlaying,
  playbackSpeed,
  onTimeUpdate,
}: SensorVisualizationProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);
  const rowGraphicsRef = useRef<PIXI.Graphics[]>([]);
  const sensorContainerRef = useRef<PIXI.Container | null>(null);
  const initializedRef = useRef<boolean>(false);
  const updateVisualizationRef = useRef<((currentTime: number) => void) | null>(null);

  const { mode, timing, rowSchedule } = simulation;
  const { width, height } = mode;

  // Initialize PixiJS (only runs once or when simulation changes)
  useEffect(() => {
    if (!canvasRef.current) return;

    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initPixi = async () => {
      try {
        // PixiJS v8: Create Application without options, then call init()
        app = new PIXI.Application();
        appRef.current = app;

        await app.init({
          width: 800,
          height: 600,
          backgroundColor: 0x0a0a0a,
          antialias: true,
        });

        if (!isMounted || !canvasRef.current || !app || !app.canvas) {
          // Clean up if component unmounted during init
          if (app) {
            try {
              app.destroy(true, { children: true, texture: true });
            } catch {
              // Ignore cleanup errors
            }
          }
          appRef.current = null;
          return;
        }

        canvasRef.current.appendChild(app.canvas);
        initializedRef.current = true;

        // Calculate pixel size to fit sensor in view
        const maxWidth = 700;
        const maxHeight = 500;
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(scaleX, scaleY, 2); // Max 2x zoom

        const sensorWidth = width * scale;
        const sensorHeight = height * scale;
        const offsetX = (800 - sensorWidth) / 2;
        const offsetY = (600 - sensorHeight) / 2;

        // Create sensor grid container
        const sensorContainer = new PIXI.Container();
        sensorContainer.x = offsetX;
        sensorContainer.y = offsetY;
        sensorContainerRef.current = sensorContainer;

        if (app.stage) {
          app.stage.addChild(sensorContainer);
        }

        // Create row graphics (one per row for performance)
        const rowGraphics: PIXI.Graphics[] = [];
        for (let row = 0; row < height; row++) {
          const graphics = new PIXI.Graphics();
          graphics.y = row * scale;
          graphics.height = scale;
          sensorContainer.addChild(graphics);
          rowGraphics.push(graphics);
        }
        rowGraphicsRef.current = rowGraphics;

        // Update function
        const updateVisualization = (currentTime: number) => {
          if (!app || !isMounted || !initializedRef.current) return;

          const state = getRowStateAtTime(rowSchedule, currentTime, height);
          const rowGraphics = rowGraphicsRef.current;

          // Clear all rows
          rowGraphics.forEach((g) => {
            g.clear();
          });

          // Draw idle rows
          state.idleRows.forEach((row) => {
            const g = rowGraphics[row];
            if (g) {
              g.rect(0, 0, sensorWidth, scale);
              g.fill(SENSOR_COLOR_IDLE);
            }
          });

          // Draw exposed rows
          state.exposedRows.forEach((row) => {
            const g = rowGraphics[row];
            if (g) {
              g.rect(0, 0, sensorWidth, scale);
              g.fill(SENSOR_COLOR_EXPOSED);
            }
          });

          // Draw reading rows (with scan line effect)
          state.readingRows.forEach((row) => {
            const g = rowGraphics[row];
            const rowScheduleItem = rowSchedule[row];
            if (g && rowScheduleItem) {
              const progress =
                (currentTime % timing.frameTime - rowScheduleItem.readStartTime) /
                (rowScheduleItem.readEndTime - rowScheduleItem.readStartTime);
              const scanX = Math.max(0, Math.min(progress, 1)) * sensorWidth;

              // Draw read portion
              g.rect(0, 0, scanX, scale);
              g.fill(SENSOR_COLOR_READ);

              // Draw reading portion (scan line)
              g.rect(scanX, 0, Math.max(scale * 2, 10), scale);
              g.fill(SENSOR_COLOR_READING);
            }
          });
        };

        updateVisualizationRef.current = updateVisualization;
        updateVisualization(0);
      } catch (error) {
        console.error('Failed to initialize PixiJS:', error);
        initializedRef.current = false;
        if (app) {
          try {
            app.destroy(true, { children: true, texture: true });
          } catch {
            // Ignore cleanup errors
          }
          appRef.current = null;
        }
      }
    };

    initPixi();

    return () => {
      isMounted = false;
      initializedRef.current = false;
      updateVisualizationRef.current = null;

      // Cancel any running animation
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      // Clean up graphics references
      rowGraphicsRef.current = [];
      sensorContainerRef.current = null;

      // Clean up PixiJS app - only if it was actually initialized
      const appToDestroy = appRef.current;
      if (appToDestroy) {
        try {
          // Check if app is still valid before destroying
          if (appToDestroy.canvas && appToDestroy.canvas.parentNode) {
            appToDestroy.canvas.parentNode.removeChild(appToDestroy.canvas);
          }
          // Only destroy if app is actually initialized
          if (appToDestroy.stage) {
            appToDestroy.destroy(true, { children: true, texture: true });
          }
        } catch {
          // Silently ignore cleanup errors - app might already be destroyed
        }
        appRef.current = null;
      }
    };
  }, [simulation, timing, rowSchedule, height, width]);

  // Separate effect for animation loop (runs when isPlaying or playbackSpeed changes)
  useEffect(() => {
    // Cancel any existing animation frame first
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    if (!initializedRef.current || !isPlaying) {
      // If paused, just update visualization once with current time
      if (updateVisualizationRef.current) {
        updateVisualizationRef.current(timeRef.current);
      }
      return;
    }

    // Animation loop
    const animate = () => {
      if (!initializedRef.current || !isPlaying) {
        animationFrameRef.current = undefined;
        return;
      }

      timeRef.current += (16 * playbackSpeed) / 1000; // 16ms per frame, scaled by playback speed
      if (timeRef.current >= timing.frameTime * 3) {
        timeRef.current = 0; // Loop after 3 frames
      }

      if (updateVisualizationRef.current) {
        updateVisualizationRef.current(timeRef.current);
      }
      onTimeUpdate?.(timeRef.current);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isPlaying, playbackSpeed, onTimeUpdate, timing.frameTime]);

  return (
    <div>
      <div ref={canvasRef} style={{ display: 'inline-block' }} />
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: `#${SENSOR_COLOR_IDLE.toString(16)}` }} />
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: `#${SENSOR_COLOR_EXPOSED.toString(16)}` }} />
          <span>Exposed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: `#${SENSOR_COLOR_READING.toString(16)}` }} />
          <span>Reading</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: `#${SENSOR_COLOR_READ.toString(16)}` }} />
          <span>Read</span>
        </div>
      </div>
    </div>
  );
}
