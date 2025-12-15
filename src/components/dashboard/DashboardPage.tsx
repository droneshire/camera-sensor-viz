import React, { FC, useState } from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import Copyright from "components/Copyright";
import AppBar from "./AppBar";
import Drawer from "./Drawer";
import { useViewsList } from "./views/viewsList";
import { ErrorFallback } from "components/utils/errors";

const DashboardPage: FC = () => {
  const [open, setOpen] = useState(false);
  const viewsList = useViewsList();

  return (
    <div className="flex h-screen bg-background">
      <AppBar
        drawerIsOpen={open}
        openDrawer={() => setOpen(true)}
      />
      <Drawer
        open={open}
        viewsList={viewsList}
        setOpen={setOpen}
      />
      <main className="flex-1 overflow-auto bg-background">
        <div className="h-16" /> {/* Spacer for fixed AppBar */}
        <div className="container mx-auto max-w-7xl p-6">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
          <Copyright className="pt-8" />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
