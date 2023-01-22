import React from "react";
import {
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { mapIconKey, mapIcons } from "../map/core/preloadImages";
import makeStyles from "@mui/styles/makeStyles";
import { useDispatch } from "react-redux";
import { devicesActions } from "../store";

const useStyles = makeStyles((theme) => ({
  icon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  cameraContainer: {
    marginRight: "1.1rem",
  },
  batteryText: {
    fontSize: "0.75rem",
    fontWeight: "normal",
    lineHeight: "0.875rem",
  },
  positive: {
    color: theme.palette.colors.positive,
  },
  medium: {
    color: theme.palette.colors.medium,
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  neutral: {
    color: theme.palette.colors.neutral,
  },
}));

const CameraRow = ({ item }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const handleRowClick = () => {
    dispatch(devicesActions.updateSelectedCamera(item));
  };
  return (
    <ListItemButton key={item.id} onClick={handleRowClick}>
      <ListItemAvatar>
        <Avatar>
          <img
            className={classes.icon}
            src={mapIcons[mapIconKey(item.category)]}
            alt=""
          />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={item.name}
        primaryTypographyProps={{ noWrap: true }}
        secondary={item.status}
        secondaryTypographyProps={{ noWrap: true }}
      />
    </ListItemButton>
  );
};

export default CameraRow;
