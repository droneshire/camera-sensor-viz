/**
 * Charts for FPS vs FLL/LL analysis and exposure limits
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import type { SensorParams } from '../../utils/sensor-timing/types';
import {
  calculateExposureVsFll,
  calculateFpsVsLineLength,
  calculateTiming,
} from '../../utils/sensor-timing/simulator';

interface TimingChartsProps {
  params: SensorParams;
}

export function TimingCharts({ params }: TimingChartsProps) {
  // Memoize chart data calculations to prevent infinite re-renders
  // Only recalculate when relevant params change (not exposureTime which updates frequently)
  const exposureVsFllData = useMemo(() => {
    return calculateExposureVsFll(params, {
      min: params.height,
      max: params.height * 2,
      step: Math.max(1, Math.floor(params.height / 20)),
    });
  }, [
    params.height,
    params.width,
    params.frameLengthLines,
    params.lineLengthPck,
    params.pixelClockMHz,
    params.lanes,
    params.bitsPerPixel,
    params.shutterType,
    params.exposureMarginLines,
    params.laneRateMbps,
  ]);

  // Memoize FPS vs Line Length data
  const fpsVsLineLengthData = useMemo(() => {
    return calculateFpsVsLineLength(params, {
      min: params.width,
      max: params.width * 2,
      step: Math.max(10, Math.floor(params.width / 20)),
    });
  }, [
    params.height,
    params.width,
    params.frameLengthLines,
    params.lineLengthPck,
    params.pixelClockMHz,
    params.lanes,
    params.bitsPerPixel,
    params.shutterType,
    params.exposureMarginLines,
    params.laneRateMbps,
  ]);

  // Memoize timing calculation
  const currentTiming = useMemo(() => {
    return calculateTiming(params);
  }, [
    params.height,
    params.width,
    params.frameLengthLines,
    params.lineLengthPck,
    params.pixelClockMHz,
    params.lanes,
    params.bitsPerPixel,
    params.shutterType,
    params.exposureMarginLines,
    params.laneRateMbps,
    params.exposureTime, // Include exposureTime for timing summary display
  ]);

  return (
    <div className="space-y-6">
      {/* FPS vs FLL Chart */}
      <Card>
        <CardHeader>
          <CardTitle>FPS vs Frame Length Lines (FLL)</CardTitle>
          <CardDescription>
            Relationship between frame length and frame rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={exposureVsFllData} key={`fll-${params.height}-${params.frameLengthLines}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fll" label={{ value: 'Frame Length Lines', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: 'FPS', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Max Exposure (ms)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fps"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Sensor FPS"
                isAnimationActive={false}
              />
              <Bar
                yAxisId="right"
                dataKey="maxExposure"
                fill="hsl(var(--chart-2))"
                name="Max Exposure (ms)"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-2 text-sm text-muted-foreground">
            Current FPS: <span className="font-semibold text-destructive">{currentTiming.sensorFps.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* FPS vs Line Length Chart */}
      <Card>
        <CardHeader>
          <CardTitle>FPS vs Line Length PCK</CardTitle>
          <CardDescription>
            Impact of line length on frame rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={fpsVsLineLengthData} key={`ll-${params.width}-${params.lineLengthPck}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lineLength" label={{ value: 'Line Length PCK', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: 'FPS', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Max Exposure (ms)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fps"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Sensor FPS"
                isAnimationActive={false}
              />
              <Bar
                yAxisId="right"
                dataKey="maxExposure"
                fill="hsl(var(--chart-2))"
                name="Max Exposure (ms)"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-2 text-sm text-muted-foreground">
            Current FPS: <span className="font-semibold text-destructive">{currentTiming.sensorFps.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Timing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Timing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Line Time</p>
              <p className="text-2xl font-semibold">
                {(currentTiming.lineTime * 1000).toFixed(3)} ms
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Frame Time</p>
              <p className="text-2xl font-semibold">
                {(currentTiming.frameTime * 1000).toFixed(2)} ms
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sensor FPS</p>
              <p className="text-2xl font-semibold">
                {currentTiming.sensorFps.toFixed(2)} fps
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effective FPS</p>
              <p className={`text-2xl font-semibold ${
                currentTiming.effectiveFps < currentTiming.sensorFps
                  ? 'text-yellow-600 dark:text-yellow-500'
                  : 'text-primary'
              }`}>
                {currentTiming.effectiveFps.toFixed(2)} fps
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Exposure</p>
              <p className="text-2xl font-semibold">
                {(currentTiming.maxExposureTime * 1000).toFixed(2)} ms
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Link Bandwidth</p>
              <p className={`text-2xl font-semibold ${
                currentTiming.linkBottlenecked
                  ? 'text-destructive'
                  : 'text-green-600 dark:text-green-500'
              }`}>
                {currentTiming.linkBandwidthMbps.toFixed(1)} / {currentTiming.linkCapacityMbps.toFixed(1)} Mbps
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
