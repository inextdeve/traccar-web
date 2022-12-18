import React from "react";
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import BarChartIcon from "@mui/icons-material/BarChart";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../../common/components/LocalizationProvider";
import { useAdministrator } from "../../common/util/permissions";

const MenuItem = ({ title, link, icon, selected }) => (
  <ListItemButton key={link} component={Link} to={link} selected={selected}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);

const ReportsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const admin = useAdministrator();

  return (
    <>
      <List>
        <MenuItem
          title={t("advancedReportBinTitle")}
          link="/advancedreports/bin"
          icon={<DeleteIcon />}
          selected={location.pathname === "/advancedreports/bin"}
        />
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
