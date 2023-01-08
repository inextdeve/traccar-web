import { toast } from "react-toastify";
import { useTranslation } from "../components/LocalizationProvider";

const sendMessage = async (messagePromise, number) => {
  const t = (s) => s;

  const message = await toast.promise(messagePromise, {
    pending: t("Generating"),
    error: t("sentError"),
  });

  const data = fetch("https://api.ultramsg.com/instance27714/messages/chat", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: `token=x6lf1axmx0kmiimb&to=+212704866309&body=${message}&priority=1&referenceId=`,
  });
  toast.promise(data, {
    pending: t("sending"),
    success: t("sent"),
    error: t("sentError"),
  });
};

export default sendMessage;
