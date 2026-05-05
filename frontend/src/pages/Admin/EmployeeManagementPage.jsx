import { useState } from "react";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
  Select,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Salesman from "../../components/Admin/EmployeeManagement/Salesman";
import useEmployees from "../../hooks/useEmployees";
import SalesAuthorizer from "../../components/Admin/EmployeeManagement/SalesAuthorizer";
import SalesManager from "../../components/Admin/EmployeeManagement/SalesManager";
import PlantHead from "../../components/Admin/EmployeeManagement/PlantHead";
import Accountant from "../../components/Admin/EmployeeManagement/Accountant";
import { Controller, useForm } from "react-hook-form";
import TotalEmployees from "../../components/Admin/EmployeeManagement/TotalEmployees";
import TotalActiveEmployees from "../../components/Admin/EmployeeManagement/TotalActiveEmployees";
import InactiveEmployees from "../../components/Admin/EmployeeManagement/InactiveEmployees";
import { useAdminOrder } from "../../hooks/useAdminOrders";

const EmployeeManagementPage = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const employeeTypes = [
    "Salesman",
    "Sales Manager",
    "Sales Authorizer",
    "Plant Head",
    "Accountant",
  ];

  const handleEmployeeChange = (value) => {
    setIsActive(value);
  };

  const { orders, ordersLoading } = useAdminOrder();

  const {
    // Salesman
    salesman,
    addSalesman,

    // Sales Manager
    salesmanager,
    addSalesManager,

    // Sales Authorizer
    salesauthorizer,
    addSalesAuthorizer,

    // Plant Head
    planthead,
    addPlantHead,

    // Accountant
    accountant,
    addAccountant,

    // isLoading
    isLoading,
    error,
  } = useEmployees();

  const [searchTerm, setSearchTerm] = useState("");
  const [isActive, setIsActive] = useState("Salesman");
  const [openForm, setOpenForm] = useState(false);

  const totalEmployees =
    salesman?.length +
    salesmanager?.length +
    salesauthorizer?.length +
    planthead?.length +
    accountant?.length;

  const totalActiveEmployees =
    salesman?.filter((item) => item.isActive === true)?.length +
    salesmanager?.filter((item) => item.isActive === true)?.length +
    salesauthorizer?.filter((item) => item.isActive === true)?.length +
    planthead?.filter((item) => item.isActive === true)?.length +
    accountant?.filter((item) => item.isActive === true)?.length;

  const totalInactiveEmployees =
    salesman?.filter((item) => item.isActive === false)?.length +
    salesmanager?.filter((item) => item.isActive === false)?.length +
    salesauthorizer?.filter((item) => item.isActive === false)?.length +
    planthead?.filter((item) => item.isActive === false)?.length +
    accountant?.filter((item) => item.isActive === false)?.length;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const FilteredSalesman = salesman?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const FilteredSalesManager = salesmanager?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const FilteredSalesAuthorizer = salesauthorizer?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const FilteredPlantHead = planthead?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const FilteredAccountant = accountant?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSalesmanStats = (id) => {
    return orders?.reduce(
      (acc, order) => {
        if (order?.placedBy?._id === id) {
          acc.count += 1;
          acc.total += order.totalAmount || 0;
        }
        return acc;
      },
      { count: 0, total: 0 }
    );
  };

  const getSalesManagerStats = (id) => {
    return orders?.reduce(
      (acc, order) => {
        if (order?.forwardedByManager?._id === id) {
          acc.count += 1;
          acc.total += order.totalAmount || 0;
        }
        return acc;
      },
      { count: 0, total: 0 }
    );
  };

  const getSalesAuthorizerStats = (id) => {
    return orders?.reduce(
      (acc, order) => {
        if (order?.approvedBy?._id === id) {
          acc.count += 1;
          acc.total += order.totalAmount || 0;
        }
        return acc;
      },
      { count: 0, total: 0 }
    );
  };

  const getPlantHeadStats = (id) => {
    return orders?.reduce(
      (acc, order) => {
        if (order?.dispatchInfo?.dispatchedBy?._id === id) {
          acc.count += 1;
          acc.total += order.totalAmount || 0;
        }
        return acc;
      },
      { count: 0, total: 0 }
    );
  };

  const getAccountantStats = (id) => {
    return orders?.reduce(
      (acc, order) => {
        if (order?.invoiceDetails?.invoicedBy?._id === id) {
          acc.count += 1;
          acc.total += order.totalAmount || 0;
        }
        return acc;
      },
      { count: 0, total: 0 }
    );
  };

  const onSubmit = (data) => {
    if (data.role === "salesman") {
      addSalesman(data);
    }
    if (data.role === "salesmanager") {
      addSalesManager(data);
    }
    if (data.role === "salesauthorizer") {
      addSalesAuthorizer(data);
    }
    if (data.role === "planthead") {
      addPlantHead(data);
    }
    if (data.role === "accountant") {
      addAccountant(data);
    }
    setOpenForm(false);
  };

  if (isLoading || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="lg:text-3xl md:text-xl font-bold sm:text-lg text-base dark:text-gray-200">
          Employee Management
        </h1>
        <Button
          size="small"
          variant="contained"
          disableElevation
          sx={{
            fontWeight: "600",
            fontSize: isSmDown ? "10px" : "12px",
          }}
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          {isSmDown ? "Add" : "Add Employee"}
        </Button>
      </div>
      <div className="grid lg:grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:gap-7 md:gap-3 sm:gap-3 gap-2 items-center">
        <TotalEmployees total={totalEmployees} />
        <TotalActiveEmployees total={totalActiveEmployees} />
        <InactiveEmployees total={totalInactiveEmployees} />
      </div>
      <div className="mt-5 hidden sm:block lg:block md:block">
        <ButtonGroup
          aria-label="Medium-sized button group"
          size={isMdUp ? "medium" : "small"}
        >
          {employeeTypes.map((employee) => (
            <Button
              key={employee._id}
              disableElevation
              variant={isActive === employee ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
              }}
              onClick={() => setIsActive(employee)}
            >
              {employee}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="mt-5 sm:hidden lg:hidden md:hidden">
        <FormControl size="small" fullWidth>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={isActive}
            onChange={(e) => handleEmployeeChange(e.target.value)}
          >
            {employeeTypes.map((employee) => (
              <MenuItem value={employee}>{employee}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="mt-5">
        <TextField
          fullWidth
          size="small"
          label={`Search ${isActive} by name or email address`}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ---Employee List--- */}
      <div>
        {isActive === "Salesman" && (
          <>
            {FilteredSalesman?.length > 0 ? (
              <div className="mt-5 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3 lg:gap-7 gap-3">
                {FilteredSalesman?.map((item) => (
                  <Salesman
                    key={item._id}
                    item={item}
                    getSalesmanStats={getSalesmanStats}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No Salesman Found
              </div>
            )}
          </>
        )}

        {isActive === "Sales Manager" && (
          <>
            {FilteredSalesManager.length > 0 ? (
              <div className="mt-5 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3 lg:gap-7 gap-3">
                {FilteredSalesManager?.map((item) => (
                  <SalesManager
                    key={item._id}
                    item={item}
                    getSalesManagerStats={getSalesManagerStats}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No Sales Manager Found
              </div>
            )}
          </>
        )}

        {isActive === "Sales Authorizer" && (
          <>
            {FilteredSalesAuthorizer.length > 0 ? (
              <div className="mt-5 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3 lg:gap-7 gap-3">
                {FilteredSalesAuthorizer?.map((item) => (
                  <SalesAuthorizer
                    key={item._id}
                    item={item}
                    getSalesAuthorizerStats={getSalesAuthorizerStats}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No Sales Authorizer Found
              </div>
            )}
          </>
        )}

        {isActive === "Plant Head" && (
          <>
            {FilteredPlantHead.length > 0 ? (
              <div className="mt-5 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3 lg:gap-7 gap-3">
                {FilteredPlantHead?.map((item) => (
                  <PlantHead
                    key={item._id}
                    item={item}
                    getPlantHeadStats={getPlantHeadStats}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No Plant Head Found
              </div>
            )}
          </>
        )}

        {isActive === "Accountant" && (
          <>
            {FilteredAccountant.length > 0 ? (
              <div className="mt-5 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3 lg:gap-7 gap-3">
                {FilteredAccountant?.map((item) => (
                  <Accountant
                    key={item._id}
                    item={item}
                    getAccountantStats={getAccountantStats}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No Accountant Found
              </div>
            )}
          </>
        )}
      </div>

      {/* --- Add Employee Form --- */}
      {openForm && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[50%] sm:w-[60%] w-[95%]">
            <p className="lg:text-lg text-base font-semibold mb-5 dark:text-gray-200">
              Add Employee
            </p>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <FormControl
                fullWidth
                size="small"
                error={!!errors.role}
                className="mb-4"
              >
                <InputLabel id="role-label">Role</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  defaultValue="salesman"
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="role-label"
                      id="role"
                      label="Role"
                    >
                      <MenuItem value="salesman">Salesman</MenuItem>
                      <MenuItem value="salesmanager">Sales Manager</MenuItem>
                      <MenuItem value="salesauthorizer">
                        Sales Authorizer
                      </MenuItem>
                      <MenuItem value="planthead">Plant Head</MenuItem>
                      <MenuItem value="accountant">Accountant</MenuItem>
                    </Select>
                  )}
                />
                {errors?.role && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.role.message}
                  </span>
                )}
              </FormControl>
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Name"
                variant="outlined"
                {...register("name", {
                  required: { value: true, message: "Name is required" },
                })}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Email"
                variant="outlined"
                {...register("email", {
                  required: { value: true, message: "Email is required" },
                })}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Password"
                variant="outlined"
                {...register("password", {
                  required: { value: true, message: "Password is required" },
                })}
              />
              <TextField
                size="small"
                fullWidth
                type="number"
                id="outlined-basic"
                label="Phone"
                variant="outlined"
                {...register("phone", {
                  required: { value: true, message: "Phone is required" },
                })}
              />
              <div className="flex items-center justify-end gap-3 mt-5">
                <Button
                  size="small"
                  variant="outlined"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  type="submit"
                >
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
