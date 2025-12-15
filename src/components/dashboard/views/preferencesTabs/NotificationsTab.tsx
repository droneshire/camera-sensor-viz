import { FC } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { Typography, FormGroup, FormControlLabel } from "@mui/material";

import { ClientConfig } from "types/user";
import {
  EmailInput,
  FirestoreBackedSwitch,
  FirestoreBackedTextField,
} from "components/utils/forms";
import { isValidEmail } from "utils/validators";
const NotificationsTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const updatingAnything = !!userConfigSnapshot?.metadata.fromCache;
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Email
      </Typography>
      <FormGroup>
        <FirestoreBackedTextField
          label="Email address"
          disabled={updatingAnything}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.email.email"
          variant="standard"
          isValid={(email) => !email || isValidEmail(email)}
          helperText={(_, validEmail) =>
            validEmail ? "" : "Invalid email address"
          }
          sx={{ maxWidth: 300 }}
          InputProps={{ inputComponent: EmailInput as any }}
        />
        <FormControlLabel
          control={
            <FirestoreBackedSwitch
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.notifications.email.updatesEnabled"
              checkBox
            />
          }
          label="Email updates"
        />
      </FormGroup>
    </>
  );
};

export default NotificationsTab;
