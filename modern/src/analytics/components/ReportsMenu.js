import React from "react";
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import Delete from "@mui/icons-material/Delete";

import BarChartIcon from "@mui/icons-material/BarChart";
import { Link, useLocation } from "react-router-dom";
import RouteIcon from "../../common/icons/RouteIcon";
import { useTranslation } from "../../common/components/LocalizationProvider";
import { useAdministrator } from "../../common/util/permissions";
import AreaIcon from "../../common/icons/AreaIcon";
import StockIcon from "../../common/icons/StockIcon";

const MenuItem = ({ title, link, icon, selected }) => (
  <ListItemButton
    key={link}
    component={Link}
    to={link}
    selected={selected}
    sx={{ pl: 4 }}
  >
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);

const ReportsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const admin = useAdministrator();

  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <List>
        <ListItemButton onClick={handleClick}>
          <ListItemText primary={t("bins")} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem
              title={t("binsByType")}
              link="/analytics/bin"
              icon={<Delete />}
              selected={location.pathname === "/analytics/bin"}
            />
            <MenuItem
              title={t("binsByRoutes")}
              link="/analytics/bin/byroutes"
              icon={<RouteIcon />}
              selected={location.pathname === "/analytics/binroutes"}
            />
            <MenuItem
              title={t("binsByArea")}
              link="/analytics/binarea"
              icon={<AreaIcon />}
              selected={location.pathname === "/analytics/binarea"}
            />
            <MenuItem
              title={t("reportSummary")}
              link="/analytics/binsummary"
              icon={<StockIcon />}
              selected={location.pathname === "/analytics/binsummary"}
            />
          </List>
        </Collapse>
      </List>
      {admin && (
        <>
          <Divider />
          <List>
            <MenuItem
              title={t("statisticsTitle")}
              link="/reports/statistics"
              icon={<BarChartIcon />}
              selected={location.pathname === "/reports/statistics"}
            />
          </List>
        </>
      )}
    </>
  );
};

export default ReportsMenu;
