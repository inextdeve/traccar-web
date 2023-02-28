import { toast } from "react-toastify";
import { MaxCharMsg } from "./constant";
const sendMessage = async (msg, number) => {
  const message = await msg;

  const SendingList = [];
  if (message.length > MaxCharMsg) {
    for (let i = 0; i < Math.ceil(message.length / MaxCharMsg); i += 1) {
      const messageSlice = message.slice(
        i * MaxCharMsg,
        i * MaxCharMsg + MaxCharMsg
      );
      SendingList.push(
        fetch("https://api.ultramsg.com/instance27714/messages/chat", {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          body: `token=x6lf1axmx0kmiimb&to=+${"212704866309"}&body=${messageSlice}&priority=1&referenceId=`,
        })
      );
    }
  }

  Promise.all(SendingList).then((values) => {
    console.log(values);
  });
  // toast.promise(Promise.all(SendingList), {
  //   pending: "Sending",
  //   success: "Sent",
  //   error: "Error Try Again",
  // });
};

export default sendMessage;
