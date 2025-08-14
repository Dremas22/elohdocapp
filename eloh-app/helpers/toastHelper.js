// toastHelper.js
import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export const toastSuccess = (msg, duration = 3000) =>
  toast.success(msg, {
    ...baseOptions,
    autoClose: duration,
    className: "bg-green-500 text-white font-semibold shadow-lg rounded-md",
  });

export const toastError = (msg, duration = 3000) =>
  toast.error(msg, {
    ...baseOptions,
    autoClose: duration,
    className: "bg-red-500 text-white font-semibold shadow-lg rounded-md",
  });

export const toastInfo = (msg, duration = 3000) =>
  toast.info(msg, {
    ...baseOptions,
    autoClose: duration,
    className: "bg-blue-500 text-white font-semibold shadow-lg rounded-md",
  });
