import React from "react";
import { Camera } from "lucide-react";
import { LucideIcon } from "lucide-react";

import { SensorVizPage } from "../../sensor-viz/SensorVizPage";

export interface DashbardViewSpec {
  key: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

const viewsList: DashbardViewSpec[] = [
  {
    key: 'sensor-viz',
    label: 'Sensor Visualization',
    icon: Camera,
    component: SensorVizPage,
  },
];

export const useViewsList = () => {
  return viewsList;
};
