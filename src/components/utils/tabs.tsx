import React from "react";
import { Paper } from "@mui/material";
import { withErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "components/utils/errors";

export interface TabPanelProps {
  children?: React.ReactNode;
  selectedTabIndex: string;
  index: string;
}

const TabPanelComponent: React.FC<TabPanelProps> = ({ children, selectedTabIndex, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={selectedTabIndex !== index} {...other}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          m: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Paper>
    </div>
  );
};

export const TabPanel = withErrorBoundary(TabPanelComponent, {
  FallbackComponent: ErrorFallback,
});
