import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  IconButton,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import {
  formatDistance,
  formatHours,
  formatSpeed,
  formatVolume,
  formatTime,
} from "../common/util/formatter";
import ReportFilter from "./components/ReportFilter";
import {
  useAttributePreference,
  usePreference,
} from "../common/util/preferences";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import usePersistedState from "../common/util/usePersistedState";
import ColumnSelect from "./components/ColumnSelect";
import { useCatch } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import { speedFromKnots } from "../common/util/converter";
import MapPositions from "../map/MapPositions";
import MapView from "../map/core/MapView";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";

const columnsArray = [
  ["deviceTime", "reportDeviceTime"],
  ["speed", "reportSpeed"],
  ["engineHours", "reportEngineHours"],
];
const columnsMap = new Map(columnsArray);

const SummaryReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const speedUnit = useAttributePreference("speedUnit");
  const volumeUnit = useAttributePreference("volumeUnit");
  const hours12 = usePreference("twelveHourFormat");

  const [columns, setColumns] = usePersistedState("summaryColumns", [
    "deviceTime",
    "speed",
    "engineHours",
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [speed, setSpeed] = useState({
    symbol: "gt",
    value: 0,
  });

  const filterItems = (data) => {
    console.log(data);
    switch (speed.symbol) {
      case "gt":
        setItems(
          data.filter((item) => {
            return (
              speedFromKnots(item.speed, speedUnit).toFixed(2) >= speed.value
            );
          })
        );
        break;
      case "lt":
        setItems(
          data.filter(
            (item) =>
              speedFromKnots(item.speed, speedUnit).toFixed(2) <= speed.value
          )
        );
        break;
      case "eq":
        setItems(
          data.filter(
            (item) =>
              speedFromKnots(item.speed, speedUnit).toFixed(2) === speed.value
          )
        );
        break;
      default:
        setItems(data);
        break;
    }
  };

  const handleSubmit = useCatch(
    async ({ deviceIds, groupIds, from, to, type }) => {
      const query = new URLSearchParams({ from, to });
      deviceIds.forEach((deviceId) => query.append("deviceId", deviceId));
      groupIds.forEach((groupId) => query.append("groupId", groupId));
      if (type === "export") {
        window.location.assign(
          `/api/reports/positions/xlsx?${query.toString()}`
        );
      } else if (type === "mail") {
        const response = await fetch(
          `/api/reports/positions/mail?${query.toString()}`
        );
        if (!response.ok) {
          throw Error(await response.text());
        }
      } else {
        setLoading(true);
        try {
          const response = await fetch(`/api/positions?${query.toString()}`, {
            headers: { Accept: "application/json" },
          });
          if (response.ok) {
            filterItems(await response.json());
          } else {
            throw Error(await response.text());
          }
        } finally {
          setLoading(false);
        }
      }
    }
  );

  const formatValue = (item, key) => {
    switch (key) {
      case "deviceId":
        return devices[item[key]].name;
      case "deviceTime":
        return formatTime(item[key], "minutes", hours12);
      case "speed":
      case "maxSpeed":
        return formatSpeed(item[key], speedUnit, t);
      case "engineHours":
        return formatHours(item[key]);
      case "spentFuel":
        return formatVolume(item[key], volumeUnit, t);
      default:
        return item[key];
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={["reportTitle", "speed"]}>
      {selectedItem && (
        <div className={classes.containerMap}>
          <MapView>
            <MapGeofence />
            <MapPositions
              positions={[
                {
                  deviceId: selectedItem.deviceId,
                  fixTime: selectedItem.startTime,
                  latitude: selectedItem.latitude,
                  longitude: selectedItem.longitude,
                },
              ]}
              titleField="fixTime"
            />
          </MapView>
          <MapCamera
            latitude={selectedItem.latitude}
            longitude={selectedItem.longitude}
          />
        </div>
      )}
      <div className={classes.header}>
        <ReportFilter handleSubmit={handleSubmit} includeGroups>
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t("speed")}</InputLabel>
              <Select
                label={t("speed")}
                value={speed.symbol}
                onChange={(e) =>
                  setSpeed((prev) => ({ ...prev, symbol: e.target.value }))
                }
              >
                <MenuItem value="gt">{t("gt")}</MenuItem>
                <MenuItem value="lt">{t("lt")}</MenuItem>
                <MenuItem value="eq">{t("eq")}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={classes.filterItem}>
            <FormControl>
              <TextField
                label="Value"
                type="number"
                variant="outlined"
                value={speed.value}
                onChange={(e) =>
                  setSpeed((prev) => ({
                    ...prev,
                    value: Number(e.target.value),
                  }))
                }
              />
            </FormControl>
          </div>
          <ColumnSelect
            columns={columns}
            setColumns={setColumns}
            columnsArray={columnsArray}
          />
        </ReportFilter>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>{t("sharedDevice")}</TableCell>
            {columns.map((key) => (
              <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.map((item, index) => (
              <TableRow
                key={`${item.deviceId}_${Date.parse(item.startTime)}_${index}`}
              >
                <TableCell className={classes.columnAction} padding="none">
                  {selectedItem === item ? (
                    <IconButton
                      size="small"
                      onClick={() => setSelectedItem(null)}
                    >
                      <GpsFixedIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => setSelectedItem(item)}
                    >
                      <LocationSearchingIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>{devices[item.deviceId].name}</TableCell>
                {columns.map((key) => (
                  <TableCell key={key}>{formatValue(item, key)}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={columns.length + 2} fullWidth />
          )}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default SummaryReportPage;
