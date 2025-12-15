import React, { useEffect, useState } from 'react';
import { create } from 'jsondiffpatch';
import { Box, Typography, Paper, List, ListItem } from '@mui/material';

interface JsonDiffProps {
  oldJson: any;
  newJson: any;
  onDiff?: (diff: any) => void;
}

const JsonDiff: React.FC<JsonDiffProps> = ({ oldJson, newJson, onDiff }) => {
  const [diff, setDiff] = useState<any>(null);

  useEffect(() => {
    const jsondiffpatch = create({
      objectHash: (obj: any) => obj.id || JSON.stringify(obj),
    });

    const delta = jsondiffpatch.diff(oldJson, newJson);
    setDiff(delta);
  }, [oldJson, newJson]);

  // Explicitly annotate the return type as React.ReactNode[] to satisfy TypeScript
  const renderDiff = (delta: any, path: string[] = []): React.ReactNode[] => {
    onDiff?.(delta);

    if (!delta) return [];

    return Object.keys(delta).map((key) => {
      const value = delta[key];
      const currentPath = [...path, key];

      if (Array.isArray(value)) {
        if (value.length === 1) {
          // This is an addition (+)
          return (
            <ListItem key={currentPath.join('.')} sx={{ color: 'green' }}>
              <Typography
                sx={{
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                + {currentPath.join('.')}: {JSON.stringify(value[0])}
              </Typography>
            </ListItem>
          );
        } else if (value.length === 2) {
          // This is a modification (showing both - and +)
          return (
            <Box sx={{ mb: 2 }} key={currentPath.join('.')}>
              <ListItem sx={{ color: 'red' }}>
                <Typography
                  sx={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  - {currentPath.join('.')}: {JSON.stringify(value[0])}
                </Typography>
              </ListItem>
              <ListItem sx={{ color: 'green' }}>
                <Typography
                  sx={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  + {currentPath.join('.')}: {JSON.stringify(value[1])}
                </Typography>
              </ListItem>
              <Typography>-------</Typography>
            </Box>
          );
        } else if (value.length === 3 && value[2] === 0) {
          // This is a deletion (-)
          return (
            <ListItem key={currentPath.join('.')} sx={{ color: 'red' }}>
              <Typography
                sx={{
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                - {currentPath.join('.')}: {JSON.stringify(value[0])}
              </Typography>
            </ListItem>
          );
        }
      } else if (typeof value === 'object') {
        return renderDiff(value, currentPath); // Recursively handle nested objects
      }
      return null;
    });
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          padding: 2,
          maxHeight: 400,
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        <List>
          {diff ? (
            renderDiff(diff)
          ) : (
            <Typography>No changes detected.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default JsonDiff;
