import Toast from "react-native-toast-message";

export const toast = {
  success: (message: string, duration?: number) =>
    Toast.show({
      type: "success",
      text1: "Success",
      text2: message,
      visibilityTime: duration ?? 2500,
    }),
  error: (message: string, duration?: number) =>
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
      visibilityTime: duration ?? 3000,
    }),
  info: (message: string, duration?: number) =>
    Toast.show({
      type: "info",
      text1: "Info",
      text2: message,
      visibilityTime: duration ?? 2500,
    }),
  hide: () => Toast.hide(),
};
