import React, { FC } from "react";
import { Alert } from "@mui/material";

export const ErrorFallback: FC<{ error: Error }> = ({ error }) => {
  return (
    <Alert severity="error">
      <p>Something went wrong, please contact support:</p>
      <pre>{error.message}</pre>
    </Alert>
  );
};
