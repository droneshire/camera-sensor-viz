import { FC } from "react";

const Copyright: FC<{ className?: string }> = ({ className }) => {
  return (
    <p className={`text-sm text-muted-foreground text-center ${className || ''}`}>
      {"Copyright © Engineered Cash Flow LLC "}
      {new Date().getFullYear()}
      {"."}
    </p>
  );
};

export default Copyright;
