import { useState } from "react";
import {
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import { formatRupee } from "../../utils/formatRupee.js";
import { usePlantheadOrder } from "../../hooks/usePlanthead.js";
import { useForm } from "react-hook-form";
import { MdOutlineCancel } from "react-icons/md";
import { LuTruck } from "react-icons/lu";
import { useTheme } from "../../context/ThemeContext";

const OrdersForPlantHead = () => {
  const { resolvedTheme } = useTheme();
  const [singleOrderId, setSingleOrderId] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openDispatch, setOpenDispatch] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const {
    dispatchOrder,
    singleOrderFromPlanthead,
    singleOrderLoading,
    ordersInPlanthead,
    isDeletingOrder,
    ordersInPlantheadLoading,
    isDispatchingOrder,
    cancelOrder,
    isCancelingOrder,
  } = usePlantheadOrder(singleOrderId);

  const totalBeforeDiscount =
    singleOrderFromPlanthead?.totalAmount /
    (1 - singleOrderFromPlanthead?.discount / 100);

  const reason = watch("reason");

  const [paginationModel, setPaginationModel] = useState(() => {
    const saved = localStorage.getItem("paginationModel");
    return saved ? JSON.parse(saved) : { page: 0, pageSize: 10 };
  });

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
    localStorage.setItem("paginationModel", JSON.stringify(newModel));
  };

  const handleView = (id) => {
    setSingleOrderId(id);
    setOpenView(true);
  };

  const dispatchDocs = watch("dispatchDocs");
  const dispatchDocsFile = dispatchDocs ? dispatchDocs[0] : null;

  const handleOrderDispatch = (data) => {
    const formData = new FormData();
    formData.append("orderId", singleOrderId);
    formData.append("vehicleNumber", data.vehicleNumber);
    formData.append("driverName", data.driverName);
    formData.append("driverContact", data.driverContact);
    formData.append("transportCompany", data.transportCompany);
    formData.append("dispatchDocs", dispatchDocsFile);
    dispatchOrder(formData, { onSuccess: () => setOpenDispatch(false) });
  };

  const handleCancelOrder = (data) => {
    data.orderId = singleOrderId;
    cancelOrder(data, { onSuccess: () => setOpenCancel(false) });
  };

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
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center h-full gap-1">
          <Tooltip title="View order details" enterDelay={500} placement="top">
            <Eye
              className="hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-950 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => handleView(params.row.id)}
            />
          </Tooltip>
          <Tooltip title="Dispatch order" enterDelay={500} placement="top">
            <LuTruck
              className="hover:bg-green-100 text-green-600 dark:hover:bg-green-950 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => {
                setOpenDispatch(true);
                setSingleOrderId(params.row.id);
              }}
            />
          </Tooltip>
          <Tooltip title="Cancel order" enterDelay={500} placement="top">
            <MdOutlineCancel
              className="hover:bg-red-100 text-red-600 dark:hover:bg-red-950 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => {
                setSingleOrderId(params.row.id);
                setOpenCancel(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const rows = ordersInPlanthead?.map((order) => ({
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

  if (
    ordersInPlantheadLoading ||
    isDeletingOrder ||
    singleOrderLoading ||
    isCancelingOrder
  )
    return (
      <div className="flex items-center justify-center h-full w-full">
        <CircularProgress />
      </div>
    );

  return (
    <div className="transition-all rounded-lg mt-5 max-w-full">
      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
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
                <p className="lg:text-xl dark:text-gray-200 text-sm font-bold">
                  Order Details - #{singleOrderFromPlanthead?.orderId}
                </p>
                <IconButton size="small" onClick={() => setOpenView(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
            </div>

            {/* products table */}
            <div className="relative overflow-x-auto mb-5 max-h-52">
              <table className="w-full lg:text-sm text-xs text-left text-gray-500 overflow-auto">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Product Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Price/bag
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="lg:text-sm text-xs text-gray-900 dark:text-gray-300">
                  {singleOrderFromPlanthead?.items?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap"
                      >
                        {item?.product?.name}
                      </th>
                      <td className="px-6 py-4">{item?.product?.category}</td>
                      <td className="px-6 py-4">
                        {formatRupee(item?.product?.price)}
                      </td>
                      <td className="px-6 py-4">{item?.quantity} bags</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid lg:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-7">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Order Information
                  </h1>
                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Placed By:
                    </span>
                    {singleOrderFromPlanthead?.placedBy?.name}
                  </div>
                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Placed Date:
                    </span>
                    {format(singleOrderFromPlanthead?.createdAt, "dd MMM yyyy")}
                  </div>
                </div>
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
                      Discount ({singleOrderFromPlanthead?.discount}%):
                    </span>
                    -
                    {formatRupee(
                      totalBeforeDiscount -
                        singleOrderFromPlanthead?.totalAmount
                    )}
                  </div>
                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Net Total:
                    </span>
                    {formatRupee(singleOrderFromPlanthead?.totalAmount)}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-600">
                    <span className=" text-gray-600 dark:text-gray-300 font-normal">
                      Advance Amount:
                    </span>
                    {formatRupee(singleOrderFromPlanthead?.advanceAmount)}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-red-700 dark:text-red-600">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Due Amount:
                    </span>
                    {formatRupee(singleOrderFromPlanthead?.dueAmount)}
                  </div>
                  {singleOrderFromPlanthead?.advanceAmount > 0 && (
                    <div className="flex items-center text-gray-600 justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Advance Confirmation:
                      </span>
                      {singleOrderFromPlanthead?.advancePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromPlanthead?.advancePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromPlanthead?.advancePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromPlanthead?.advancePaymentStatus ===
                        "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}
                  {singleOrderFromPlanthead?.duePaymentStatus && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Confirmation:
                      </span>
                      {singleOrderFromPlanthead?.duePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromPlanthead?.duePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromPlanthead?.duePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromPlanthead?.duePaymentStatus ===
                        "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Advance Payment Mode:
                    </span>
                    {singleOrderFromPlanthead?.paymentMode}
                  </div>
                  {singleOrderFromPlanthead?.duePaymentMode && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Payment Mode:
                      </span>
                      {singleOrderFromPlanthead?.duePaymentMode}
                    </div>
                  )}
                  {singleOrderFromPlanthead?.dueAmount !== 0 && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Date:
                      </span>
                      {format(singleOrderFromPlanthead?.dueDate, "dd MMM yyyy")}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Order Status
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Order Status:</span>
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
                        }[singleOrderFromPlanthead?.orderStatus] ||
                        "text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
                      }  p-0.5 px-2 rounded-full lg:text-xs text-[10px] font-semibold`}
                    >
                      {singleOrderFromPlanthead?.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Payment Status:</span>
                    {singleOrderFromPlanthead?.paymentStatus ===
                      "PendingDues" && (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Pending Dues
                      </span>
                    )}
                    {singleOrderFromPlanthead?.paymentStatus === "Paid" && (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Paid
                      </span>
                    )}
                    {singleOrderFromPlanthead?.paymentStatus ===
                      "ConfirmationPending" && (
                      <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Confirmation Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Invoice Generated:</span>
                    {singleOrderFromPlanthead?.invoiceGenerated ? (
                      <span className="text-green-800 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        No
                      </span>
                    )}
                  </div>
                  {singleOrderFromPlanthead?.dueInvoiceGenerated && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">
                        Due Invoice Generated:
                      </span>
                      {singleOrderFromPlanthead?.dueInvoiceGenerated ? (
                        <span className="text-green-800 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          No
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-gray-800 text-sm dark:text-gray-200">
                    Shipping Details
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Address:</span>
                    {singleOrderFromPlanthead?.shippingAddress}
                  </div>
                </div>

                {/* assigned warehouse */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-gray-800 text-sm dark:text-gray-200">
                    Assigned Plant
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Plant:</span>
                    {singleOrderFromPlanthead?.assignedWarehouse ? (
                      <div className="flex flex-col items-center">
                        <p>
                          {singleOrderFromPlanthead?.assignedWarehouse?.name}
                        </p>
                        <p className="text-xs font-normal text-gray-600 dark:text-gray-400">
                          (
                          {
                            singleOrderFromPlanthead?.assignedWarehouse
                              ?.location
                          }
                          )
                        </p>
                      </div>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Not Assigned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Plant Approval:</span>
                    {singleOrderFromPlanthead?.approvedBy ? (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Approved
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* notes */}
            <div className="flex flex-col gap-2 lg:text-sm text-xs my-5">
              <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-300">
                Notes
              </h1>
              <p className="bg-yellow-50 dark:bg-yellow-800 rounded-lg p-3 text-gray-800 dark:text-gray-200">
                {singleOrderFromPlanthead?.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- Dispatch Order Modal --- */}
      {openDispatch && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 rounded-lg lg:w-[30%] md:w-[30%] sm:w-[60%] w-[95%] overflow-auto">
            <div className="flex items-center justify-between">
              <p className="lg:text-xl text-base dark:text-gray-200 font-semibold">
                Dispatch Order
              </p>
              <IconButton size="small" onClick={() => setOpenDispatch(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <div className="mt-5">
              <form
                className="space-y-5"
                onSubmit={handleSubmit(handleOrderDispatch)}
              >
                <div>
                  <TextField
                    fullWidth
                    error={!!errors?.driverName}
                    // disabled={singleOrderFromPlanthead?.dueAmount > 0}
                    size="small"
                    label="Driver Name"
                    variant="outlined"
                    {...register("driverName", {
                      required: {
                        value: true,
                        message: "Driver Name is required",
                      },
                    })}
                  />
                  {errors?.driverName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.driverName?.message}
                    </p>
                  )}
                </div>
                <div>
                  <TextField
                    fullWidth
                    error={!!errors?.driverContact}
                    // disabled={singleOrderFromPlanthead?.dueAmount > 0}
                    size="small"
                    type="number"
                    label="Driver Contact"
                    variant="outlined"
                    {...register("driverContact", {
                      required: {
                        value: true,
                        message: "Driver Contact is required",
                      },
                    })}
                  />
                  {errors?.driverContact && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.driverContact?.message}
                    </p>
                  )}
                </div>
                <div>
                  <TextField
                    fullWidth
                    error={!!errors?.vehicleNumber}
                    size="small"
                    label="Vehicle Number"
                    variant="outlined"
                    {...register("vehicleNumber", {
                      required: {
                        value: true,
                        message: "Vehicle Number is required",
                      },
                    })}
                  />
                  {errors?.vehicleNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.vehicleNumber?.message}
                    </p>
                  )}
                </div>
                <div>
                  <TextField
                    fullWidth
                    error={!!errors?.transportCompany}
                    size="small"
                    label="Transport Company"
                    variant="outlined"
                    {...register("transportCompany", {
                      required: {
                        value: true,
                        message: "Transport Company is required",
                      },
                    })}
                  />
                  {errors?.transportCompany && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.transportCompany?.message}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-sm mb-1 dark:text-gray-300 text-gray-600">
                    Upload Dispatch Documents
                  </span>
                  <input
                    className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-gray-500 dark:border-gray-400 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-gray-700 dark:text-gray-200 dark:bg-gray-800 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-gray-100 dark:file:bg-gray-700 file:px-3 file:py-[0.32rem] file:text-gray-700 dark:file:text-gray-200 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-gray-200 dark:hover:file:bg-gray-600 focus:border-primary dark:focus:border-primary focus:text-gray-700 dark:focus:text-gray-200 focus:shadow-te-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    type="file"
                    id="formFileMultiple"
                    multiple
                    {...register("dispatchDocs", {
                      required: {
                        value: true,
                        message: "Dispatch Documents are required",
                      },
                    })}
                  />
                  {errors.dispatchDocs && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.dispatchDocs.message}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-sm dark:text-gray-300 text-gray-600">
                    Shipping Address:{" "}
                    <span className="text-black dark:text-gray-200">
                      {singleOrderFromPlanthead?.shippingAddress}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3 mt-5">
                  <Button
                    variant="outlined"
                    disableElevation
                    size="small"
                    sx={{ textTransform: "none" }}
                    onClick={() => setOpenDispatch(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    // disabled={singleOrderFromPlanthead?.dueAmount > 0}
                    loading={isDispatchingOrder}
                    size="small"
                    loadingPosition="start"
                    variant="contained"
                    disableElevation
                    sx={{ textTransform: "none" }}
                    type="submit"
                  >
                    Dispatch
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {openCancel && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[60%] sm:w-[60%] w-[95%]">
            <p className="lg:text-lg text-base font-semibold dark:text-gray-200">
              Are you sure you want to cancel the order #
              {singleOrderFromPlanthead?.orderId} ?
            </p>
            <p className="lg:text-sm text-xs text-gray-800 my-2 dark:text-gray-200">
              Tell us why you are cancelling this order ?
            </p>
            <form onSubmit={handleSubmit(handleCancelOrder)}>
              <div>
                <TextField
                  error={!!errors.reason}
                  size="small"
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
                  variant="outlined"
                  disableElevation
                  color="error"
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenCancel(false)}
                  size="small"
                >
                  Keep Order
                </Button>
                <Button
                  disabled={!reason}
                  variant="contained"
                  disableElevation
                  color="error"
                  type="Submit"
                  sx={{ textTransform: "none" }}
                  size="small"
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

export default OrdersForPlantHead;
