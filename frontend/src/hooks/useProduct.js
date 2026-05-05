import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useProduct = (warehouseId) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET all Products
  const { data: allProducts, isPending: allProductsLoading } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.PRODUCT.GET_ALL,
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

  // UPDATE Product Price
  const { mutate: updateProductPrice, isPending: isUpdatingProductPrice } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.ADMIN.PRODUCT.UPDATE_PRICE(data.productId),
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
          queryKey: ["singleWarehouse"],
        });
        queryClient.invalidateQueries({
          queryKey: ["allProducts"],
        });
        toast.success("Product price updated successfully");
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  // ADD Product
  const { mutate: addProduct, isPending: isAddingProduct } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.ADMIN.PRODUCT.ADD,
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
        queryKey: ["singleWarehouse"],
      });
      queryClient.invalidateQueries({
        queryKey: ["allProducts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });
      toast.success("Product added successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // DELETE Product
  const { mutate: deleteProduct, isPending: isDeletingProduct } = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(
        BASE_URL + API_PATHS.ADMIN.PRODUCT.DELETE(id),
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
        queryKey: ["singleWarehouse"],
      });
      queryClient.invalidateQueries({
        queryKey: ["allProducts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  //----------WAREHOUSE PRODUCT MANAGEMENT--------------->

  // ADD Product to warehouse
  const {
    mutate: addProductToWarehouse,
    isPending: isAddingProductToWarehouse,
  } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.ADMIN.WAREHOUSE.ADD_PRODUCT(data.warehouseId),
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
        queryKey: ["singleWarehouse", warehouseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product", warehouseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });
      toast.success("Product added successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // DELETE Product from warehouse
  const {
    mutate: deleteProductFromWarehouse,
    isPending: isDeletingProductFromWarehouse,
  } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.delete(
        BASE_URL +
          API_PATHS.ADMIN.WAREHOUSE.DELETE_PRODUCT(
            data.warehouseId,
            data.productId
          ),
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
        queryKey: ["singleWarehouse", warehouseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product", warehouseId],
      });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  const isLoading =
    allProductsLoading ||
    isUpdatingProductPrice ||
    isAddingProduct ||
    isDeletingProduct ||
    isAddingProductToWarehouse ||
    isDeletingProductFromWarehouse;

  return {
    updateProductPrice,
    addProductToWarehouse,
    addProduct,
    deleteProduct,
    deleteProductFromWarehouse,
    allProducts,
    isLoading,
  };
};
