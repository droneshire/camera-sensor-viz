/**
 * Pipeline visualization: Sensor → ADC → MIPI → Receiver
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import type { SensorTiming } from '../../utils/sensor-timing/types';

interface PipelineVisualizationProps {
  timing: SensorTiming;
  currentTime: number;
  frameTime: number;
}

interface PipelineStage {
  name: string;
  description: string;
  latency: number; // Processing time in seconds
  throughput: number; // Data rate in Mbps
  color: string;
}

export function PipelineVisualization({
  timing,
  currentTime,
  frameTime,
}: PipelineVisualizationProps) {
  const frameProgress = (currentTime % frameTime) / frameTime;

  // Calculate stage latencies (simplified model)
  const stages: PipelineStage[] = [
    {
      name: 'Sensor',
      description: 'Pixel readout',
      latency: timing.readoutDuration,
      throughput: timing.linkBandwidthMbps,
      color: 'hsl(210, 70%, 60%)',
    },
    {
      name: 'ADC',
      description: 'Analog to Digital',
      latency: timing.readoutDuration * 0.1, // 10% of readout time
      throughput: timing.linkBandwidthMbps,
      color: 'hsl(142, 52%, 55%)',
    },
    {
      name: 'MIPI CSI-2',
      description: `${timing.linkBandwidthMbps.toFixed(1)} Mbps / ${timing.linkCapacityMbps.toFixed(1)} Mbps`,
      latency: timing.readoutDuration * 0.05,
      throughput: Math.min(timing.linkBandwidthMbps, timing.linkCapacityMbps),
      color: timing.linkBottlenecked ? 'hsl(0, 70%, 60%)' : 'hsl(38, 92%, 50%)',
    },
    {
      name: 'Receiver',
      description: `Effective: ${timing.effectiveFps.toFixed(1)} fps`,
      latency: 1 / timing.effectiveFps - timing.frameTime,
      throughput: timing.linkBandwidthMbps,
      color: 'hsl(270, 50%, 60%)',
    },
  ];

  const getStageProgress = (stageIndex: number): number => {
    const cumulativeLatency = stages
      .slice(0, stageIndex + 1)
      .reduce((sum, s) => sum + s.latency, 0);
    const totalLatency = stages.reduce((sum, s) => sum + s.latency, 0);

    if (totalLatency === 0) return 0;

    // Calculate where we are in the pipeline based on frame progress
    const pipelineProgress = (frameProgress * frameTime) / totalLatency;
    const stageStart = stages.slice(0, stageIndex).reduce((sum, s) => sum + s.latency, 0) / totalLatency;
    const stageEnd = cumulativeLatency / totalLatency;

    if (pipelineProgress < stageStart) return 0;
    if (pipelineProgress > stageEnd) return 1;
    return (pipelineProgress - stageStart) / (stageEnd - stageStart);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage, index) => {
          const progress = getStageProgress(index);
          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">{stage.name}</span>
                <span className="text-xs text-muted-foreground">{stage.description}</span>
              </div>
              <div className="relative h-8 rounded-md bg-muted overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full transition-all duration-100 ease-linear"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: stage.color,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-white shadow-lg transition-all duration-100 ease-linear"
                  style={{
                    left: `${progress * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Latency: {(stage.latency * 1000).toFixed(2)} ms
              </p>
            </div>
          );
        })}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frame Progress</span>
            <span className="font-medium">{(frameProgress * 100).toFixed(1)}%</span>
          </div>
          <Progress value={frameProgress * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
