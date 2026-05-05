import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useWarehouse = () => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  //GET warehouses
  const { data: warehouses, isPending: warehouseLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.WAREHOUSE.GET_ALL,
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

  // ADD Warehouse
  const { mutate: addWarehouse, isPending: isAddingWarehouse } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.ADMIN.WAREHOUSE.ADD,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });
      toast.success("Warehouse added successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // UPDATE Warehouse
  const { mutate: updateWarehouse, isPending: isUpdatingWarehouse } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.patch(
          BASE_URL + API_PATHS.ADMIN.WAREHOUSE.UPDATE(data._id),
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["warehouses"],
        });
        toast.success("Warehouse updated successfully");
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  // DELETE Warehouse
  const { mutate: deleteWarehouse, isPending: isDeletingWarehouse } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.delete(
          BASE_URL + API_PATHS.ADMIN.WAREHOUSE.DELETE(id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["warehouses"],
        });
        toast.success("Warehouse deleted successfully");
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  const isLoading =
    warehouseLoading ||
    isAddingWarehouse ||
    isUpdatingWarehouse ||
    isDeletingWarehouse;

  return {
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    warehouses,
    isLoading,
  };
};

export default useWarehouse;
