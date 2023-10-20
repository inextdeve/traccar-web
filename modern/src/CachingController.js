import { useDispatch, useSelector, connect } from "react-redux";

import {
  geofencesActions,
  groupsActions,
  driversActions,
  maintenancesActions,
  binsActions,
} from "./store";
import { useEffectAsync } from "./reactHelper";
import { URL } from "./common/util/constant";

const CachingController = () => {
  const authenticated = useSelector((state) => !!state.session.user);
  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const dispatch = useDispatch();

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch("/api/geofences");
      if (response.ok) {
        const data = await response.json();
        dispatch(geofencesActions.update(data));
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

  useEffectAsync(async () => {
    if (authenticated) {
      const options = { headers: { Authorization: `Bearer ${token}` } };
      const response = await fetch(`${URL}/api/routes`, options);
      if (response.ok) {
        console.log("Get Routes");
        dispatch(binsActions.updateRoutes(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  return null;
};

export default connect()(CachingController);
