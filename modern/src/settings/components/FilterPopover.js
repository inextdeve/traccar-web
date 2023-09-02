import { useEffect, useState } from "react";
import {
  IconButton,
  Popover,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../../common/components/LocalizationProvider";
import { makeStyles } from "@mui/styles";
import { dbManagementActions } from "../../store/dbManagement";

const useStyle = makeStyles(() => ({
  Popover: {
    "&>div.MuiPopover-paper": {
      left: "1729px",
      right: "10px",
    },
  },
}));

const initFilter = {
  centerid: "center-all",
  bintypeid: "type-all",
  routid: "route-all",
};

export default function BasicPopover() {
  const t = useTranslation();

  const dispatch = useDispatch();

  const classes = useStyle();

  const routes = useSelector((state) => state.dbManagement.routes);

  const centers = useSelector((state) => state.dbManagement.centers);

  const types = useSelector((state) => state.dbManagement.types);

  const items = useSelector((state) => state.dbManagement.items);

  const [table, setTable] = useState({ routes: [], centers: [], types: [] });

  const [anchorEl, setAnchorEl] = useState(null);

  const [activeFilter, setActiveFilter] = useState(initFilter);

  useEffect(() => {
    setTable({ routes, centers, types });
  }, [routes, centers, types]);

  useEffect(() => {
    const filter = items
      .filter((item) => {
        return activeFilter.routid === "all-route"
          ? true
          : item.routid === activeFilter.routid;
      })
      .filter((item) => {
        return activeFilter.centerid === "all-center"
          ? true
          : item.centerid === activeFilter.centerid;
      })
      .filter((item) => {
        return activeFilter.bintypeid === "all-type"
          ? true
          : item.bintypeid === activeFilter.bintypeid;
      });

    dispatch(dbManagementActions.setFiltred(filter));
  }, [activeFilter.bintypeid, activeFilter.centerid, activeFilter.routid]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInputChange = (event) => {
    setActiveFilter((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <IconButton
        aria-describedby={id}
        variant="contained"
        onClick={handleClick}
      >
        <FilterListIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        className={classes.Popover}
      >
        <Box
          sx={{
            p: 4,
            mt: 2,
            display: "grid",
            gap: 3,
            gridTemplateColumns: "1fr",
          }}
        >
          <FormControl>
            <InputLabel>{t("sharedType")}</InputLabel>
            <Select
              label={t("sharedType")}
              value={activeFilter.bintypeid}
              onChange={handleInputChange}
              name="bintypeid"
            >
              <MenuItem
                selected={"type-all" === activeFilter.bintypeid}
                value={"type-all"}
              >
                All
              </MenuItem>
              {table.types.map((type) => {
                return (
                  <MenuItem
                    key={type.id}
                    selected={type.id === activeFilter.bintypeid}
                    value={type.id}
                  >
                    {type.bintype}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>{t("center")}</InputLabel>
            <Select
              label={t("center")}
              value={activeFilter.centerid}
              onChange={handleInputChange}
              name="centerid"
            >
              <MenuItem
                selected={"center-all" === activeFilter.centerid}
                value={"center-all"}
              >
                All
              </MenuItem>
              {table.centers.map((center) => {
                return (
                  <MenuItem
                    key={center.id}
                    selected={center.id === activeFilter.centerid}
                    value={center.id}
                  >
                    {center.center_name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>{t("reportRoute")}</InputLabel>
            <Select
              label={t("reportRoute")}
              value={activeFilter.routid}
              onChange={handleInputChange}
              name="routid"
            >
              <MenuItem
                selected={"route-all" === activeFilter.routid}
                value={"route-all"}
              >
                All
              </MenuItem>
              {table.routes.map((route) => {
                return (
                  <MenuItem
                    key={route.id}
                    selected={route.id === activeFilter.routid}
                    value={route.id}
                  >
                    {route.rout_code}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Popover>
    </div>
  );
}
