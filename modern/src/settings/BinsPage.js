import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import SettingsMenu from "./components/SettingsMenu";
import PageLayout from "../common/components/PageLayout";
import CollectionTable from "./components/CollectionTable";

function createTableData(id, description, position, type, center, route) {
  return {
    id,
    description,
    position: (
      <a href="" target="_blank">
        <RoomOutlinedIcon />
      </a>
    ),
    type,
    center,
    route,
  };
}
const BinsPage = () => {
  const headCells = [
    {
      id: "id",
      numeric: true,
      disablePadding: true,
      label: "ID",
    },
    {
      id: "description",
      numeric: true,
      disablePadding: false,
      label: "Description",
    },
    {
      id: "position",
      numeric: true,
      disablePadding: false,
      label: "Position",
    },
    {
      id: "type",
      numeric: true,
      disablePadding: false,
      label: "Type",
    },
    {
      id: "center",
      numeric: true,
      disablePadding: false,
      label: "Center",
    },
    {
      id: "route",
      numeric: true,
      disablePadding: false,
      label: "Route",
    },
  ];
  const keys = ["id", "description", "position", "type", "center", "route"];

  const rows = [
    createTableData(1, "CTC-0005", 2939, "6 Yard", 4.3, "Yamama"),
    createTableData(2, "ATY-0035", 3243, "10 Litre", 4.9, "Nord"),
    createTableData(3, "HJZ-0305", 3233, "3 Yard", 6.0, "Earth"),
  ];

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsGroups"]}
    >
      <CollectionTable />
    </PageLayout>
  );
};

export default BinsPage;
