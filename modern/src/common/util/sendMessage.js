import { toast } from "react-toastify";
import { MaxCharMsg } from "./constant";

const sendMessage = async (msg, number) => {
  const promise = new Promise(async (resolve) => {
    const message = await msg;
    resolve();

    const SendingList = [];

    for (let i = 0; i < Math.ceil(message.length / MaxCharMsg); i += 1) {
      const messageSlice = message.slice(
        i * MaxCharMsg,
        i * MaxCharMsg + MaxCharMsg
      );

      //Message Api
      const formdata = new FormData();
      formdata.append("appkey", "30716d9c-fcab-4ea1-87ed-028b2a632b67");
      formdata.append("authkey", "KtqDYNjNL5QeUO0o9uaqaiYiPEFwPqNfM98ukxZGUdyYty5Wz3");
      formdata.append("to", '212704866309');
      formdata.append("message", messageSlice);

      SendingList.push(
        fetch("https://wacode.app/api/create-message", {
          method: "POST",
          body: formdata,
          redirect: 'follow'
        })
      );
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
