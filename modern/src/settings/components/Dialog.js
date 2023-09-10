import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { Resizable } from "re-resizable";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { dbManagementActions } from "../../store";

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    width: auto;
    max-width: none;
  }
`;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EditDialog({
  title = "Edit",
  children,
  onSave,
  open,
  onClose,
}) {
  const dispatch = useDispatch();

  const [lastHeight, setLastHeight] = React.useState(0);

  return (
    <div style={{ resize: "both" }}>
      <StyledDialog
        fullWidth
        open={open}
        onClose={() => {
          dispatch(dbManagementActions.setDialogResizableHeight(0));
          onClose();
        }}
        TransitionComponent={Transition}
        sx={{ maxWidth: "100%" }}
      >
        <Resizable
          onResize={(event, direction, target, dimensions) => {
            if (direction !== "left" && direction !== "right") {
              dispatch(
                dbManagementActions.setDialogResizableHeight(
                  dimensions.height + lastHeight
                )
              );
            }
          }}
          onResizeStop={(event, direction, target, dimensions) => {
            // Save the last height value because it's reseted every time so we need to save it
            if (direction !== "left" && direction !== "right") {
              setLastHeight((prev) => prev + dimensions.height);
            }
          }}
        >
          <AppBar sx={{ position: "relative", background: "#1876d2" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={onClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {title}
              </Typography>
              <Button autoFocus color="inherit" onClick={onSave}>
                save
              </Button>
            </Toolbar>
          </AppBar>
          {children}
        </Resizable>
      </StyledDialog>
    </div>
  );
}
