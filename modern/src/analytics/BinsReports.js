import React, { useEffect, useRef, useState, useCallback } from "react";
import Carousel from "react-material-ui-carousel";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  LinearProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ImageIcon from "@mui/icons-material/Image";
import { useTheme } from "@mui/material/styles";
import { analyticsActions } from "../store";
import Print from "./common/Print";
import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import AnalyticsTable from "./components/AnalyticsTable";
import { useTranslation } from "../common/components/LocalizationProvider";
import ReportFilter from "./components/ReportFilter";
import ExcelExport from "./components/ExcelExport";
import PrintingHeader from "../common/components/PrintingHeader";
import MapAnalytics from "../map/MapAnalytics";
import Popup from "../common/components/Popup";
import { URL } from "../common/util/constant";
import ReportDetails from "./components/ReportDetails";
import moment from "moment";

const Item = ({ item }) => {
  const classes = useReportStyles();

  return (
    <div>
      <img className={classes.reportImg} src={item} alt="report" />
    </div>
  );
};

const BinsReports = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);
  const theme = useTheme();

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const [reportImages, setReportImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const setIsLoading = (state) =>
    dispatch(analyticsActions.updateLoading(state));
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(false);

  // MAP Proceessing
  const mapButtonClick = useCallback(async ({ id }) => {
    setSelectedItem(true);
    setMapLoading(null);
    const url = `${URL}/api/bins/${id}`;
    const data = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMapLoading(false);
    const positions = await data.json();
    console.log(positions);
    dispatch(
      analyticsActions.updatePositions(
        [positions.bin[0]].map(
          ({ id_bin, status, latitude, longitude, bintype }) => ({
            id: id_bin,
            category: `${
              status === "unempty" ? "trashNegative" : "trashPositive"
            }`,
            latitude,
            longitude,
            binType: bintype,
          })
        )
      )
    );
  });

  // Table Data Processing
  const columnsHead = [
    "more",
    "reportID",
    "date",
    "binName",
    "reportType",
    "area",
    "reporterName",
    "reporterPhone",
    "status",
    "actions",
  ];
  const keys = [
    "reportDetails",
    "id",
    "time",
    "description_bin",
    "type",
    "center_name",
    "username",
    "phone",
    "status",
    "actions",
  ];
  const data = useSelector((state) => state.analytics.items);
  const [tableData, setTableData] = useState(data);

  const items = tableData.map((item) => {
    const requestParams = {
      id: item.id_bin,
      tag: "bin",
    };
    return {
      reportDetails:(
        <ReportDetails description={item.description}/>
      ),
      ...item,
      time: moment(item.time).format('MM Do YYYY - H:mm'),
      status: parseInt(item.status) ? t("done") : t("processing"),
      actions: (
        <>
          <IconButton
            color="solidBlue"
            onClick={() => {
              setReportImages([item.img, item.imgafter]);
              setDialogOpen(true);
            }}
            disabled={false}
          >
            <ImageIcon />
          </IconButton>
          <IconButton
            color="solidGrey"
            onClick={() => mapButtonClick(requestParams)}
          >
            <MapIcon />
          </IconButton>
        </>
      ),
    };
  });

  useEffect(() => setTableData(data), [data]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${URL}/api/bins/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((response) => {
        const data = response?.reverse();

        dispatch(analyticsActions.updateItems(data));
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSubmit = ({ from, to }) => {
    const query = new URLSearchParams({
      from,
      to,
    });

    const url = `${URL}/api/bins/reports/?${query.toString()}`;
    setIsLoading(true);
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => data.json())
      .then((data) => {
        dispatch(analyticsActions.updateItems(data));
        setIsLoading(false);
      });
  };

  const onClose = () => {
    dispatch(analyticsActions.updatePopup(false));
    dispatch(analyticsActions.updateBinData(null));
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={["analytics", "reportBin"]}>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>Report Images</span>{" "}
          {selectedImage ? (
            <span className={`${classes.positive} ${classes.imageReportTag}`}>
              After
            </span>
          ) : (
            <span className={`${classes.negative} ${classes.imageReportTag}`}>
              Before
            </span>
          )}
        </DialogTitle>
        <DialogContent sx={{ minWidth: "400px" }}>
          <Carousel
            indicators={false}
            navButtonsAlwaysVisible
            autoPlay={false}
            height={300}
            onChange={(e) => setSelectedImage(e)}
          >
            {reportImages.map((item, i) => {
              if (!item) {
                return (
                  <Item
                    key={i}
                    title={i === 0 ? "Report Image" : "After"}
                    item="https://panthertech.fiu.edu/scs/extensions/SC/Manor/3.3.0/img/no_image_available.jpeg"
                  />
                );
              }
              return (
                <Item
                  key={i}
                  title={i === 0 ? "Report Image" : "After"}
                  item={item}
                />
              );
            })}
          </Carousel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <div className={classes.container}>
        <Popup
          desktopPadding={theme.dimensions.drawerWidthDesktop}
          onClose={onClose}
        />
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapAnalytics />
          </div>
        )}
        {mapLoading ?? <LinearProgress sx={{ padding: "0.1rem" }} />}
        <Box className={classes.containerMain} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              margin: "1rem 0",
            }}
          >
            <ReportFilter handleSubmit={handleSubmit} />
            <ExcelExport excelData={items} fileName="ReportSheet" />
            <Print
              target={TableRef.current}
              button={
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.filterButton}
                >
                  {t("print")}
                </Button>
              }
            />
          </Box>
          <Box ref={TableRef}>
            <PrintingHeader />
            <AnalyticsTable
              columnsHead={columnsHead}
              items={items}
              keys={keys}
              excludeTotal
            />
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default BinsReports;
