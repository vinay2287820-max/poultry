import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import {useUser} from "./useUser";

const useMessages = () => {
  const token = localStorage.getItem("token");

  const { user } = useUser();
  const { data: messages, isPending: loadingMessages } = useQuery({
    queryKey: ["messages", user?._id],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.MESSAGES.GET_MESSAGES(user._id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // GET all admins
  const { data: admins, isPending: loadingAdmins } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.MESSAGES.GET_ALL_ADMINS,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return { admins, loadingAdmins, messages, loadingMessages };
};

export default useMessages;
