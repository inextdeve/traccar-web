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
  header: {
    position: "sticky",
    left: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  columnAction: {
    width: "1%",
    paddingLeft: theme.spacing(1),
  },
  filter: {
    display: "inline-flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2),
  },
  filterItem: {
    minWidth: "160px",
  },
  filterButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  filterButton: {
    flexGrow: 1,
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
  charts: {
    marginTop: "16px",
    marginBottom: "16px",
  },
  chart: {
    boxShadow:
      "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
    borderRadius: "11px",
    padding: "8px",
  },
  chartsHeading: {
    marginBottom: "8px",
  },
  chartSubtitle: {
    color: theme.palette.colors.neutral,
  },
}));
