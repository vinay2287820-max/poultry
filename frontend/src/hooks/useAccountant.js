import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useAccountantOrder = (id) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET all dispatched orders from accountant
  const { data: ordersInAccountant, isPending: ordersInAccountantLoading } =
    useQuery({
      queryKey: ["ordersInAccountant"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.ACCOUNTANT.GET_DISPATCHED_ORDERS,
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

  // GET all orders to approve payment from accountant
  const {
    data: ordersToApprovePayment,
    isPending: ordersToApprovePaymentLoading,
  } = useQuery({
    queryKey: ["ordersToApprovePayment"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ACCOUNTANT.GET_ORDERS_TO_APPROVE_PAYMENT,
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

  // GET all orders to approve due payment from accountant
  const {
    data: ordersToApproveDuePayment,
    isPending: ordersToApproveDuePaymentLoading,
  } = useQuery({
    queryKey: ["ordersToApproveDuePayment"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ACCOUNTANT.GET_ORDERS_TO_APPROVE_DUE_PAYMENT,
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

  // GET single dispatched orders by id from accountant
  const {
    data: singleOrderInAccountant,
    isPending: singleOrderInAccountantLoading,
  } = useQuery({
    queryKey: ["singleOrderInAccountant", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(
        BASE_URL + API_PATHS.ACCOUNTANT.GET_ORDER(id),
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

  // GENERATE INVOICE by order id in accountant
  const { mutate: generateInvoice, isPending: isGeneratingInvoice } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.post(
          BASE_URL + API_PATHS.ACCOUNTANT.GENERATE_INVOICE(data.orderId),
          { dueDate: data.dueDate },
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
        queryClient.invalidateQueries({ queryKey: ["ordersInAccountant"] });
        queryClient.invalidateQueries({ queryKey: ["ordersToApprovePayment"] });
        queryClient.invalidateQueries({
          queryKey: ["singleOrderInAccountant"],
        });
        queryClient.invalidateQueries({
          queryKey: ["ordersToApproveDuePayment"],
        });
        toast.success(data.message);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  // GENERATE DUE INVOICE by order id in accountant
  const { mutate: generateDueInvoice, isPending: isGeneratingDueInvoice } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.post(
          BASE_URL + API_PATHS.ACCOUNTANT.GENERATE_DUE_INVOICE(data.orderId),
          { dueDate: data.dueDate },
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
        queryClient.invalidateQueries({ queryKey: ["ordersInAccountant"] });
        queryClient.invalidateQueries({ queryKey: ["ordersToApprovePayment"] });
        queryClient.invalidateQueries({
          queryKey: ["ordersToApproveDuePayment"],
        });
        queryClient.invalidateQueries({
          queryKey: ["singleOrderInAccountant"],
        });
        toast.success(data.message);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  // APPROVE ORDER by order id in accountant
  const { mutate: approveOrderPayment, isPending: isApprovingOrderPayment } =
    useMutation({
      mutationFn: async (orderId) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.ACCOUNTANT.APPROVE_ORDER,
          { orderId },
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
        queryClient.invalidateQueries({ queryKey: ["ordersInAccountant"] });
        queryClient.invalidateQueries({ queryKey: ["ordersToApprovePayment"] });
        queryClient.invalidateQueries({
          queryKey: ["ordersToApproveDuePayment"],
        });
        queryClient.invalidateQueries({
          queryKey: ["singleOrderInAccountant"],
        });
        toast.success(data.message);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  // APPROVE DUE PAYMENT by order id in accountant
  const { mutate: approveDuePayment, isPending: isApprovingDuePayment } =
    useMutation({
      mutationFn: async (orderId) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.ACCOUNTANT.APPROVE_DUE_PAYMENT,
          { orderId },
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
        queryClient.invalidateQueries({ queryKey: ["ordersInAccountant"] });
        queryClient.invalidateQueries({ queryKey: ["ordersToApprovePayment"] });
        queryClient.invalidateQueries({
          queryKey: ["ordersToApproveDuePayment"],
        });
        queryClient.invalidateQueries({
          queryKey: ["singleOrderInAccountant"],
        });
        toast.success(data.message);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  // GET INVOICE by order id in accountant
  // const { data: invoice, isPending: isGettingInvoice } = useQuery({
  //   queryKey: ["invoice", id],
  //   queryFn: async () => {
  //     if (!id) return null;
  //     const response = await axios.get(
  //       BASE_URL + API_PATHS.ACCOUNTANT.GET_INVOICE(id),
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("invoice in hook", response.data.data);
  //     return response.data.data;
  //   },
  //   onError: (error) => {
  //     console.log(error);
  //     toast.error(error.response.data.message);
  //   },
  // });

  return {
    ordersInAccountant,
    singleOrderInAccountant,
    generateInvoice,
    ordersToApprovePayment,
    approveOrderPayment,
    ordersToApproveDuePayment,
    approveDuePayment,
    generateDueInvoice,

    //Loading
    isApprovingOrderPayment,
    isGeneratingDueInvoice,
    isApprovingDuePayment,
    ordersInAccountantLoading,
    ordersToApprovePaymentLoading,
    singleOrderInAccountantLoading,
    ordersToApproveDuePaymentLoading,
    isGeneratingInvoice,
  };
};
