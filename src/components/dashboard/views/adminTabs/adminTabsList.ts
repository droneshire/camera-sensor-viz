import ClientsTab from "./ClientsTab";
import BackendTab from "./BackendTab";

const adminTabsList = [
  {
    key: "clients",
    label: "Clients",
    component: ClientsTab,
  },
  {
    key: "health_monitor",
    label: "Backend",
    component: BackendTab,
  },
];

export default adminTabsList;
