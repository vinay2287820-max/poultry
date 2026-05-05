import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const useEmployees = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // GET Salesman
  const {
    data: salesman,
    isPending: salesmanLoading,
    error: salesmanError,
  } = useQuery({
    queryKey: ["salesman"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.SALESMAN.GET_ALL,
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

  // GET Sales Manager
  const {
    data: salesmanager,
    isPending: salesmanagerLoading,
    error: salesmanagerError,
  } = useQuery({
    queryKey: ["salesmanager"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.SALES_MANAGER.GET_ALL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
  });

  // GET Sales Authorizer
  const {
    data: salesauthorizer,
    isPending: salesauthorizerLoading,
    error: salesauthorizerError,
  } = useQuery({
    queryKey: ["salesauthorizer"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.SALES_AUTHORIZER.GET_ALL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
  });

  // GET Plant Head
  const {
    data: planthead,
    isPending: plantheadLoading,
    error: plantheadError,
  } = useQuery({
    queryKey: ["planthead"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.PLANT_HEAD.GET_ALL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
  });

  // GET Accountant
  const {
    data: accountant,
    isPending: accountantLoading,
    error: accountantError,
  } = useQuery({
    queryKey: ["accountant"],
    queryFn: async () => {
      const response = await axios.get(
        BASE_URL + API_PATHS.ADMIN.ACCOUNTANT.GET_ALL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
  });

  //--------------Deleting Employees------------------->
  // DELETE Salesman
  const { mutate: deleteSalesman, isPending: isDeletingSalesman } = useMutation(
    {
      mutationFn: async (id) => {
        const response = await axios.delete(
          BASE_URL + API_PATHS.ADMIN.SALESMAN.DELETE(id),
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
          queryKey: ["salesman"],
        });
        toast.success("Salesman deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete Salesman");
      },
    }
  );

  // DELETE Sales Manager
  const { mutate: deleteSalesManager, isPending: isDeletingSalesManager } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.delete(
          BASE_URL + API_PATHS.ADMIN.SALES_MANAGER.DELETE(id),
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
          queryKey: ["salesmanager"],
        });
        toast.success("Sales Manager deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete Sales Manager");
      },
    });

  // DELETE Sales Authorizer
  const {
    mutate: deleteSalesAuthorizer,
    isPending: isDeletingSalesAuthorizer,
  } = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(
        BASE_URL + API_PATHS.ADMIN.SALES_AUTHORIZER.DELETE(id),
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
        queryKey: ["salesauthorizer"],
      });
      toast.success("Sales Authorizer deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete Sales Authorizer");
    },
  });

  // DELETE Plant Head
  const { mutate: deletePlantHead, isPending: isDeletingPlantHead } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.delete(
          BASE_URL + API_PATHS.ADMIN.PLANT_HEAD.DELETE(id),
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
          queryKey: ["planthead"],
        });
        toast.success("Plant Head deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete Plant Head");
      },
    });

  // DELETE Accountant
  const { mutate: deleteAccountant, isPending: isDeletingAccountant } =
    useMutation({
      mutationFn: async (id) => {
        const response = await axios.delete(
          BASE_URL + API_PATHS.ADMIN.ACCOUNTANT.DELETE(id),
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
          queryKey: ["accountant"],
        });
        toast.success("Accountant deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete Accountant");
      },
    });

  //--------------Adding Employee------------------->
  // ADD Salesman
  const { mutate: addSalesman, isPending: isAddingSalesman } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.ADMIN.SALESMAN.ADD,
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
        queryKey: ["salesman"],
      });
      toast.success("Salesman added successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
      console.log(error);
    },
  });

  // ADD Sales Manager
  const { mutate: addSalesManager, isPending: isAddingSalesManager } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.post(
          BASE_URL + API_PATHS.ADMIN.SALES_MANAGER.ADD,
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
          queryKey: ["salesmanager"],
        });
        toast.success("Sales Manager added successfully");
      },
      onError: (error) => {
        toast.error(error.response.data.message);
        console.log(error);
      },
    });

  // ADD Sales Authorizer
  const { mutate: addSalesAuthorizer, isPending: isAddingSalesAuthorizer } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.post(
          BASE_URL + API_PATHS.ADMIN.SALES_AUTHORIZER.ADD,
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
          queryKey: ["salesauthorizer"],
        });
        toast.success("Sales Authorizer added successfully");
      },
      onError: (error) => {
        toast.error(error.response.data.message);
        console.log(error);
      },
    });

  // ADD Plant Head
  const { mutate: addPlantHead, isPending: isAddingPlantHead } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.ADMIN.PLANT_HEAD.ADD,
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
        queryKey: ["planthead"],
      });
      toast.success("Plant Head added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add Plant Head");
      console.log(error);
    },
  });

  // ADD Accountant
  const { mutate: addAccountant, isPending: isAddingAccountant } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        BASE_URL + API_PATHS.ADMIN.ACCOUNTANT.ADD,
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
        queryKey: ["accountant"],
      });
      toast.success("Accountant added successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
      console.log(error);
    },
  });

  // Update Employee ---------------------------->
  // UPDATE Salesman
  const { mutate: updateSalesman, isPending: isUpdatingSalesman } = useMutation(
    {
      mutationFn: async (data) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.ADMIN.SALESMAN.UPDATE(data.id),
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
          queryKey: ["salesman"],
        });
        toast.success("Salesman updated successfully");
      },
      onError: (error) => {
        toast.error(error.response.data.message);
        console.log(error);
      },
    }
  );

  // UPDATE Sales Manager
  const { mutate: updateSalesManager, isPending: isUpdatingSalesManager } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.ADMIN.SALES_MANAGER.UPDATE(data.id),
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
          queryKey: ["salesmanager"],
        });
        toast.success("Sales Manager updated successfully");
      },
      onError: (error) => {
        toast.error(error.response.data.message);
        console.log(error);
      },
    });

  // UPDATE Sales Authorizer
  const {
    mutate: updateSalesAuthorizer,
    isPending: isUpdatingSalesAuthorizer,
  } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(
        BASE_URL + API_PATHS.ADMIN.SALES_AUTHORIZER.UPDATE(data.id),
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
        queryKey: ["salesauthorizer"],
      });
      toast.success("Sales Authorizer updated successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
      console.log(error);
    },
  });

  // UPDATE Plant Head
  const { mutate: updatePlantHead, isPending: isUpdatingPlantHead } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.ADMIN.PLANT_HEAD.UPDATE(data.id),
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
          queryKey: ["planthead"],
        });
        toast.success("Plant Head updated successfully");
      },
      onError: (error) => {
        toast.error(error.response.data.message);
        console.log(error);
      },
    });

  // UPDATE Accountant
  const { mutate: updateAccountant, isPending: isUpdatingAccountant } =
    useMutation({
      mutationFn: async (data) => {
        const response = await axios.put(
          BASE_URL + API_PATHS.ADMIN.ACCOUNTANT.UPDATE(data.id),
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
          queryKey: ["accountant"],
        });
        toast.success("Accountant updated successfully");
      },
      onError: (error) => {
        toast.error(error.response.data.message);
        console.log(error);
      },
    });

  const isLoading =
    salesmanLoading ||
    salesmanagerLoading ||
    salesauthorizerLoading ||
    plantheadLoading ||
    accountantLoading ||
    isAddingSalesman ||
    isAddingSalesManager ||
    isAddingSalesAuthorizer ||
    isAddingPlantHead ||
    isAddingAccountant ||
    isDeletingSalesman ||
    isDeletingSalesManager ||
    isDeletingSalesAuthorizer ||
    isDeletingPlantHead ||
    isDeletingAccountant ||
    isUpdatingSalesman ||
    isUpdatingSalesManager ||
    isUpdatingSalesAuthorizer ||
    isUpdatingPlantHead ||
    isUpdatingAccountant;

  return {
    // Salesman
    salesman,
    addSalesman,
    updateSalesman,
    deleteSalesman,

    // Sales Manager
    salesmanager,
    addSalesManager,
    deleteSalesManager,
    updateSalesManager,

    // Sales Authorizer
    salesauthorizer,
    addSalesAuthorizer,
    deleteSalesAuthorizer,
    updateSalesAuthorizer,

    // Plant Head
    planthead,
    addPlantHead,
    deletePlantHead,
    updatePlantHead,

    // Accountant
    accountant,
    addAccountant,
    deleteAccountant,
    updateAccountant,

    // isLoading
    isLoading,
  };
};

export default useEmployees;
