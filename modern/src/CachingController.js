import { useDispatch, useSelector, connect } from "react-redux";

import {
  geofencesActions,
  groupsActions,
  driversActions,
  maintenancesActions,
} from "./store";
import { useEffectAsync } from "./reactHelper";

const CachingController = () => {
  const authenticated = useSelector((state) => !!state.session.user);
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch("/api/geofences");
      if (response.ok) {
        const data = await response.json();
        console.log(
          "Init",
          data.filter((item) => item.attributes.bins !== "yes")
        );
        dispatch(
          geofencesActions.update(
            data.filter((item) => item.attributes.bins !== "yes")
          )
        );
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch("/api/groups");
      if (response.ok) {
        dispatch(groupsActions.update(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch("/api/drivers");
      if (response.ok) {
        dispatch(driversActions.update(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch("/api/maintenance");
      if (response.ok) {
        dispatch(maintenancesActions.update(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  return null;
};

export default connect()(CachingController);
