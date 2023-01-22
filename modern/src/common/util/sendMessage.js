import { toast } from "react-toastify";

const sendMessage = async (message, number) => {
  const data = fetch("https://api.ultramsg.com/instance27714/messages/chat", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: `token=x6lf1axmx0kmiimb&to=+212704866309&body=${message}&priority=1&referenceId=`,
  });
  toast.promise(data, {
    pending: "Sending",
    success: "Sent",
    error: "Error Try Again",
  });
};

export default sendMessage;
