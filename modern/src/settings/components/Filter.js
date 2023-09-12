import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconButton,
  Popover,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  TextField,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "../../common/components/LocalizationProvider";
import { dbManagementActions } from "../../store/dbManagement";
import { filterDatesByDaysAgo } from "../../common/util/filters";

const useStyle = makeStyles(() => ({
  Popover: {
    "&>div.MuiPopover-paper": {
      left: "1729px",
      right: "10px",
      width: "180px",
    },
  },
}));

const initFilter = {
  centerid: "all-center",
  bintypeid: "all-type",
  routid: "all-route",
};

export default function BasicPopover({ searchLabel, labelName }) {
  const t = useTranslation();

  const dispatch = useDispatch();

  const classes = useStyle();

  const routes = useSelector((state) => state.dbManagement.routes);

  const centers = useSelector((state) => state.dbManagement.centers);

  const types = useSelector((state) => state.dbManagement.types);

  const items = useSelector((state) => state.dbManagement.items);

  const filteredItems = useSelector((state) => state.dbManagement.filtered);

  // Menu Items just for listing this filter items in select box

  const [menuItems, setMenuItems] = useState({
    routes: [],
    centers: [],
    types: [],
  });

  const [anchorEl, setAnchorEl] = useState(null);

  const [activeFilter, setActiveFilter] = useState(initFilter);

  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setMenuItems({ routes, centers, types });
  }, [routes, centers, types]);

  // Handle popover filter

  const filter = () =>
    items
      .filter((item) =>
        activeFilter.routid === "all-route"
          ? true
          : item.routid === activeFilter.routid
      )
      .filter((item) =>
        activeFilter.centerid === "all-center"
          ? true
          : item.centerid === activeFilter.centerid
      )
      .filter((item) =>
        activeFilter.bintypeid === "all-type"
          ? true
          : item.bintypeid === activeFilter.bintypeid
      );

  // Handle Search Box

  const search = (value) => {
    if (typeof value !== "string") return;
    const filtered = filter().filter((item) => {
      if (!value) return true;
      return item.description?.toLowerCase().indexOf(value?.toLowerCase()) > -1;
    });
    dispatch(dbManagementActions.setFiltered(filtered));
    return filtered;
  };

  useEffect(() => {
    dispatch(dbManagementActions.setFiltered(filter()));
  }, [
    activeFilter.bintypeid,
    activeFilter.centerid,
    activeFilter.routid,
    items,
  ]);

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

  const [openSearch, setOpenSearch] = useState(false);

  const handleDateFilter = (e) => {
    // Call the search method for preserve the last filtered items
    const previousFilter = search(searchValue);

    const filtered = filterDatesByDaysAgo(previousFilter, e.target.value);

    dispatch(dbManagementActions.setFiltered(filtered));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
      <Box>
        <Autocomplete
          size="small"
          open={openSearch}
          onInputChange={(_, value) => {
            if (value.length === 0) {
              setOpenSearch(false);
            } else {
              setOpenSearch(true);
            }
            setSearchValue(value);
            search(value);
          }}
          onClose={() => setOpenSearch(false)}
          disablePortal
          id="combo-box-demo"
          options={filter().map((item) => ({ label: item[searchLabel] }))}
          sx={{ width: 200, maxHeight: "20px" }}
          renderInput={(params) => (
            <TextField size="small" {...params} label={labelName} />
          )}
          onChange={(_, value) => {
            setSearchValue(value);
            search(value);
          }}
          multiple={false}
        />
      </Box>
      <Box>
        <TextField
          type="number"
          id="outlined-basic"
          label="Days"
          variant="outlined"
          sx={{ width: "120px" }}
          InputProps={{ inputProps: { min: 0 } }}
          onChange={handleDateFilter}
        />
      </Box>

      <Box>
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
                  selected={activeFilter.bintypeid === "all-type"}
                  value="all-type"
                >
                  All
                </MenuItem>
                {menuItems.types.map((type) => (
                  <MenuItem
                    key={type.id}
                    selected={type.id === activeFilter.bintypeid}
                    value={type.id}
                  >
                    {type.bintype}
                  </MenuItem>
                ))}
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
                  selected={activeFilter.centerid === "all-center"}
                  value="all-center"
                >
                  All
                </MenuItem>
                {menuItems.centers.map((center) => (
                  <MenuItem
                    key={center.id}
                    selected={center.id === activeFilter.centerid}
                    value={center.id}
                  >
                    {center.center_name}
                  </MenuItem>
                ))}
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
                  selected={activeFilter.routid === "all-route"}
                  value="all-route"
                >
                  All
                </MenuItem>
                {menuItems.routes.map((route) => (
                  <MenuItem
                    key={route.id}
                    selected={route.id === activeFilter.routid}
                    value={route.id}
                  >
                    {route.rout_code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Popover>
      </Box>
    </Box>
  );
}
