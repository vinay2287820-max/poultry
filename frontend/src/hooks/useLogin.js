import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL, API_PATHS } from "../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { subscribeUser } from "../subscribeUser";

const useLogin = () => {
  const navigate = useNavigate();
  const browserId =
    navigator.userAgent + "-" + Math.random().toString(36).slice(2);

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (data) => {
      const role = data.role.toUpperCase();

      const response = await axios.post(BASE_URL + API_PATHS[role].LOGIN, data);
      localStorage.setItem("token", response.data.data.token);
      return response.data;
    },
    onSuccess: (data) => {
      subscribeUser(
        data?.data?._id,
        data?.data?.role,
        browserId,
        "BNcMT8wY9rjGtM_SBQGFyLbrL-Q9r6TVknSCjLWcJYl5Yj3TlERQDjIYbTuAKTolgHw4tAinWVLCzcZyOZG5iS8"
      );

      if (data.data.role === "Admin") navigate("/admin/dashboard");
      if (data.data.role === "Salesman") navigate("/salesman/dashboard");
      if (data.data.role === "SalesManager")
        navigate("/salesmanager/dashboard");
      if (data.data.role === "SalesAuthorizer")
        navigate("/salesauthorizer/dashboard");
      if (data.data.role === "PlantHead") navigate("/planthead/dashboard");
      if (data.data.role === "Accountant") navigate("/accountant/dashboard");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  return { login, isPending, error };
};

export default useLogin;
