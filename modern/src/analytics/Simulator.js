import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  LinearProgress,
  Select,
  Typography,
} from "@mui/material";
import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import { useTranslation } from "../common/components/LocalizationProvider";
import GMap from "./components/GoogleMap";
import { URL } from "../common/util/constant";
import { gmapActions } from "../store";

const Simulator = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();

  const filterRef = useRef();
  const [filterEleHeight, setFilterEleHeight] = useState(71.99);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState({ id: "", name: "" });

  const loading = useSelector((state) => state.GMap.loading);

  const distanceNTime = useSelector((state) => state.GMap.distanceNTime);

  const binsVisibility = useSelector((state) => state.GMap.binsVisibility);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  useEffect(() => {
    dispatch(gmapActions.setLoading(true));
    fetch(`${URL}/api/bins/by/route`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        setRoutes(
          data.map((route) => ({ id: route.routeId, name: route.route }))
        );
      })
      .catch(() => {})
      .finally(() => {
        dispatch(gmapActions.setLoading(false));
      });
  }, []);

  const handleClick = async () => {
    try {
      dispatch(gmapActions.setLoading(true));
      const response = await fetch(
        `${URL}/api/bins?routeid=${selectedRoute.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      dispatch(gmapActions.setItems(data));
    } catch (error) {
    } finally {
      dispatch(gmapActions.setLoading(false));
    }
  };

  useEffect(() => {
    setFilterEleHeight(filterRef.current.clientHeight);
  }, [loading]);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={["analytics", "reportBin"]}>
      <div className={classes.container}>
        {loading ? <LinearProgress /> : <></>}
        <Box className={classes.containerMain}>
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              margin: "1rem 0",
              p: 2,
            }}
            ref={filterRef}
          >
            <FormControl sx={{ width: 1 / 4 }}>
              <InputLabel>{t("reportRoute")}</InputLabel>
              <Select
                label={t("reportRoute")}
                value={selectedRoute.id}
                onChange={(e) =>
                  setSelectedRoute(
                    () =>
                      routes.filter((route) => route.id === e.target.value)[0]
                  )
                }
              >
                {routes.map((route) => (
                  <MenuItem selected value={route.id} key={route.id}>
                    {route.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="secondary" onClick={handleClick}>
              {t("reportShow")}
            </Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 2 / 4,
                gap: 2,
                background: "#1d90fe",
                borderRadius: "1rem",
                color: "white",
                ml: 4,
              }}
            >
              <Typography>
                Duration:{" "}
                {distanceNTime.duration
                  ? `${distanceNTime.duration.toFixed()} min`
                  : "--"}
              </Typography>
              <Typography>
                Distance:{" "}
                {distanceNTime.distance
                  ? `${distanceNTime.distance.toFixed()} km`
                  : "--"}
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                sx={{ background: "#1d90fe", borderRadius: "1rem" }}
                onClick={() => dispatch(gmapActions.setBinVisiblity())}
              >
                {binsVisibility ? t("sharedHide") : t("reportShow")}
              </Button>
            </Box>
          </Box>
          <Box style={{ height: `calc(100vh - ${filterEleHeight + 30}px)` }}>
            <GMap />
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default Simulator;
