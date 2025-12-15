import React, { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { Box, CircularProgress, Tab, Tabs } from "@mui/material";

import { DashboardViewContext } from "components/dashboard/DashboardPage";
import preferencesTabsList from "./preferencesTabs/preferencesTabsList";
import { TabPanel } from "components/utils/tabs";

const PreferencesView: FC = () => {
  const {
    userConfigSnapshot,
  } = useOutletContext<DashboardViewContext>();
  const preferences = userConfigSnapshot?.get("preferences");
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(
    preferencesTabsList[0].key
  );

  const selectTab = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTabIndex(newValue);
  };

  if (!preferences) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ width: "100%" }}>
      <>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedTabIndex} onChange={selectTab} centered>
            {preferencesTabsList.map(({ key, label }) => {
              return <Tab label={label} value={key} key={key} />;
            })}
          </Tabs>
        </Box>
        {preferencesTabsList.map(({ key, component: C }) => {
          return (
            <TabPanel selectedTabIndex={selectedTabIndex} index={key} key={key}>
              <C userConfigSnapshot={userConfigSnapshot!} />
            </TabPanel>
          );
        })}
      </>
    </Box>
  );
};

export default PreferencesView;
