import { useMemo } from "react";

export default (t) => useMemo(() => ({
  type: {
    name: t("binType"),
    type: "string",
  },
}));
