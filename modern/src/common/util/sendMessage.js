import { toast } from "react-toastify";
import { MaxCharMsg } from "./constant";

const sendMessage = async (msg, number) => {
  const promise = new Promise(async (resolve) => {
    const message = await msg;
    console.log("Message", message);
    resolve();

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

    toast.promise(Promise.all(SendingList), {
      pending: "Sending",
      success: "Sent",
      error: "Error Try Again",
    });
  });

  toast.promise(promise, {
    pending: "Generating Message",
    success: "Generated",
    error: "Error Try Again",
  });
};

export default sendMessage;
