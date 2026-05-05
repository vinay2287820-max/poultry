import { useState } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { BadgeCheck, BadgeX, CheckIcon, Eye, X } from "lucide-react";
import { format } from "date-fns";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import { MdOutlineCancel } from "react-icons/md";
import { formatRupee } from "../../../utils/formatRupee.js";
import { Controller, useForm } from "react-hook-form";
import { useSalesAuthorizerOrder } from "../../../hooks/useSalesAuthorizerOrder.js";
import { useUser } from "../../../hooks/useUser.js";
import { useTheme as useThemeContext } from "../../../context/ThemeContext.jsx";

const OrdersForAuthorizer = () => {
  const { resolvedTheme } = useThemeContext();
  const [singleOrderId, setSingleOrderId] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const { user } = useUser();

  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();

  const reason = watch("reason");

  const {
    allWarehouses,
    approveWarehouse,
    approveWarehouseLoading,
    assignWarehouseToOrder,
    warehousesLoading,
    ordersInSalesAuthorizer,
    ordersInSalesAuthorizerLoading,
    singleOrderFromSalesauthorizer,
    singleOrderLoading,
    cancelOrder,
    isCancelingOrder,
  } = useSalesAuthorizerOrder(singleOrderId);

  const [paginationModel, setPaginationModel] = useState(() => {
    const saved = localStorage.getItem("paginationModel");
    return saved ? JSON.parse(saved) : { page: 0, pageSize: 10 };
  });

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
    localStorage.setItem("paginationModel", JSON.stringify(newModel));
  };

  const totalBeforeDiscount =
    singleOrderFromSalesauthorizer?.totalAmount /
    (1 - singleOrderFromSalesauthorizer?.discount / 100);

  const handleAssignWarehouse = (data) => {
    data.orderId = singleOrderId;
    console.log(data);
    assignWarehouseToOrder(data);
    setOpenView(false);
  };

  const handleView = (id) => {
    console.log(id);
    setSingleOrderId(id);
    setOpenView(true);
  };

  const handleCancelOrder = (data) => {
    data.orderId = singleOrderId;
    console.log(data);
    cancelOrder(data);
    setOpenCancel(false);
  };

  if (
    singleOrderLoading ||
    ordersInSalesAuthorizerLoading ||
    warehousesLoading ||
    isCancelingOrder
  )
    return (
      <div className="flex-1 flex items-center justify-center h-full w-full">
        <CircularProgress />
      </div>
    );

  const ProductsCell = ({ items }) => {
    return (
      <div className="w-full">
        <table className="w-full table-auto">
          <thead className="border-b border-gray-200 dark:border-gray-600 dark:text-gray-300 text-black">
            <tr>
              <th className="text-left font-bold uppercase text-xs">Product</th>
              <th className="text-right font-bold uppercase text-xs">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {items?.map((p, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-950"
                }`}
              >
                <td className="text-left">{p?.product?.name}</td>
                <td className="text-right">{p?.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const columns = [
    {
      field: "orderId",
      headerName: "Order ID",
      flex: 1,
      minWidth: 80,
      maxWidth: 100,
    },
    {
      field: "product",
      headerName: "Product",
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <div className="w-full h-full">
          <ProductsCell items={params.row.product} />
        </div>
      ),
    },
    { field: "party", headerName: "Party", flex: 1, minWidth: 100 },
    { field: "date", headerName: "Date", flex: 1, minWidth: 100 },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "advanceAmount",
      headerName: "Advance Amount",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span
          className={`${
            params.value !== "₹0" && "text-green-700 dark:text-green-500"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "dueAmount",
      headerName: "Due Amount",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span
          className={`${
            params.value !== "₹0" && "text-red-600 dark:text-red-500"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "orderStatus",
      headerName: "Status",
      flex: 1,
      minWidth: 170,
      renderCell: (params) => (
        <span
          className={`${
            {
              Placed:
                "text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800",
              ForwardedToAuthorizer:
                "text-violet-800 dark:text-violet-200 bg-violet-100 dark:bg-violet-800",
              WarehouseAssigned:
                "text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800",
              Approved:
                "text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-800",
              ForwardedToPlantHead:
                "text-violet-900 dark:text-violet-200 bg-violet-100 dark:bg-violet-800",
              Dispatched:
                "text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800",
              Delivered:
                "text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800",
              Cancelled:
                "text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-800",
            }[params.value] ||
            "text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
          } p-1 px-3 rounded-full text-xs font-semibold`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center h-full gap-1">
          <Tooltip title="View order details" enterDelay={500} placement="top">
            <Eye
              className="hover:bg-blue-100 text-blue-500 cursor-pointer dark:hover:bg-blue-950 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => handleView(params.row.id)}
            />
          </Tooltip>
          <Tooltip title="Cancel order" enterDelay={500} placement="top">
            {user.isActive ? (
              <MdOutlineCancel
                className="hover:bg-red-100 text-red-600 cursor-pointer dark:hover:bg-red-950 active:scale-95 transition-all p-1.5 rounded-lg"
                size={30}
                onClick={() => {
                  setSingleOrderId(params.row.id);
                  setOpenCancel(true);
                }}
              />
            ) : (
              <MdOutlineCancel
                color="gray"
                className="p-1.5 rounded-lg cursor-ns-resize"
                size={30}
                onClick={() => {
                  setSingleOrderId(params.row.id);
                  setOpenCancel(true);
                }}
              />
            )}
          </Tooltip>
        </div>
      ),
    },
  ];

  const rows = ordersInSalesAuthorizer?.map((order) => ({
    id: order._id,
    orderId: `#${order.orderId}`,
    party: order?.party?.companyName,
    date: format(order?.createdAt, "dd MMM yyyy"),
    product: order?.items,
    quantity: order?.items?.map((p) => `${p.quantity} bags`).join(", "),
    totalAmount: formatRupee(order.totalAmount),
    advanceAmount: formatRupee(order.advanceAmount),
    dueAmount: formatRupee(order.dueAmount),
    orderStatus: order.orderStatus,
  }));

  return (
    <div className="transition-all rounded-lg mt-5 max-w-full">
      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        pagination
        autoHeight
        disableColumnResize={false}
        getRowHeight={() => "auto"}
        sx={{
          width: "100%",
          borderRadius: "6px",
          borderColor: resolvedTheme === "dark" ? "transparent" : "#e5e7eb",
          backgroundColor: resolvedTheme === "dark" ? "#0f172a" : "#fff",
          color: resolvedTheme === "dark" ? "#e5e7eb" : "#111827",

          // 🔹 Header Row Background
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor:
              resolvedTheme === "dark"
                ? "#1e293b !important"
                : "#f9fafb !important",
            color: resolvedTheme === "dark" ? "#f1f5f9" : "#000",
          },

          // 🔹 Header Cell
          "& .MuiDataGrid-columnHeader": {
            backgroundColor:
              resolvedTheme === "dark"
                ? "#1e293b !important"
                : "#f9fafb !important",
            color: resolvedTheme === "dark" ? "#9ca3af" : "#000",
          },

          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "600",
            textTransform: "uppercase",
            fontSize: "12px",
          },

          // ❌ Remove blue outline when cell is active/focused
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },

          // 🔹 Hover row (lighter shade)
          "& .MuiDataGrid-row:hover": {
            backgroundColor:
              resolvedTheme === "dark"
                ? "rgba(59,130,246,0.1)"
                : "rgba(59,130,246,0.05)",
            transition: "background-color 0.2s ease-in-out",
          },

          // 🔹 Pagination buttons
          "& .MuiTablePagination-root": {
            color: resolvedTheme === "dark" ? "#e5e7eb" : "#111827",
          },

          "& .MuiPaginationItem-root": {
            borderRadius: "6px",
            color: resolvedTheme === "dark" ? "#e5e7eb" : "#111827",
          },

          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: resolvedTheme === "dark" ? "#1e40af" : "#2563eb",
            color: "#fff",
          },

          "& .MuiPaginationItem-root:hover": {
            backgroundColor: resolvedTheme === "dark" ? "#1e3a8a" : "#dbeafe",
          },

          // ✅ Add these styles for multi-line rows:
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            padding: "8px",
            lineHeight: "normal",
            overflowY: "auto",

            scrollbarColor: "#80808040 transparent",
            scrollbarWidth: "thin",
            scrollbarGutter: "stable",

            borderColor: resolvedTheme === "dark" ? "#374151" : "#e5e7eb",
            backgroundColor: resolvedTheme === "dark" ? "#0f172a" : "#fff",
            color: resolvedTheme === "dark" ? "#9ca3af" : "#000",

            "&::-webkit-scrollbar": {
              width: "4px",
              height: "4px",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#80808080",
              borderRadius: "4px",
            },

            "&::-webkit-scrollbar-button:single-button": {
              display: "none",
              width: "0px",
              height: "0px",
              background: "transparent",
              border: "none",
            },

            "&::-webkit-scrollbar-button": {
              display: "none",
              width: 0,
              height: 0,
              background: "transparent",
            },
          },

          "& .MuiDataGrid-row": {
            maxHeight: "100px !important",
            minHeight: "50px !important",
          },
        }}
      />

      {/* --- View Order Modal --- */}

      {openView && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 rounded-lg lg:max-w-[60%] lg:min-w-[50%] lg:max-h-[95%] w-[95%] max-h-[95%] overflow-auto">
            <div className="lg:mb-5 mb-2">
              <div className="flex items-center justify-between">
                <p className="lg:text-xl text-sm font-bold dark:text-gray-200">
                  Order Details - #{singleOrderFromSalesauthorizer?.orderId}
                </p>

                {/* Desktop Assign Plant */}
                <div className="w-64 hidden md:block sm:block lg:block">
                  {singleOrderFromSalesauthorizer?.orderStatus ===
                    "ForwardedToAuthorizer" && (
                    <form
                      className="flex items-center gap-2"
                      onSubmit={handleSubmit(handleAssignWarehouse)}
                    >
                      <FormControl fullWidth size="small">
                        <InputLabel id="item-label">Assign Plant</InputLabel>
                        <Controller
                          disabled={!user.isActive}
                          name="warehouseId"
                          control={control}
                          rules={{ required: "Plant is required" }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId="warehouse-label"
                              id="warehouseId"
                              label="Assign Plant"
                            >
                              <MenuItem>Select Plant</MenuItem>
                              {allWarehouses?.map((warehouse) => (
                                <MenuItem
                                  key={warehouse._id}
                                  value={warehouse._id}
                                >
                                  {warehouse.name}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors?.warehouse && (
                          <span className="text-red-600 text-xs mt-1">
                            {errors.warehouse?.message}
                          </span>
                        )}
                      </FormControl>
                      <Button
                        disabled={!user.isActive}
                        size="small"
                        variant="outlined"
                        type="submit"
                      >
                        Assign
                      </Button>
                    </form>
                  )}
                </div>

                <IconButton size="small" onClick={() => setOpenView(false)}>
                  <CloseIcon />
                </IconButton>
              </div>

              {/* Mobile Assign Plant */}
              <div className="lg:hidden md:hidden sm:hidden w-full mt-3">
                {singleOrderFromSalesauthorizer?.orderStatus ===
                  "ForwardedToAuthorizer" && (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={handleSubmit(handleAssignWarehouse)}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel id="item-label">Assign Plant</InputLabel>
                      <Controller
                        disabled={!user.isActive}
                        name="warehouseId"
                        control={control}
                        rules={{ required: "Plant is required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelId="warehouse-label"
                            id="warehouseId"
                            label="Assign Plant"
                          >
                            <MenuItem>Select Plant</MenuItem>
                            {allWarehouses?.map((warehouse) => (
                              <MenuItem
                                key={warehouse._id}
                                value={warehouse._id}
                              >
                                {warehouse.name}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors?.warehouse && (
                        <span className="text-red-600 text-xs mt-1">
                          {errors.warehouse?.message}
                        </span>
                      )}
                    </FormControl>

                    <Button
                      disabled={!user.isActive}
                      size="small"
                      variant="outlined"
                      type="submit"
                    >
                      Assign
                    </Button>
                  </form>
                )}
              </div>

              {/* Mobile Plant Approve Buttons */}
              <div className="sm:hidden md:hidden lg:hidden">
                {singleOrderFromSalesauthorizer?.orderStatus ===
                  "WarehouseAssigned" && (
                  <div className="flex items-center gap-3 justify-center">
                    <Button
                      disabled={!user.isActive}
                      loading={approveWarehouseLoading}
                      variant="contained"
                      color="success"
                      disableElevation
                      sx={{
                        fontSize: "12px",
                        textTransform: "none",
                        padding: "2px 10px",
                        borderRadius: "999px",
                      }}
                      startIcon={<BadgeCheck size={15} />}
                      onClick={() => {
                        approveWarehouse(singleOrderId);
                        setOpenView(false);
                      }}
                    >
                      Approve Plant
                    </Button>

                    <Button
                      disabled={!user.isActive}
                      variant="outlined"
                      color="error"
                      disableElevation
                      sx={{
                        textTransform: "none",
                        fontSize: "12px",
                        padding: "2px 10px",
                        borderRadius: "999px",
                      }}
                      startIcon={<BadgeX size={15} />}
                    >
                      Reject Plant
                    </Button>
                  </div>
                )}
              </div>

              {/* Products Table */}
              <div className="relative overflow-x-auto lg:mb-5 my-3 max-h-52">
                <table className="w-full lg:text-sm text-xs text-left text-gray-500 dark:text-gray-300 overflow-auto">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 z-10">
                    <tr>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Price/bag</th>
                      <th className="px-6 py-3">Quantity</th>
                    </tr>
                  </thead>

                  <tbody className="lg:text-sm text-xs">
                    {singleOrderFromSalesauthorizer?.items?.map((item) => (
                      <tr
                        key={item._id}
                        className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                      >
                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap">
                          {item?.product?.name}
                        </th>
                        <td className="px-6 py-4 dark:text-gray-300">
                          {item?.product?.category}
                        </td>
                        <td className="px-6 py-4 dark:text-gray-300">
                          {formatRupee(item?.product?.price)}
                        </td>
                        <td className="px-6 py-4 dark:text-gray-300">
                          {item?.quantity} bags
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Sections */}
            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-7">
              {/* LEFT SIDE */}
              <div className="flex flex-col gap-5">
                {/* Order Info */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Order Information
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Placed By:
                    </span>
                    {singleOrderFromSalesauthorizer?.placedBy?.name}
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Placed Date:
                    </span>
                    {format(
                      singleOrderFromSalesauthorizer?.createdAt,
                      "dd MMM yyyy"
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Payment Information
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Subtotal:
                    </span>
                    {formatRupee(totalBeforeDiscount)}
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Discount ({singleOrderFromSalesauthorizer?.discount}%):
                    </span>
                    -
                    {formatRupee(
                      (
                        totalBeforeDiscount -
                        singleOrderFromSalesauthorizer?.totalAmount
                      ).toFixed(2)
                    )}
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Net Total:
                    </span>
                    {formatRupee(singleOrderFromSalesauthorizer?.totalAmount)}
                  </div>

                  <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-600">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Advance Amount:
                    </span>
                    {formatRupee(singleOrderFromSalesauthorizer?.advanceAmount)}
                  </div>

                  <div className="flex items-center justify-between font-semibold text-red-700 dark:text-red-600">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Due Amount:
                    </span>
                    {formatRupee(singleOrderFromSalesauthorizer?.dueAmount)}
                  </div>

                  {/* Advance Status */}
                  {singleOrderFromSalesauthorizer?.advanceAmount > 0 && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Advance Payment Approval:
                      </span>

                      {singleOrderFromSalesauthorizer?.advancePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromSalesauthorizer?.advancePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromSalesauthorizer?.advancePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromSalesauthorizer?.advancePaymentStatus ===
                        "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}

                  {/* Due status */}
                  {singleOrderFromSalesauthorizer?.duePaymentStatus && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Payment Approval:
                      </span>

                      {singleOrderFromSalesauthorizer?.duePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromSalesauthorizer?.duePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromSalesauthorizer?.duePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromSalesauthorizer?.duePaymentStatus ===
                        "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Advance Payment Mode:
                    </span>
                    {singleOrderFromSalesauthorizer?.paymentMode}
                  </div>

                  {singleOrderFromSalesauthorizer?.duePaymentMode && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Payment Mode:
                      </span>
                      {singleOrderFromSalesauthorizer?.duePaymentMode}
                    </div>
                  )}

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Due Date:
                    </span>
                    {format(
                      singleOrderFromSalesauthorizer?.dueDate,
                      "dd MMM yyyy"
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col gap-5">
                {/* Order Status */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Order Status
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Order Status:
                    </span>
                    <span
                      className={`${
                        {
                          Placed:
                            "text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800",
                          ForwardedToAuthorizer:
                            "text-violet-800 dark:text-violet-200 bg-violet-100 dark:bg-violet-800",
                          WarehouseAssigned:
                            "text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800",
                          Approved:
                            "text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-800",
                          ForwardedToPlantHead:
                            "text-violet-900 dark:text-violet-200 bg-violet-100 dark:bg-violet-800",
                          Dispatched:
                            "text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800",
                          Delivered:
                            "text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800",
                          Cancelled:
                            "text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-800",
                        }[singleOrderFromSalesauthorizer?.orderStatus] ||
                        "text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
                      }  p-0.5 px-2 rounded-full lg:text-xs text-[10px] font-semibold`}
                    >
                      {singleOrderFromSalesauthorizer?.orderStatus}
                    </span>
                  </div>

                  {/* Payment status */}
                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Payment Status:
                    </span>

                    {singleOrderFromSalesauthorizer?.paymentStatus ===
                      "PendingDues" && (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Pending Dues
                      </span>
                    )}

                    {singleOrderFromSalesauthorizer?.paymentStatus ===
                      "Paid" && (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Paid
                      </span>
                    )}

                    {singleOrderFromSalesauthorizer?.paymentStatus ===
                      "ConfirmationPending" && (
                      <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Confirmation Pending
                      </span>
                    )}
                  </div>

                  {/* Invoice */}
                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Invoice Generated:
                    </span>

                    {singleOrderFromSalesauthorizer?.invoiceGenerated ? (
                      <span className="text-green-800 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        No
                      </span>
                    )}
                  </div>

                  {/* Due invoice */}
                  {singleOrderFromSalesauthorizer?.dueInvoiceGenerated && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Invoice Generated:
                      </span>

                      {singleOrderFromSalesauthorizer?.dueInvoiceGenerated ? (
                        <span className="text-green-800 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          No
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Shipping Details */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Shipping Details
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Address:
                    </span>
                    {singleOrderFromSalesauthorizer?.shippingAddress}
                  </div>
                </div>

                {/* Assigned Plant */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <div className="flex justify-between">
                    <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                      Assigned Plant
                    </h1>

                    {/* Desktop Approve/Reject */}
                    <div className="hidden sm:block md:block lg:block">
                      {singleOrderFromSalesauthorizer?.orderStatus ===
                        "WarehouseAssigned" && (
                        <div className="flex items-center gap-3">
                          <Button
                            disabled={!user.isActive}
                            loading={approveWarehouseLoading}
                            variant="contained"
                            color="success"
                            disableElevation
                            sx={{
                              fontSize: "12px",
                              textTransform: "none",
                              padding: "2px 10px",
                              borderRadius: "999px",
                            }}
                            onClick={() => {
                              approveWarehouse(singleOrderId);
                              setOpenView(false);
                            }}
                          >
                            Approve
                          </Button>

                          <Button
                            disabled={!user.isActive}
                            variant="outlined"
                            color="error"
                            disableElevation
                            sx={{
                              textTransform: "none",
                              fontSize: "12px",
                              padding: "2px 10px",
                              borderRadius: "999px",
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Plant:
                    </span>

                    {singleOrderFromSalesauthorizer?.assignedWarehouse ? (
                      <div className="flex flex-col items-center">
                        <p className="dark:text-gray-200">
                          {
                            singleOrderFromSalesauthorizer?.assignedWarehouse
                              ?.name
                          }
                        </p>

                        <p className="text-xs font-normal text-gray-600 dark:text-gray-400">
                          (
                          {
                            singleOrderFromSalesauthorizer?.assignedWarehouse
                              ?.location
                          }
                          )
                        </p>
                      </div>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Not Assigned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Plant Approval:
                    </span>

                    {singleOrderFromSalesauthorizer?.approvedBy ? (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Approved
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2 text-sm mt-5">
              <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-300">
                Notes
              </h1>

              <div className="bg-yellow-50 dark:bg-yellow-800 rounded-lg p-3 w-full">
                <p className="break-words whitespace-normal text-xs dark:text-gray-100">
                  {singleOrderFromSalesauthorizer?.notes}
                </p>
              </div>
            </div>

            {/* Dispatch Info */}
            {singleOrderFromSalesauthorizer?.dispatchInfo && (
              <div className="flex flex-col gap-2 text-sm bg-green-50 dark:bg-green-800 p-3 rounded-lg mt-5">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Dispatch Info
                </h1>

                <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 lg:gap-7 md:gap-7 sm:gap-7 gap-2">
                  <div className="flex flex-col gap-2 text-sm dark:text-gray-300">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Driver Name
                      </span>
                      {singleOrderFromSalesauthorizer?.dispatchInfo?.driverName}
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Driver Contact
                      </span>
                      {
                        singleOrderFromSalesauthorizer?.dispatchInfo
                          ?.driverContact
                      }
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Transport Company:
                      </span>
                      {
                        singleOrderFromSalesauthorizer?.dispatchInfo
                          ?.transportCompany
                      }
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Vehicle Number:
                      </span>
                      {
                        singleOrderFromSalesauthorizer?.dispatchInfo
                          ?.vehicleNumber
                      }
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-sm dark:text-gray-300">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Dispatched By:
                      </span>
                      {
                        singleOrderFromSalesauthorizer?.dispatchInfo
                          ?.dispatchedBy?.name
                      }
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Plant Head Contact:
                      </span>
                      {
                        singleOrderFromSalesauthorizer?.dispatchInfo
                          ?.dispatchedBy?.phone
                      }
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Dispatched Date:
                      </span>
                      {format(
                        singleOrderFromSalesauthorizer?.dispatchInfo
                          ?.dispatchDate,
                        "dd MMM yyyy"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {openCancel && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[60%] w-[95%]">
            <p className="lg:text-lg dark:text-gray-200 text-base font-semibold">
              Are you sure you want to cancel the order #
              {singleOrderFromSalesauthorizer?.orderId} ?
            </p>
            <p className="lg:text-sm dark:text-gray-400 text-xs text-gray-800 my-2">
              Tell us why you are cancelling this order ?
            </p>
            <form onSubmit={handleSubmit(handleCancelOrder)}>
              <div>
                <TextField
                  size="small"
                  error={!!errors.reason}
                  label="Reason"
                  variant="outlined"
                  fullWidth
                  {...register("reason", {
                    required: "Reason is required",
                  })}
                />
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.reason.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 mt-5">
                <Button
                  size="small"
                  variant="outlined"
                  disableElevation
                  color="error"
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenCancel(false)}
                >
                  Keep Order
                </Button>
                <Button
                  size="small"
                  disabled={!reason}
                  variant="contained"
                  disableElevation
                  color="error"
                  type="Submit"
                  sx={{ textTransform: "none" }}
                >
                  Cancel Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersForAuthorizer;
