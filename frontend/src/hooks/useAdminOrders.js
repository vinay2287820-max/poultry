import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useAdminOrder = (id) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET all orders
  const { data: orders, isPending: ordersLoading } = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.ORDERS.GET_ALL,
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

  // GET order by id
  const { data: singleOrder, isPending: singleOrderLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.ORDERS.GET(id),
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

  //approve warehouse
  const { mutate: approveWarehouse, isPending: isApprovingWarehouse } =
    useMutation({
      mutationFn: async (orderId) => {
        const response = await axios.patch(
          BASE_URL + API_PATHS.ADMIN.ORDERS.APPROVE,
          { orderId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["order"] });
        toast.success("Order approved successfully");
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  //get all parties
  const { data: allParties, isPending: allPartiesLoading } = useQuery({
    queryKey: ["allParties"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.PARTY.GET_ALL_PARTIES,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  //get approved parties
  const { data: approvedParties, isPending: approvedPartiesLoading } = useQuery(
    {
      queryKey: ["approvedParties"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.ADMIN.PARTY.GET_APPROVED_PARTIES,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    }
  );

  //get rejected parties
  const { data: rejectedParties, isPending: rejectedPartiesLoading } = useQuery(
    {
      queryKey: ["rejectedParties"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.ADMIN.PARTY.GET_REJECTED_PARTIES,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    }
  );

  //get parties to approve
  const { data: partiesToApprove, isPending: partiesToApproveLoading } =
    useQuery({
      queryKey: ["partiesToApprove"],
      queryFn: async () => {
        const response = await axios.get(
          BASE_URL + API_PATHS.ADMIN.PARTY.GET_PARTIES_TO_APPROVE,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        queryClient.invalidateQueries({ queryKey: ["allParties"] });
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  //approve party
  const { mutate: approveParty, isPending: isApprovingParty } = useMutation({
    mutationFn: async (partyId) => {
      const response = await axios.patch(
        BASE_URL + API_PATHS.ADMIN.PARTY.APPROVE,
        { partyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["allParties"] });
      queryClient.invalidateQueries({ queryKey: ["partiesToApprove"] });
      toast.success("Party approved successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  //reject party
  const { mutate: rejectParty, isPending: isRejectingParty } = useMutation({
    mutationFn: async (partyId) => {
      const response = await axios.patch(
        BASE_URL + API_PATHS.ADMIN.PARTY.REJECT,
        { partyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["allParties"] });
      queryClient.invalidateQueries({ queryKey: ["partiesToApprove"] });
      toast.success("Party rejected successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  //update party
  const { mutate: updateParty, isPending: isUpdatingParty } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(
        BASE_URL + API_PATHS.ADMIN.PARTY.UPDATE_PARTY(data.partyId),
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["allParties"] });
      queryClient.invalidateQueries({ queryKey: ["partiesToApprove"] });
      toast.success("Party updated successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response.data.message);
    },
  });

  return {
    orders,
    rejectParty,
    updateParty,
    isUpdatingParty,
    isRejectingParty,
    approveParty,
    rejectedParties,
    rejectedPartiesLoading,
    isApprovingParty,
    singleOrder,
    ordersLoading,
    singleOrderLoading,
    approveWarehouse,
    isApprovingWarehouse,
    partiesToApprove,
    partiesToApproveLoading,
    allParties,
    allPartiesLoading,
    approvedParties,
    approvedPartiesLoading,
  };
};
