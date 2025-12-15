import React, { FC } from "react";
import { useMatch, useResolvedPath, Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { DashbardViewSpec } from "./views/viewsList";

export interface DrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  viewsList: DashbardViewSpec[];
}

interface ViewButtonProps extends Pick<DashbardViewSpec, "label" | "icon"> {
  to: string;
}

const ViewButton: FC<ViewButtonProps> = ({ to, label, icon: Icon }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        match
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
};

const Drawer: FC<DrawerProps> = ({ setOpen, viewsList, open }) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-end border-b p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close drawer</span>
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {viewsList.map(({ key, label, icon }) => (
            <ViewButton
              key={key}
              to={`/${key}`}
              label={label}
              icon={icon}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Drawer;
