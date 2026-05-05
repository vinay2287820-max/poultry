import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL, API_PATHS } from "../utils/apiPaths";

const useNotification = (id) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  const { data: notifications = [], isPending: loadingNotifications } =
    useQuery({
      queryKey: ["notifications", id],
      enabled: !!id,
      queryFn: async () => {
        const res = await axios.get(
          BASE_URL + API_PATHS.NOTIFICATIONS.GET_NOTIFICATIONS(id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return res?.data?.data ?? [];
      },
      onError: (error) => {
        console.log(error);
      },
    });

  const { mutate: markRead, isPending: markingRead } = useMutation({
    mutationFn: async () => {
      const response = await axios.put(
        BASE_URL + API_PATHS.NOTIFICATIONS.MARK_READ(id),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", id]);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // clear notifications
  const { mutate: clearNotifications, isPending: loadingClearNotifications } =
    useMutation({
      mutationFn: async () => {
        const response = await axios.delete(
          BASE_URL + API_PATHS.NOTIFICATIONS.CLEAR,
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

  return {
    clearNotifications,
    loadingClearNotifications,
    notifications,
    loadingNotifications,
    markRead,
    markingRead,
  };
};

export default useNotification;
