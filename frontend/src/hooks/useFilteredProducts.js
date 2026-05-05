import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import { toast } from "react-hot-toast";

const useFilteredProducts = (category) => {
  const token = localStorage.getItem("token");

  const { data: filteredProducts, isPending } = useQuery({
    queryKey: ["filteredProducts", category],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.WAREHOUSE.GET_FILTERED_PRODUCTS(category),
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
      toast.error(error.response.data.message);
    },
  });
  return { filteredProducts, isPending };
};

export default useFilteredProducts;
