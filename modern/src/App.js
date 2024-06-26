import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LinearProgress, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { ToastContainer } from "react-toastify";
import theme from "./common/theme";
import BottomMenu from "./common/components/BottomMenu";
import SocketController from "./SocketController";
import CachingController from "./CachingController";
import { useEffectAsync } from "./reactHelper";
import { sessionActions } from "./store";
import "react-toastify/dist/ReactToastify.css";

const useStyles = makeStyles(() => ({
  page: {
    flexGrow: 1,
    overflow: "auto",
  },
  menu: {
    zIndex: 1204,
  },
}));

const App = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const initialized = useSelector((state) => !!state.session.user);

  useEffectAsync(async () => {
    if (!initialized) {
      const response = await fetch("/api/session");
      if (response.ok) {
        dispatch(sessionActions.updateUser(await response.json()));
      } else {
        navigate("/login");
      }
    }
    return null;
  }, [initialized]);

  return !initialized ? (
    <LinearProgress />
  ) : (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="light"
      />
      <SocketController />
      <CachingController />
      <div className={classes.page}>
        <Outlet />
      </div>
      {!desktop && (
        <div className={classes.menu}>
          <BottomMenu />
        </div>
      )}
    </>
  );
};

export default App;
