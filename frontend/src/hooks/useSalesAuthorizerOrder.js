import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useSalesAuthorizerOrder = (id) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  // GET all assigned orders from sales manager
  const {
    data: ordersInSalesAuthorizer,
    isPending: ordersInSalesAuthorizerLoading,
  } = useQuery({
    queryKey: ["ordersInSalesAuthorizer"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.AUTHORIZER.GET_ASSIGNED_ORDERS,
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
    data: AuthorizerAssignmentHistory,
    isPending: AuthorizerAssignmentHistoryLoading,
  } = useQuery({
    queryKey: ["AuthorizerAssignmentHistory"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.AUTHORIZER.GET_ASSIGNMENT_HISTORY,
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

  // GET all approved warehouse using order id
  //warehouse status
  const {
    data: ApprovedOrderForWarehouse,
    isPending: ApprovedOrderForWarehouseLoading,
  } = useQuery({
    queryKey: ["ApprovedOrderForWarehouse", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(
        BASE_URL + API_PATHS.AUTHORIZER.CHECK_WAREHOUSE_STATUS(id),
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

  //GET all warehouses
  const { data: allWarehouses, isPending: warehousesLoading } = useQuery({
    queryKey: ["allWarehousesFromAuthorizer"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.AUTHORIZER.GET_ALL_WAREHOUSES,
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
  const {
    data: singleOrderFromSalesauthorizer,
    isPending: singleOrderLoading,
  } = useQuery({
    queryKey: ["singleOrderFromSalesauthorizer", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(
        BASE_URL + API_PATHS.AUTHORIZER.GET_ORDER(id),
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

  //ASSIGN Warehouse to an order
  const { mutate: assignWarehouseToOrder, isPending: assignWarehouseLoading } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.AUTHORIZER.ASSIGN_WAREHOUSE(data.orderId),
          { warehouseId: data.warehouseId },
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
        queryClient.invalidateQueries({
          queryKey: ["AuthorizerAssignmentHistory"],
        });
        queryClient.invalidateQueries({
          queryKey: ["ApprovedOrderForWarehouse"],
        });
        queryClient.invalidateQueries({
          queryKey: ["ordersInSalesAuthorizer"],
        });
        queryClient.invalidateQueries({
          queryKey: ["singleOrderFromSalesauthorizer"],
        });
        toast.success(data.message);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.response.data.message);
      },
    });

  //approve warehouse to order
  const { mutate: approveWarehouse, isPending: approveWarehouseLoading } =
    useMutation({
      mutationFn: async (orderId) => {
        const response = await axios.patch(
          BASE_URL + API_PATHS.AUTHORIZER.APPROVE_WAREHOUSE,
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
        queryClient.invalidateQueries({
          queryKey: ["ordersInSalesAuthorizer"],
        });
        queryClient.invalidateQueries({
          queryKey: ["allWarehousesFromAuthorizer"],
        });
        queryClient.invalidateQueries({
          queryKey: ["singleOrderFromSalesauthorizer"],
        });
        queryClient.invalidateQueries({
          queryKey: ["warehouses"],
        });
        queryClient.invalidateQueries({
          queryKey: ["singleWarehouse"],
        });
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
        BASE_URL + API_PATHS.AUTHORIZER.CANCEL_ORDER(data.orderId),
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
      queryClient.invalidateQueries({
        queryKey: ["ordersInSalesAuthorizer"],
      });
      queryClient.invalidateQueries({
        queryKey: ["allWarehousesFromAuthorizer"],
      });
      queryClient.invalidateQueries({
        queryKey: ["singleOrderFromSalesauthorizer"],
      });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  return {
    ordersInSalesAuthorizer,
    singleOrderFromSalesauthorizer,
    approveWarehouse,
    allWarehouses,
    assignWarehouseToOrder,
    cancelOrder,
    AuthorizerAssignmentHistory,
    ApprovedOrderForWarehouse,

    //Loading
    ordersInSalesAuthorizerLoading,
    approveWarehouseLoading,
    AuthorizerAssignmentHistoryLoading,
    ApprovedOrderForWarehouseLoading,
    singleOrderLoading,
    warehousesLoading,
    assignWarehouseLoading,
    isCancelingOrder,
  };
};
