import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import axios from "axios";
import { toast } from "react-hot-toast";

export const usePlantheadOrder = (id) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET all orders from Planthead
  const { data: ordersInPlanthead, isPending: ordersInPlantheadLoading } =
    useQuery({
      queryKey: ["ordersInPlanthead"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.PLANT_HEAD.GET_ALL_ORDERS,
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

  // GET dispatched orders from Planthead
  const {
    data: dispatchedOrdersInPlanthead,
    isPending: dispatchedOrdersInPlantheadLoading,
  } = useQuery({
    queryKey: ["dispatchedOrdersInPlanthead"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.PLANT_HEAD.GET_DISPATCHED_ORDERS,
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

  // GET all products from Planthead
  const { data: productsInPlanthead, isPending: productsInPlantheadLoading } =
    useQuery({
      queryKey: ["productsInPlanthead"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.PLANT_HEAD.GET_PRODUCTS,
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
        throw new Error(error);
      },
    });

  // DISPATCH Order in Planthead
  const {
    mutate: updateProductQuantity,
    isPending: isUpdatingProductQuantity,
  } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(
        BASE_URL + API_PATHS.PLANT_HEAD.UPDATE_PRODUCT_STOCK(data.productId),
        { quantity: Number(data.quantity) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
      queryClient.invalidateQueries({ queryKey: ["productsInPlanthead"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  //GET single order using order id
  const { data: singleOrderFromPlanthead, isPending: singleOrderLoading } =
    useQuery({
      queryKey: ["singleOrder", id],
      queryFn: async () => {
        if (!id) return null;
        const response = await axios.get(
          BASE_URL + API_PATHS.PLANT_HEAD.GET_ORDER(id),
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

  // DISPATCH Order in Planthead
  const { mutate: dispatchOrder, isPending: isDispatchingOrder } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(
        BASE_URL + API_PATHS.PLANT_HEAD.DISPATCH_ORDER(data.orderId),
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
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["ordersInPlanthead"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // CREATE Order in Planthead
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.PLANT_HEAD.CREATE_ORDER,
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
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["ordersInPlanthead"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // CANCEL Order
  const { mutate: cancelOrder, isPending: isCancelingOrder } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.PLANT_HEAD.CANCEL_ORDER(data.orderId),
        { reason: data.reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["ordersInPlanthead"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  return {
    ordersInPlanthead,
    singleOrderFromPlanthead,
    productsInPlanthead,
    dispatchOrder,
    createOrder,
    cancelOrder,
    dispatchedOrdersInPlanthead,
    updateProductQuantity,

    //Loading
    ordersInPlantheadLoading,
    productsInPlantheadLoading,
    dispatchedOrdersInPlantheadLoading,
    isUpdatingProductQuantity,
    singleOrderLoading,
    isCreatingOrder,
    isDispatchingOrder,
    isCancelingOrder,
  };
};
