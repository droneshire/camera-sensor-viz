/**
 * UI controls for sensor parameters
 */

import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { SensorParams, SensorMode } from '../../utils/sensor-timing/types';

interface SensorControlsProps {
  params: SensorParams;
  modes: SensorMode[];
  isPlaying: boolean;
  playbackSpeed: number;
  onParamsChange: (params: Partial<SensorParams>) => void;
  onModeSelect: (mode: SensorMode) => void;
  onPlayPause: () => void;
  onPlaybackSpeedChange: (speed: number) => void;
}

export function SensorControls({
  params,
  modes,
  isPlaying,
  playbackSpeed,
  onParamsChange,
  onModeSelect,
  onPlayPause,
  onPlaybackSpeedChange,
}: SensorControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-2">
          <Label>Preset Mode</Label>
          <Select
            value={params.width && params.height ? 'custom' : modes[0]?.id || ''}
            onValueChange={(value) => {
              if (value === 'custom') return;
              const mode = modes.find((m) => m.id === value);
              if (mode) {
                onModeSelect(mode);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom</SelectItem>
              {modes.map((mode) => (
                <SelectItem key={mode.id} value={mode.id}>
                  {mode.id}: {mode.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Width (pixels)</Label>
            <Input
              type="number"
              value={params.width}
              onChange={(e) =>
                onParamsChange({ width: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Height (lines)</Label>
            <Input
              type="number"
              value={params.height}
              onChange={(e) =>
                onParamsChange({ height: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        {/* Frame Length Lines */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Frame Length Lines (FLL)</Label>
            <span className="text-sm text-muted-foreground">{params.frameLengthLines}</span>
          </div>
          <Slider
            value={[params.frameLengthLines]}
            onValueChange={(value) =>
              onParamsChange({ frameLengthLines: value[0] })
            }
            min={params.height}
            max={params.height * 2}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min</span>
            <span>1.5x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Line Length PCK */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Line Length PCK</Label>
            <span className="text-sm text-muted-foreground">{params.lineLengthPck}</span>
          </div>
          <Slider
            value={[params.lineLengthPck]}
            onValueChange={(value) =>
              onParamsChange({ lineLengthPck: value[0] })
            }
            min={params.width}
            max={params.width * 2}
            step={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min</span>
            <span>1.5x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Pixel Clock */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Pixel Clock</Label>
            <span className="text-sm text-muted-foreground">{params.pixelClockMHz} MHz</span>
          </div>
          <Slider
            value={[params.pixelClockMHz]}
            onValueChange={(value) =>
              onParamsChange({ pixelClockMHz: value[0] })
            }
            min={10}
            max={500}
            step={1}
          />
        </div>

        {/* Lanes and Shutter Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>MIPI Lanes</Label>
            <Input
              type="number"
              value={params.lanes}
              onChange={(e) =>
                onParamsChange({ lanes: parseInt(e.target.value) || 1 })
              }
              min={1}
              max={4}
            />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Switch
              id="shutter-type"
              checked={params.shutterType === 'rolling'}
              onCheckedChange={(checked) =>
                onParamsChange({
                  shutterType: checked ? 'rolling' : 'global',
                })
              }
            />
            <Label htmlFor="shutter-type" className="cursor-pointer">
              Rolling Shutter
            </Label>
          </div>
        </div>

        {/* Exposure Time */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Exposure Time</Label>
            <span className="text-sm text-muted-foreground">
              {((params.exposureTime || 0) * 1000).toFixed(2)} ms
            </span>
          </div>
          <Slider
            value={[(params.exposureTime || 0) * 1000]}
            onValueChange={(value) =>
              onParamsChange({ exposureTime: value[0] / 1000 })
            }
            min={0.1}
            max={100}
            step={0.1}
            disabled={!params.exposureTime}
          />
        </div>

        {/* Playback Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={onPlayPause} size="default">
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </>
              )}
            </Button>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Label>Playback Speed</Label>
                <span className="text-sm text-muted-foreground">{playbackSpeed}x</span>
              </div>
              <Slider
                value={[playbackSpeed]}
                onValueChange={(value) => onPlaybackSpeedChange(value[0])}
                min={0.1}
                max={5}
                step={0.1}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
