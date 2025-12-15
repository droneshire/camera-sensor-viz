/**
 * Parser for IMX258 mode CSV files
 */

import type { SensorMode } from './types';

interface ParsedMode {
  reg: string;
  mode1: string;
  mode2: string;
  width: number;
  height: number;
  lanes: number;
  frameLengthLines: number;
  lineLengthPck: number;
  fps: number;
  pixelClockMHz?: number;
}

/**
 * Parse CSV line and extract mode data
 * CSV structure from IMX258: reg, mode1, mode2, ..., width (col 6), height (col 7), lanes (col 8),
 * ..., fps (col 18), ..., frame_length_lines (col 50), line_length_pck (col 51)
 */
function parseModeLine(line: string, _headers: string[]): ParsedMode | null {
  const values = line.split(',').map((v) => v.trim());

  // Skip empty lines or header lines
  if (values.length < 10 || !values[0] || values[0].startsWith('reg') || values[0] === '') {
    return null;
  }

  try {
    const reg = values[0] || '';
    const mode1 = values[1] || '';
    const mode2 = values[2] || '';

    // RAW SIZE: width (col 6), height (col 7)
    const width = parseFloat(values[6]) || 0;
    const height = parseFloat(values[7]) || 0;

    // Lanes (col 8)
    const lanes = parseFloat(values[8]) || 2;

    // FPS (col 18) - "FPS" column
    const fps = parseFloat(values[18]) || 0;

    // frame_length_lines (col 50), line_length_pck (col 51)
    const frameLengthLines = parseFloat(values[50]) || 0;
    const lineLengthPck = parseFloat(values[51]) || 0;

    if (!reg || width === 0 || height === 0) {
      return null;
    }

    return {
      reg,
      mode1,
      mode2,
      width,
      height,
      lanes,
      frameLengthLines,
      lineLengthPck,
      fps,
    };
  } catch (error) {
    console.warn('Failed to parse line:', line, error);
    return null;
  }
}

/**
 * Parse IMX258 CSV file content
 */
export function parseImx258Csv(csvContent: string): SensorMode[] {
  const lines = csvContent.split('\n');
  const modes: SensorMode[] = [];

  // Find header line (contains "reg", "mode1", etc.)
  let headerLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('reg') && lines[i].includes('mode1')) {
      headerLineIndex = i;
      break;
    }
  }

  if (headerLineIndex === -1) {
    console.warn('Could not find header line in CSV');
    return modes;
  }

  const headers = lines[headerLineIndex].split(',').map((h) => h.trim());

  // Parse data lines
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const parsed = parseModeLine(lines[i], headers);
    if (parsed && parsed.width > 0 && parsed.height > 0) {
      // Calculate pixel clock from timing parameters
      // line_time = line_length_pck / pixel_clock
      // frame_time = frame_length_lines * line_time = 1 / fps
      // Therefore: pixel_clock = line_length_pck * fps * frame_length_lines
      const pixelClockMHz = parsed.lineLengthPck > 0 && parsed.fps > 0 && parsed.frameLengthLines > 0
        ? (parsed.lineLengthPck * parsed.fps * parsed.frameLengthLines) / 1e6
        : 129.6; // Default from CSV examples (OPPXCK system)

      const mode: SensorMode = {
        id: parsed.reg,
        description: `${parsed.mode1} - ${parsed.mode2}`,
        width: parsed.width,
        height: parsed.height,
        frameLengthLines: parsed.frameLengthLines || parsed.height * 1.1, // Estimate if missing
        lineLengthPck: parsed.lineLengthPck || parsed.width * 1.2, // Estimate if missing
        pixelClockMHz: pixelClockMHz || 129.6, // Default from CSV examples
        lanes: parsed.lanes,
        bitsPerPixel: 10, // Typical for RAW sensors
        shutterType: parsed.mode1.includes('HDR') ? 'global' : 'rolling',
      };

      modes.push(mode);
    }
  }

  return modes;
}

/**
 * Load and parse CSV file
 */
export async function loadImx258Modes(filePath: string): Promise<SensorMode[]> {
  try {
    const response = await fetch(filePath);
    const content = await response.text();
    return parseImx258Csv(content);
  } catch (error) {
    console.error('Failed to load CSV:', error);
    return [];
  }
}
