import React, { FC } from "react";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

export interface AppBarProps {
  drawerIsOpen: boolean;
  openDrawer: (drawerIsOpen: boolean) => void;
}

const AppBar: FC<AppBarProps> = ({
  openDrawer,
  drawerIsOpen,
}) => {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4"
          onClick={() => openDrawer(true)}
          style={{ display: drawerIsOpen ? "none" : "inline-flex" }}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <img
          src="/logo.png"
          alt="Logo"
          className="mr-3 h-8 w-8"
        />
        <h1 className="text-xl font-semibold">
          Camera Sensor Visualization
        </h1>
      </div>
    </header>
  );
};

export default AppBar;
