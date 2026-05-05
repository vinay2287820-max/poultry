import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useSalesmanOrder = (id) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET all orders from Salesman
  const { data: ordersInSalesman, isPending: ordersInSalesmanLoading } =
    useQuery({
      queryKey: ["ordersInSalesman"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.SALESMAN.GET_ALL_ORDERS,
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

  // GET Due orders from Salesman
  const { data: dueOrdersInSalesman, isPending: dueOrdersInSalesmanLoading } =
    useQuery({
      queryKey: ["dueOrdersInSalesman"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.SALESMAN.GET_DUE_ORDERS,
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
  const { data: singleOrderFromSalesman, isPending: singleOrderLoading } =
    useQuery({
      queryKey: ["singleOrder", id],
      queryFn: async () => {
        if (!id) return null;
        const response = await axios.get(
          BASE_URL + API_PATHS.SALESMAN.GET_ORDER(id),
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

  // CREATE Order in Salesman
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.SALESMAN.CREATE_ORDER,
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
      queryClient.invalidateQueries({ queryKey: ["ordersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["dueOrdersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["singleOrder", id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // DELIVER Order in Salesman
  const { mutate: deliverOrder, isPending: isDeliveringOrder } = useMutation({
    mutationFn: async (orderId) => {
      if (!orderId) return null;
      const response = await axios.patch(
        BASE_URL + API_PATHS.SALESMAN.DELIVER_ORDER,
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
      queryClient.invalidateQueries({ queryKey: ["ordersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["dueOrdersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["singleOrder", id] });
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
        BASE_URL + API_PATHS.SALESMAN.CANCEL_ORDER(data.orderId),
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
      queryClient.invalidateQueries({ queryKey: ["ordersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["dueOrdersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["singleOrder", id] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // update payment in Salesman
  const { mutate: updatePayment, isPending: isUpdatingPayment } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.SALESMAN.UPDATE_PAYMENT,
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
      queryClient.invalidateQueries({ queryKey: ["ordersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["dueOrdersInSalesman"] });
      queryClient.invalidateQueries({ queryKey: ["singleOrder", id] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  // ------------------------------ PARTY -------------------------------

  // GET all Parties
  const { data: parties, isPending: partiesLoading } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.SALESMAN.GET_ALL_PARTIES,
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

  // GET approved Parties
  const { data: approvedParties, isPending: approvedPartiesLoading } = useQuery(
    {
      queryKey: ["approvedParties"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.SALESMAN.GET_APPROVED_PARTIES,
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
    }
  );

  // GET rejected Parties
  const { data: rejectedParties, isPending: rejectedPartiesLoading } = useQuery(
    {
      queryKey: ["rejectedParties"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.SALESMAN.GET_REJECTED_PARTIES,
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
    }
  );

  //send party for approval
  const { mutate: sendPartyForApproval, isPending: sendingPartyForApproval } =
    useMutation({
      mutationFn: async (partyId) => {
        if (!partyId) return null;
        const response = await axios.post(
          BASE_URL + API_PATHS.SALESMAN.APPROVE_PARTY,
          { partyId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        toast.success(data.message);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  //add party
  const { mutate: addParty, isPending: addingParty } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.SALESMAN.ADD_PARTY,
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
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  //update party
  const { mutate: updateParty, isPending: updatingParty } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(
        BASE_URL + API_PATHS.SALESMAN.UPDATE_PARTY(data.partyId),
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
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  //delete party
  const { mutate: deleteParty, isPending: deletingParty } = useMutation({
    mutationFn: async (partyId) => {
      const response = await axios.delete(
        BASE_URL + API_PATHS.SALESMAN.DELETE_PARTY(partyId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  return {
    parties,
    addParty,
    ordersInSalesman,
    singleOrderFromSalesman,
    dueOrdersInSalesman,
    createOrder,
    updatePayment,
    cancelOrder,
    sendPartyForApproval,
    approvedParties,
    updateParty,
    deleteParty,
    deliverOrder,
    rejectedParties,

    //Loading
    isDeliveringOrder,
    rejectedPartiesLoading,
    partiesLoading,
    deletingParty,
    addingParty,
    updatingParty,
    isCancelingOrder,
    sendingPartyForApproval,
    approvedPartiesLoading,
    ordersInSalesmanLoading,
    singleOrderLoading,
    dueOrdersInSalesmanLoading,
    isUpdatingPayment,
    isCreatingOrder,
  };
};
