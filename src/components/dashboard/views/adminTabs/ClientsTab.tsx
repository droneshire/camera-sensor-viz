import React, { FC, useState } from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  QuerySnapshot,
  DocumentSnapshot,
  CollectionReference,
} from "firebase/firestore";
import {
  CircularProgress,
  Box,
  Typography,
  Chip,
  Fab,
  TableContainer,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Button,
  Menu,
  Tooltip,
  ListItemIcon,
  MenuItem,
  ListItemText,
  Paper,
  Alert,
  Snackbar,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import { DEFAULT_USER_CONFIG, ClientAction, ClientConfig } from "types/user";
import { HealthMonitorConfig } from "types/health_monitor";
import { isValidEmail } from "utils/validators";

interface ClientActionOption {
  doAction: () => void;
  ActionIcon: React.ElementType;
  title: string;
}

interface ClientSpec {
  userId: string;
}

type ClientProps = ClientSpec & {
  actionButtons: ClientActionOption[];
};
const Client: FC<ClientProps> = ({ userId, actionButtons }) => {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionMenuOpen = Boolean(actionMenuAnchorEl);

  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  return (
    <TableRow hover>
      <TableCell>
        <Tooltip title={`Client ${userId}`}>
          <Chip icon={<PersonIcon />} label={userId} variant="outlined" />
        </Tooltip>
      </TableCell>
      <TableCell sx={{ textAlign: "right" }}>
        <Button onClick={handleActionMenuClick}>Actions</Button>
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={actionMenuOpen}
          onClose={handleActionMenuClose}
        >
          {actionButtons.map(({ doAction, ActionIcon, title }, index) => (
            <MenuItem key={index} onClick={doAction}>
              {ActionIcon && (
                <ListItemIcon>
                  <ActionIcon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText>{title}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </TableCell>
    </TableRow>
  );
};

interface ClientGroupActionButton {
  doAction: (userId: string) => void;
  ActionIcon: React.ElementType;
  title: (userId: string) => string;
}

const ClientActivityGroup: FC<{
  users: ClientSpec[];
  actionButtons: ClientGroupActionButton[];
}> = ({ users, actionButtons }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableBody>
          {users.map((props) => (
            <Client
              key={props.userId}
              {...props}
              actionButtons={actionButtons.map(
                ({ doAction, title, ActionIcon }) => ({
                  doAction: () => doAction(props.userId),
                  title: title(props.userId),
                  ActionIcon: ActionIcon,
                })
              )}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  createClient: (user: ClientSpec) => Promise<void> | void;
  existinguserIds: ClientSpec[];
}
const NewClientModal: FC<ClientModalProps> = ({
  open,
  onClose,
  createClient,
  existinguserIds,
}) => {
  const modalRef = React.useRef<HTMLElement>(null);
  const [userId, setuserId] = React.useState("");
  const {
    runAction: doCreateClient,
    running: creatingClient,
    error,
    clearError,
  } = useAsyncAction(createClient);

  const validuserId =
    userId &&
    !existinguserIds.some((userSpec) => userId === userSpec.userId) &&
    isValidEmail(userId);
  const disabled = creatingClient || !validuserId;

  const reset = React.useCallback(() => {
    setuserId("");
  }, [setuserId]);

  const doSubmit = React.useCallback(async () => {
    if (disabled) {
      return;
    }
    const success = await doCreateClient({
      userId,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [onClose, reset, doCreateClient, userId, disabled]);

  const keyHander = React.useCallback(
    ({ key }: KeyboardEvent) => {
      switch (key) {
        case "Enter":
          doSubmit();
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    },
    [doSubmit, onClose]
  );
  useKeyPress(["Enter", "Escape"], keyHander);

  const modalBoxStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: 1,
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  } as const;

  if (!open) {
    return null;
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          ref={modalRef}
          sx={modalBoxStyle}
        >
          <Typography variant="h5" component="h2" textAlign="center">
            New Client
          </Typography>
          <TextField
            label="Client Email"
            variant="standard"
            value={userId}
            onChange={(e) => setuserId(e.target.value.toLowerCase())}
            error={!validuserId}
            inputProps={{ inputMode: "email" }}
          />
          <Box textAlign="center">
            {creatingClient ? (
              <CircularProgress />
            ) : (
              <Tooltip title="Add user">
                <span>
                  <Fab
                    color="primary"
                    variant="extended"
                    disabled={disabled}
                    onClick={doSubmit}
                  >
                    <AddIcon />
                    Add
                  </Fab>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Modal>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to create user: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
};

export const ClientsTab: FC<{
  clientsSnapshot: QuerySnapshot<ClientConfig>;
  clientsConfigRef: CollectionReference<ClientConfig>;
  healthMonitorSnapshot: DocumentSnapshot<HealthMonitorConfig>;
}> = ({ clientsSnapshot, clientsConfigRef }) => {
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const memoizedClients = React.useMemo(() => {
    return clientsSnapshot.docs.map((doc) => ({
      userId: doc.id,
    }));
  }, [clientsSnapshot]);

  const handleCreateClient = async (client: ClientSpec): Promise<void> => {
    try {
      await setDoc(doc(clientsConfigRef, client.userId), {
        ...DEFAULT_USER_CONFIG,
      });
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  };

  const handleDeleteClient = async (userId: string) => {
    try {
      await deleteDoc(doc(clientsConfigRef, userId));
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Add new client">
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setShowNewClientModal(true)}
          >
            <AddIcon />
            Add Client
          </Fab>
        </Tooltip>
      </Box>

      <ClientActivityGroup
        users={memoizedClients}
        actionButtons={[
          {
            doAction: handleDeleteClient,
            ActionIcon: DeleteIcon,
            title: (userId) => `Delete ${userId}`,
          },
        ]}
      />

      <NewClientModal
        open={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        createClient={handleCreateClient}
        existinguserIds={memoizedClients}
      />
    </Box>
  );
};

export default ClientsTab;
