import React, { useState } from "react";

import {
  Button,
  Checkbox,
  OutlinedInput,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  MenuItem,
  ListItemText,
  Select,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddAttributeDialog from "./AddAttributeDialog";
import { useTranslation } from "../../common/components/LocalizationProvider";
import { useAttributePreference } from "../../common/util/preferences";
import {
  distanceFromMeters,
  distanceToMeters,
  distanceUnitString,
  speedFromKnots,
  speedToKnots,
  speedUnitString,
  volumeFromLiters,
  volumeToLiters,
  volumeUnitString,
} from "../../common/util/converter";
import useFeatures from "../../common/util/useFeatures";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  removeButton: {
    marginRight: theme.spacing(1.5),
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));
// For array attribute select
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const EditAttributesAccordion = ({
  attribute,
  attributes,
  setAttributes,
  definitions,
  focusAttribute,
}) => {
  const classes = useStyles();
  const t = useTranslation();

  const features = useFeatures();

  const speedUnit = useAttributePreference("speedUnit");
  const distanceUnit = useAttributePreference("distanceUnit");
  const volumeUnit = useAttributePreference("volumeUnit");

  // Get routes
  const routes = useSelector((state) => state.bins.routes);

  const [addDialogShown, setAddDialogShown] = useState(false);

  const updateAttribute = (key, value, type, subtype) => {
    const updatedAttributes = { ...attributes };
    switch (subtype) {
      case "speed":
        updatedAttributes[key] = speedToKnots(Number(value), speedUnit);
        break;
      case "distance":
        updatedAttributes[key] = distanceToMeters(Number(value), distanceUnit);
        break;
      case "volume":
        updatedAttributes[key] = volumeToLiters(Number(value), volumeUnit);
        break;
      default:
        updatedAttributes[key] = type === "number" ? Number(value) : value;
        break;
    }
    setAttributes(updatedAttributes);
  };

  const deleteAttribute = (key) => {
    const updatedAttributes = { ...attributes };
    delete updatedAttributes[key];
    setAttributes(updatedAttributes);
  };

  const getAttributeName = (key, subtype) => {
    const definition = definitions[key];
    const name = definition ? definition.name : key;
    switch (subtype) {
      case "speed":
        return `${name} (${speedUnitString(speedUnit, t)})`;
      case "distance":
        return `${name} (${distanceUnitString(distanceUnit, t)})`;
      case "volume":
        return `${name} (${volumeUnitString(volumeUnit, t)})`;
      default:
        return name;
    }
  };

  const getAttributeType = (value) => {
    if (typeof value === "number") {
      return "number";
    }
    if (typeof value === "boolean") {
      return "boolean";
    }
    if (typeof value === "object") {
      return "array";
    }

    return "string";
  };

  const getAttributeSubtype = (key) => {
    const definition = definitions[key];
    return definition && definition.subtype;
  };

  const getDisplayValue = (value, subtype) => {
    if (value) {
      switch (subtype) {
        case "speed":
          return speedFromKnots(value, speedUnit);
        case "distance":
          return distanceFromMeters(value, distanceUnit);
        case "volume":
          return volumeFromLiters(value, volumeUnit);
        default:
          return value;
      }
    }
    return "";
  };

  const convertToList = (attributes) => {
    const booleanList = [];
    const otherList = [];
    const excludeAttributes = [
      "speedUnit",
      "distanceUnit",
      "volumeUnit",
      "timezone",
    ];
    Object.keys(attributes || [])
      .filter((key) => !excludeAttributes.includes(key))
      .forEach((key) => {
        const value = attributes[key];
        const type = getAttributeType(value);
        const subtype = getAttributeSubtype(key);
        if (type === "boolean") {
          booleanList.push({
            key,
            value,
            type,
            subtype,
          });
        } else {
          otherList.push({
            key,
            value,
            type,
            subtype,
          });
        }
      });
    return [...otherList, ...booleanList];
  };

  const handleAddResult = (definition) => {
    setAddDialogShown(false);
    if (definition) {
      switch (definition.type) {
        case "number":
          updateAttribute(definition.key, 0);
          break;
        case "boolean":
          updateAttribute(definition.key, false);
          break;
        case "array":
          updateAttribute(definition.key, []);
          break;
        default:
          updateAttribute(definition.key, "");
          break;
      }
    }
  };

  return features.disableAttributes ? (
    ""
  ) : (
    <Accordion defaultExpanded={!!attribute}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">{t("sharedAttributes")}</Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        {convertToList(attributes).map(({ key, value, type, subtype }) => {
          if (type === "boolean") {
            return (
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                key={key}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value}
                      onChange={(e) => updateAttribute(key, e.target.checked)}
                    />
                  }
                  label={getAttributeName(key, subtype)}
                />
                <IconButton
                  size="small"
                  className={classes.removeButton}
                  onClick={() => deleteAttribute(key)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Grid>
            );
          }
          // This is just for route if you want to make it standard for future use make the route condition && key === "routes"
          if (type === "array") {
            return (
              <FormControl key={key}>
                <InputLabel>{key}</InputLabel>
                <Select
                  multiple
                  value={getDisplayValue(value, subtype)}
                  onChange={(e) =>
                    updateAttribute(key, e.target.value, type, subtype)
                  }
                  input={<OutlinedInput label={key} />}
                  // Using map() for mapping ids to route name
                  renderValue={(selected) =>
                    selected
                      .map((routesId) => {
                        return routes.filter(({ id }) => id == routesId)[0]
                          .rout_code;
                      })
                      .join(", ")
                  }
                  MenuProps={MenuProps}
                  endAdornment={
                    <InputAdornment position="end" sx={{ marginRight: "15px" }}>
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => deleteAttribute(key)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                >
                  {routes.map(({ rout_code, id }) => (
                    <MenuItem key={rout_code} value={id}>
                      <Checkbox
                        checked={
                          getDisplayValue(value, subtype).indexOf(id) > -1
                        }
                      />
                      <ListItemText primary={rout_code} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          }

          return (
            <FormControl key={key}>
              <InputLabel>{getAttributeName(key, subtype)}</InputLabel>
              <OutlinedInput
                label={getAttributeName(key, subtype)}
                type={type === "number" ? "number" : "text"}
                value={getDisplayValue(value, subtype)}
                onChange={(e) =>
                  updateAttribute(key, e.target.value, type, subtype)
                }
                autoFocus={focusAttribute === key}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => deleteAttribute(key)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          );
        })}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setAddDialogShown(true)}
          startIcon={<AddIcon />}
        >
          {t("sharedAdd")}
        </Button>
        <AddAttributeDialog
          open={addDialogShown}
          onResult={handleAddResult}
          definitions={definitions}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default EditAttributesAccordion;
