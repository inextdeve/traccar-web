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
import ReportIcon from "@mui/icons-material/Report";

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

  const [binOpen, setBinOpen] = React.useState(true);
  const [washOpen, setWashOpen] = React.useState(false);

  const handleClick = () => {
    setBinOpen(!binOpen);
  };
  const handleWashClick = () => {
    setWashOpen(!washOpen);
  };

  return (
    <>
      <List>
        <ListItemButton onClick={handleClick}>
          <ListItemText primary={t("bins")} />
          {binOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={binOpen} timeout="auto" unmountOnExit>
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
              selected={location.pathname === "/analytics/bin/byroutes"}
            />
            <MenuItem
              title={t("binsByArea")}
              link="/analytics/bin/byarea"
              icon={<AreaIcon />}
              selected={location.pathname === "/analytics/bin/byarea"}
            />
            <MenuItem
              title={t("binsReports")}
              link="/analytics/bin/binsreports"
              icon={<ReportIcon />}
              selected={location.pathname === "/analytics/bin/binsreports"}
            />
            <MenuItem
              title={t("reportSummary")}
              link="/analytics/bin/summary"
              icon={<StockIcon />}
              selected={location.pathname === "/analytics/bin/summary"}
            />
          </List>
        </Collapse>
        <ListItemButton onClick={handleWashClick}>
          <ListItemText primary={t("washing")} />
          {washOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={washOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem
              title={t("washing")}
              link="/analytics/bin/washing/bytype"
              icon={<Delete />}
              selected={location.pathname === "/analytics/bin/washing/bytype"}
            />
          </List>
        </Collapse>
      </List>
      <List></List>
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
