import { makeStyles } from "@mui/styles";

export default makeStyles((theme) => ({
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  containerMap: {
    flexBasis: "40%",
    flexShrink: 0,
  },
  containerMain: {
    overflow: "auto",
  },
  columnAction: {
    width: "1%",
    paddingLeft: theme.spacing(1),
  },
  filterItem: {
    minWidth: "160px",
  },
  emptyBin: {
    backgroundColor: theme.palette.colors.bsSuccess,
    color: "#fff",
  },
  unEmptyBin: {
    backgroundColor: theme.palette.colors.bsDanger,
    color: "#fff",
  },
  greyRow: {
    backgroundColor: theme.palette.colors.neutral,
  },
  lastCell: {
    fontWeight: "500",
    color: "#fff",
    border: 0,
    fontSize: "1rem",
    lineHeight: 1.5,
    letterSpacing: "0.00938em",
  },
  charts: {
    gap: "1rem",
    justifyContent: "center",
  },
  chart: {
    boxShadow:
      "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
    borderRadius: "11px",
    padding: "8px",
  },
  chartContainer: {
    margin: "16px 0",
  },
  chartsHeading: {
    marginBottom: "8px",
  },
  chartSubtitle: {
    color: theme.palette.colors.neutral,
  },
  reportImg: {
    width: "100%",
  },
}));
