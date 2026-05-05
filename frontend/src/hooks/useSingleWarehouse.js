import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";

export const useSingleWarehouse = (id) => {
  const token = localStorage.getItem("token");
  const { data: singleWarehouse, isPending: singleWarehouseLoading } = useQuery(
    {
      queryKey: ["singleWarehouse", id],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.ADMIN.WAREHOUSE.GET(id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      },
    }
  );

  return { singleWarehouse, singleWarehouseLoading };
};
