import NotificationsTab from "./NotificationsTab";
import PreferencesTab from "./PreferencesTab";

const preferencesTabsList = [
  {
    key: "notifications",
    label: "Notifications",
    component: NotificationsTab,
  },
  {
    key: "preferences",
    label: "Preferences",
    component: PreferencesTab,
  },
];

export default preferencesTabsList;
