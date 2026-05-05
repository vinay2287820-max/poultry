import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL, API_PATHS } from "../utils/apiPaths";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useUser = () => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  //Current Logged in user data
  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await axios.get(BASE_URL + API_PATHS.ME.GET, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.data;
      } catch (err) {
        console.log(err);
        if (err.response.data.success === false) {
          navigate("/login");
        }
      }
    },
  });

  const ROLES = {
    Salesman: API_PATHS.SALESMAN.CHANGE_ACTIVITY_STATUS,
    SalesManager: API_PATHS.MANAGER.CHANGE_ACTIVITY_STATUS,
    SalesAuthorizer: API_PATHS.AUTHORIZER.CHANGE_ACTIVITY_STATUS,
    PlantHead: API_PATHS.PLANT_HEAD.CHANGE_ACTIVITY_STATUS,
    Accountant: API_PATHS.ACCOUNTANT.CHANGE_ACTIVITY_STATUS,
  };

  //Change Activity Status (role based)
  const { mutate: changeStatus, isPending: changeStatusPending } = useMutation({
    mutationFn: async (role) => {
      const apiPath = ROLES[role];
      if (apiPath) {
        const response = await axios.put(
          BASE_URL + apiPath,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success("Status changed successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  return {
    user,
    isPending,
    error,
    isAuthenticated: !!token,
    changeStatus,
    changeStatusPending,
  };
};
