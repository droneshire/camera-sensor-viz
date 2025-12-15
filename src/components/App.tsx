import React from "react";
import {
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import DashboardPage from "components/dashboard/DashboardPage";
import { useViewsList } from "./dashboard/views/viewsList";

function App() {
  const viewsList = useViewsList();

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />}>
        <Route
          index
          element={<Navigate to={`/${viewsList[0].key}`} replace />}
        />
        {viewsList.map((view) => (
          <Route
            key={view.key}
            path={`${view.key}`}
            element={<view.component />}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
