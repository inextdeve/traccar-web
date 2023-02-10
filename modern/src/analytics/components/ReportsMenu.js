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
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import ConstructionIcon from "@mui/icons-material/Construction";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

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
  const [washOpen, setWashOpen] = React.useState(true);
  const [sweepOpen, setSweepOpen] = React.useState(true);
  const [equipmentsOpen, setEquipmentsOpen] = React.useState(true);

  const handleClick = () => {
    setBinOpen((prev) => !prev);
  };
  const handleWashClick = () => {
    setWashOpen((prev) => !prev);
  };
  const handleSweepClick = () => {
    setSweepOpen((prev) => !prev);
  };
  const handleEQClick = () => {
    setEquipmentsOpen((prev) => !prev);
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
      </List>
      <List>
        <ListItemButton onClick={handleWashClick}>
          <ListItemText primary={t("washing")} />
          {washOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={washOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem
              title={t("binsByType")}
              link="/analytics/bin/washing/bytype"
              icon={<Delete />}
              selected={location.pathname === "/analytics/bin/washing/bytype"}
            />
            <MenuItem
              title={t("binsByRoutes")}
              link="/analytics/bin/washing/byroutes"
              icon={<RouteIcon />}
              selected={location.pathname === "/analytics/bin/washing/byroutes"}
            />
            <MenuItem
              title={t("binsByArea")}
              link="/analytics/bin/washing/byarea"
              icon={<AreaIcon />}
              selected={location.pathname === "/analytics/bin/washing/byarea"}
            />
            <MenuItem
              title={t("reportSummary")}
              link="/analytics/bin/washing/summary"
              icon={<StockIcon />}
              selected={location.pathname === "/analytics/bin/washing/summary"}
            />
          </List>
        </Collapse>
      </List>
      <List>
        <ListItemButton onClick={handleSweepClick}>
          <ListItemText primary={t("sweeping")} />
          {sweepOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={sweepOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem
              title={t("reportRoute")}
              link="/analytics/bin"
              icon={<RouteIcon />}
              selected={location.pathname === "/analytics/bin"}
            />
            <MenuItem
              title={t("plan")}
              link="/analytics/bin"
              icon={<AppRegistrationIcon />}
              selected={location.pathname === "/analytics/bin"}
            />
            <MenuItem
              title={t("equipment")}
              link="/analytics/bin"
              icon={<ConstructionIcon />}
              selected={location.pathname === "/analytics/bin"}
            />
          </List>
        </Collapse>
      </List>
      <List>
        <ListItemButton onClick={handleEQClick}>
          <ListItemText primary={t("equipments")} />
          {equipmentsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={equipmentsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem
              title={t("binsByType")}
              link="/analytics/equipments"
              icon={<ConstructionIcon />}
              selected={location.pathname === "/analytics/equipments"}
            />
            <MenuItem
              title={t("sharedShowDetails")}
              link="/analytics/equipments/details"
              icon={<MoreHorizIcon />}
              selected={location.pathname === "/analytics/equipments/details"}
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
