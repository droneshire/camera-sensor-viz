/**
 * Main sensor visualization page integrating all components
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SensorVisualization } from './SensorVisualization';
import { PipelineVisualization } from './PipelineVisualization';
import { SensorControls } from './SensorControls';
import { TimingCharts } from './TimingCharts';
import type { SensorParams, SensorMode, SensorSimulation } from '../../utils/sensor-timing/types';
import { createSimulation } from '../../utils/sensor-timing/simulator';
import { parseImx258Csv } from '../../utils/sensor-timing/csvParser';

const DEFAULT_PARAMS: SensorParams = {
  width: 4208,
  height: 3120,
  frameLengthLines: 3224,
  lineLengthPck: 9016,
  pixelClockMHz: 129.6,
  lanes: 2,
  bitsPerPixel: 10,
  shutterType: 'rolling',
  exposureTime: 0.016, // 16ms
  exposureMarginLines: 10,
  laneRateMbps: 1000,
};

export function SensorVizPage() {
  const [params, setParams] = useState<SensorParams>(DEFAULT_PARAMS);
  const [modes, setModes] = useState<SensorMode[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);

  // Load IMX258 modes from CSV
  useEffect(() => {
    const loadModes = async () => {
      try {
        // Load from public folder
        const csvPath = '/imx258_modelist.csv';
        const response = await fetch(csvPath);
        if (response.ok) {
          const content = await response.text();
          const parsedModes = parseImx258Csv(content);
          setModes(parsedModes);

          // Set first mode as default if available
          if (parsedModes.length > 0) {
            const firstMode = parsedModes[0];
            setParams({
              width: firstMode.width,
              height: firstMode.height,
              frameLengthLines: firstMode.frameLengthLines,
              lineLengthPck: firstMode.lineLengthPck,
              pixelClockMHz: firstMode.pixelClockMHz,
              lanes: firstMode.lanes,
              bitsPerPixel: firstMode.bitsPerPixel || 10,
              shutterType: firstMode.shutterType || 'rolling',
              exposureTime: 0.016,
              exposureMarginLines: 10,
              laneRateMbps: 1000,
            });
          }
        } else {
          console.warn('Could not load CSV from public folder');
        }
      } catch (error) {
        console.warn('Failed to load IMX258 modes:', error);
      }
    };

    loadModes();
  }, []);

  // Create simulation from current params
  const simulation = useMemo<SensorSimulation>(() => {
    return createSimulation(params);
  }, [params]);

  const handleParamsChange = (newParams: Partial<SensorParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleModeSelect = (mode: SensorMode) => {
    setParams({
      width: mode.width,
      height: mode.height,
      frameLengthLines: mode.frameLengthLines,
      lineLengthPck: mode.lineLengthPck,
      pixelClockMHz: mode.pixelClockMHz,
      lanes: mode.lanes,
      bitsPerPixel: mode.bitsPerPixel || 10,
      shutterType: mode.shutterType || 'rolling',
      exposureTime: params.exposureTime,
      exposureMarginLines: params.exposureMarginLines,
      laneRateMbps: params.laneRateMbps,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Camera Sensor Visualization</h1>
        <p className="text-muted-foreground mt-2">
          Visualize sensor timing, readout patterns, and pipeline performance
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Controls */}
        <div className="w-full lg:w-1/3">
          <SensorControls
            params={params}
            modes={modes}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onParamsChange={handleParamsChange}
            onModeSelect={handleModeSelect}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onPlaybackSpeedChange={setPlaybackSpeed}
          />
        </div>

        {/* Middle Column: Visualizations */}
        <div className="flex-1 space-y-6">
          {/* Sensor Visualization */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Sensor Readout Visualization</h2>
            <div className="bg-black/50 rounded-lg p-4 border border-border/50">
              <SensorVisualization
                simulation={simulation}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                onTimeUpdate={setCurrentTime}
              />
            </div>
          </div>

          {/* Pipeline Visualization */}
          <PipelineVisualization
            timing={simulation.timing}
            currentTime={currentTime}
            frameTime={simulation.timing.frameTime}
          />
        </div>
      </div>

      {/* Bottom: Charts */}
      <div className="mt-6">
        <TimingCharts params={params} />
      </div>
    </div>
  );
}
