import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useSalesManagerOrder = (id) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET all assigned orders from sales manager
  const { data: ordersInSalesManager, isPending: ordersInSalesManagerLoading } =
    useQuery({
      queryKey: ["ordersInSalesManager"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.MANAGER.GET_ASSIGNED_ORDERS,
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

  // GET all forwarded orders
  const {
    data: ForwardedOrdersInSalesManager,
    isPending: ForwardedOrdersInSalesManagerLoading,
  } = useQuery({
    queryKey: ["ordersInForwarded"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.MANAGER.GET_FORWARDED_ORDERS,
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

  //GET single order using order id
  const { data: singleOrderFromSalesManager, isPending: singleOrderLoading } =
    useQuery({
      queryKey: ["singleOrderFromSalesManager", id],
      queryFn: async () => {
        if (!id) return null;
        const response = await axios.get(
          BASE_URL + API_PATHS.MANAGER.GET_ORDER(id),
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

  // FORWARD order to sales authorizer
  const { mutate: forwardOrder, isPending: isForwardingOrder } = useMutation({
    mutationFn: async (orderId) => {
      const response = await axios.put(
        BASE_URL + API_PATHS.MANAGER.FORWARD_ORDER(orderId),
        {},
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
      queryClient.invalidateQueries({ queryKey: ["ordersInSalesManager"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // Cancel order
  const { mutate: cancelOrder, isPending: isCancelingOrder } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.MANAGER.CANCEL_ORDER(data.orderId),
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
      queryClient.invalidateQueries({ queryKey: ["ordersInSalesManager"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  return {
    ordersInSalesManager,
    singleOrderFromSalesManager,
    forwardOrder,
    cancelOrder,
    ForwardedOrdersInSalesManager,

    //Loading
    ordersInSalesManagerLoading,
    ForwardedOrdersInSalesManagerLoading,
    singleOrderLoading,
    isForwardingOrder,
    isCancelingOrder,
  };
};
