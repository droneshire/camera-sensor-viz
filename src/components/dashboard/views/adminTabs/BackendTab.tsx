import { FC, useState, useEffect } from "react";

import { Typography, Box, Chip, Button } from "@mui/material";

import {
  QuerySnapshot,
  DocumentSnapshot,
  CollectionReference,
  Timestamp,
} from "firebase/firestore";

import { updateDoc } from "firebase/firestore";
import { ClientConfig } from "types/user";
import { HealthMonitorConfig } from "types/health_monitor";

const timeBetweenHeartbeatSeconds: number = 60 * 70;

export const BackendTab: FC<{
  clientsSnapshot: QuerySnapshot<ClientConfig>;
  clientsConfigRef: CollectionReference<ClientConfig>;
  healthMonitorSnapshot: DocumentSnapshot<HealthMonitorConfig>;
}> = ({ healthMonitorSnapshot }) => {
  const heartbeat = healthMonitorSnapshot?.get("heartbeat");
  const [heartbeatString, setHeartbeatString] = useState<string>("Offline");
  const [heartbeatColor, setHeartbeatColor] = useState<"blue" | "grey">("grey");
  const [heartbeatSeconds, setHeartbeatSeconds] = useState<number>(
    heartbeat?.seconds ?? timeBetweenHeartbeatSeconds + 1
  );
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (heartbeat) {
      const newHeartbeat = heartbeat.seconds;
      const now = Math.floor(Date.now() / 1000);
      if (now - heartbeatSeconds > timeBetweenHeartbeatSeconds) {
        setHeartbeatString("Offline");
        setHeartbeatColor("grey");
      } else {
        setHeartbeatString("Online");
        setHeartbeatColor("blue");
      }
      setHeartbeatSeconds(newHeartbeat);
    }
  }, [heartbeat, heartbeatSeconds]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Backend Monitor
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Chip
          sx={{
            width: "20%",
            alignSelf: "center",
            marginBottom: 4,
            color: "white",
            backgroundColor: heartbeatColor,
          }}
          label={heartbeatString}
        />
        <Button
          variant="contained"
          disabled={buttonDisabled}
          onClick={() => {
            console.log("Restarting Backend");
            updateDoc(
              healthMonitorSnapshot.ref,
              "heartbeat",
              Timestamp.fromDate(new Date(2022, 1, 1))
            );
            updateDoc(healthMonitorSnapshot.ref, "reset", true);
            setButtonDisabled(true);
            setTimeout(() => {
              setButtonDisabled(false);
            }, 10000);
          }}
          sx={{ width: "20%", alignSelf: "center" }}
        >
          Restart Backend
        </Button>
      </Box>
    </>
  );
};

export default BackendTab;
