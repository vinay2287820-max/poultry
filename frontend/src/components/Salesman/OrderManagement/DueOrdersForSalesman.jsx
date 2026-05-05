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
import { Eye, File } from "lucide-react";
import { format } from "date-fns";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import { formatRupee } from "../../../utils/formatRupee.js";
import { useSalesmanOrder } from "../../../hooks/useSalesmanOrder.js";
import { CgCreditCard } from "react-icons/cg";
import { Controller, useForm } from "react-hook-form";
import { MdOutlineCancel } from "react-icons/md";
import { useTheme } from "../../../context/ThemeContext.jsx";

const DueOrdersForSalesman = () => {
  const { resolvedTheme } = useTheme();
  const [singleOrderId, setSingleOrderId] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openUpdatePayment, setOpenUpdatePayment] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm();

  const reason = watch("reason");

  const {
    singleOrderFromSalesman,
    singleOrderLoading,
    dueOrdersInSalesman,
    dueOrdersInSalesmanLoading,
    cancelOrder,
    updatePayment,
    isUpdatingPayment,
    isCancelingOrder,
  } = useSalesmanOrder(singleOrderId);

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

  const handleOpenInvoice = (id) => {
    setSingleOrderId(id);
    setOpenInvoice(true);
  };

  const handleCancelOrder = (data) => {
    data.orderId = singleOrderId;
    cancelOrder(data);
    setOpenCancel(false);
  };

  const handleUpdatePayment = (data) => {
    data.orderId = singleOrderId;
    updatePayment(data);
    setOpenUpdatePayment(false);
    setValue("amount", "");
    setValue("paymentMode", "");
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
          <Eye
            className="hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-950 active:scale-95 transition-all p-1.5 rounded-lg"
            size={30}
            onClick={() => handleView(params.row.id)}
          />
          {params.row.paymentStatus !== "Paid" &&
            params.row.orderStatus !== "Delivered" &&
            params.row.orderStatus !== "Cancelled" && (
              <CgCreditCard
                className="hover:bg-purple-100 text-purple-600 dark:hover:bg-purple-950 active:scale-95 transition-all p-1.5 rounded-lg"
                size={30}
                onClick={() => {
                  setSingleOrderId(params.row.id);
                  setOpenUpdatePayment(true);
                }}
              />
            )}
          {params.row.invoiceGenerated && (
            <File
              strokeWidth={2.1}
              className="hover:bg-green-100 text-green-600 dark:hover:bg-green-950 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => handleOpenInvoice(params.row.id)}
            />
          )}
          {params.row.orderStatus == "Placed" && (
            <Tooltip title="Cancel Order" placement="top">
              <MdOutlineCancel
                className="hover:bg-red-100 text-red-600 dark:hover:bg-red-950 active:scale-95 transition-all p-1.5 rounded-lg"
                size={30}
                onClick={() => {
                  setSingleOrderId(params.row.id);
                  setOpenCancel(true);
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const totalBeforeDiscount =
    singleOrderFromSalesman?.totalAmount /
    (1 - singleOrderFromSalesman?.discount / 100);

  const rows = dueOrdersInSalesman?.map((order) => ({
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
    invoiceGenerated: order.invoiceGenerated,
  }));

  if (
    dueOrdersInSalesmanLoading ||
    isCancelingOrder ||
    isUpdatingPayment ||
    singleOrderLoading
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
                  Order Details - #{singleOrderFromSalesman?.orderId}
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
                  {singleOrderFromSalesman?.items?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium whitespace-nowrap"
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
                  <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                    <span className=" font-normal">Placed By:</span>
                    {singleOrderFromSalesman?.placedBy?.name}
                  </div>
                  <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                    <span className=" font-normal">Placed Date:</span>
                    {format(singleOrderFromSalesman?.createdAt, "dd MMM yyyy")}
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Payment Information
                  </h1>
                  <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                    <span className=" font-normal">Subtotal:</span>
                    {formatRupee(totalBeforeDiscount)}
                  </div>
                  <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                    <span className=" font-normal">
                      Discount ({singleOrderFromSalesman?.discount}%):
                    </span>
                    -
                    {formatRupee(
                      totalBeforeDiscount - singleOrderFromSalesman?.totalAmount
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                    <span className=" font-normal">Net Total:</span>
                    {formatRupee(singleOrderFromSalesman?.totalAmount)}
                  </div>
                  <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                    <span className=" font-normal">Advance Amount:</span>
                    {formatRupee(singleOrderFromSalesman?.advanceAmount)}
                  </div>
                  <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                    <span className=" font-normal">Due Amount:</span>
                    {formatRupee(singleOrderFromSalesman?.dueAmount)}
                  </div>
                  {singleOrderFromSalesman?.advanceAmount > 0 && (
                    <div className="flex items-center text-gray-600 justify-between font-semibold dark:text-gray-300">
                      <span className=" font-normal">
                        Advance Confirmation:
                      </span>
                      {singleOrderFromSalesman?.advancePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromSalesman?.advancePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromSalesman?.advancePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromSalesman?.advancePaymentStatus ===
                        "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}
                  {singleOrderFromSalesman?.duePaymentStatus && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Due Confirmation:</span>
                      {singleOrderFromSalesman?.duePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromSalesman?.duePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromSalesman?.duePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromSalesman?.duePaymentStatus ===
                        "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Advance Payment Mode:</span>
                    {singleOrderFromSalesman?.paymentMode}
                  </div>
                  {singleOrderFromSalesman?.duePaymentMode && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Due Payment Mode:</span>
                      {singleOrderFromSalesman?.duePaymentMode}
                    </div>
                  )}
                  {singleOrderFromSalesman?.dueAmount !== 0 && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Due Date:</span>
                      {format(singleOrderFromSalesman?.dueDate, "dd MMM yyyy")}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800">
                    Order Status
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Order Status:</span>
                    {singleOrderFromSalesman?.orderStatus === "Delivered" ? (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        {singleOrderFromSalesman?.orderStatus}
                      </span>
                    ) : singleOrderFromSalesman?.orderStatus === "Cancelled" ? (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        {singleOrderFromSalesman?.orderStatus}
                      </span>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300 dark:bg-gray-800 font-semibold bg-gray-200 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        {singleOrderFromSalesman?.orderStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Payment Status:</span>
                    {singleOrderFromSalesman?.paymentStatus ===
                      "PendingDues" && (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Pending Dues
                      </span>
                    )}
                    {singleOrderFromSalesman?.paymentStatus === "Paid" && (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Paid
                      </span>
                    )}
                    {singleOrderFromSalesman?.paymentStatus ===
                      "ConfirmationPending" && (
                      <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Confirmation Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Invoice Generated:</span>
                    {singleOrderFromSalesman?.invoiceGenerated ? (
                      <span className="text-green-800 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        No
                      </span>
                    )}
                  </div>
                  {singleOrderFromSalesman?.dueInvoiceGenerated && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">
                        Due Invoice Generated:
                      </span>
                      {singleOrderFromSalesman?.dueInvoiceGenerated ? (
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
                  <h1 className="font-semibold lg:text-base text-gray-800 text-sm">
                    Shipping Details
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Address:</span>
                    {singleOrderFromSalesman?.shippingAddress}
                  </div>
                </div>

                {/* assigned warehouse */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-gray-800 text-sm">
                    Assigned Plant
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Plant:</span>
                    {singleOrderFromSalesman?.assignedWarehouse ? (
                      <div className="flex flex-col items-center">
                        <p>
                          {singleOrderFromSalesman?.assignedWarehouse?.name}
                        </p>
                        <p className="text-xs font-normal text-gray-600">
                          (
                          {singleOrderFromSalesman?.assignedWarehouse?.location}
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
                    {singleOrderFromSalesman?.approvedBy ? (
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
              <p className="bg-yellow-50 dark:bg-yellow-800 rounded-lg p-3 text-gray-800 dark:text-gray-300">
                {singleOrderFromSalesman?.notes}
              </p>
            </div>

            {singleOrderFromSalesman?.canceledBy?.role && (
              <div className="flex flex-col gap-2 lg:text-sm text-xs my-5 border p-3 bg-red-900/10 rounded-lg border-red-800">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Cancellation Information
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Cancelled By:</span>
                  {singleOrderFromSalesman?.canceledBy?.role}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Date:</span>
                  {format(
                    singleOrderFromSalesman?.canceledBy?.date,
                    "dd MMM yyyy"
                  )}
                </div>
                <p className="bg-red-50 dark:text-gray-200 dark:bg-red-800 rounded-lg p-3 py-2">
                  <span className="font-bold">Reason:</span>{" "}
                  {singleOrderFromSalesman?.canceledBy?.reason}
                </p>
              </div>
            )}

            {/* dispatch info */}
            {singleOrderFromSalesman?.dispatchInfo && (
              <div className="flex flex-col gap-2 lg:text-sm text-xs bg-green-50 dark:bg-green-800 p-3 rounded-lg mt-5">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-300">
                  Dispatch Info
                </h1>
                <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-2 md:gap-5 lg:gap-7 sm:gap-7 lg:text-sm md:text-xs text-xs">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Driver Name:</span>
                      {singleOrderFromSalesman?.dispatchInfo?.driverName}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Driver Contact:</span>
                      {singleOrderFromSalesman?.dispatchInfo?.driverContact}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Transport Company:</span>{" "}
                      {singleOrderFromSalesman?.dispatchInfo?.transportCompany}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Vehicle Number:</span>{" "}
                      {singleOrderFromSalesman?.dispatchInfo?.vehicleNumber}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Dispatched By:</span>{" "}
                      {
                        singleOrderFromSalesman?.dispatchInfo?.dispatchedBy
                          ?.name
                      }
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Plant Head Contact:</span>{" "}
                      {
                        singleOrderFromSalesman?.dispatchInfo?.dispatchedBy
                          ?.phone
                      }
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Dispatched Date:</span>{" "}
                      {format(
                        singleOrderFromSalesman?.dispatchInfo?.dispatchDate,
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

      {/* --- View Invoice Modal --- */}
      {openInvoice && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 lg:w-[35%] md:w-[60%] sm:w-[60%] w-[95%] max-h-[95%] overflow-y-auto rounded-lg">
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <p className="lg:text-xl text-base dark:text-gray-200 font-semibold">
                  Invoice - #{singleOrderFromSalesman?.orderId}
                </p>
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    {user.isActive ? (
                      <Tooltip
                        title="Download Invoice"
                        placement="top"
                        enterDelay={500}
                      >
                        <DownloadIcon
                          onClick={handleDownloadInvoice}
                          className="text-blue-600 dark:hover:bg-blue-950 hover:bg-blue-100 p-1.5 rounded-lg active:scale-95 transition-all"
                          size={30}
                        />
                      </Tooltip>
                    ) : (
                      <DownloadIcon
                        className="text-gray-400 cursor-not-allowed p-1.5 rounded-lg"
                        size={30}
                      />
                    )}
                  </div>

                  <IconButton
                    size="small"
                    onClick={() => setOpenInvoice(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-2 lg:text-sm text-xs">
                <h1 className="font-semibold lg:text-base text-sm dark:text-gray-200 text-gray-800">
                  Invoiced By
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Name:</span>
                  {singleOrderFromSalesman?.invoiceDetails?.invoicedBy?.name}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Email:</span>
                  {singleOrderFromSalesman?.invoiceDetails?.invoicedBy?.email}
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:text-sm text-xs mt-5">
                <h1 className="font-semibold lg:text-base text-sm dark:text-gray-200 text-gray-800">
                  Party Details
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Company Name:</span>
                  {singleOrderFromSalesman?.invoiceDetails?.party?.companyName}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Address:</span>
                  {singleOrderFromSalesman?.invoiceDetails?.party?.address}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Contact Person Number:</span>
                  {
                    singleOrderFromSalesman?.invoiceDetails?.party
                      ?.contactPersonNumber
                  }
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:text-sm text-xs mt-5">
                <h1 className="font-semibold lg:text-base text-sm dark:text-gray-200 text-gray-800">
                  Payment Information
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Total Amount:</span>
                  {formatRupee(
                    singleOrderFromSalesman?.invoiceDetails?.totalAmount
                  )}
                </div>
                <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-500">
                  <span className="text-gray-600 dark:text-gray-300 font-normal">
                    Advance Amount:
                  </span>
                  {formatRupee(
                    singleOrderFromSalesman?.invoiceDetails?.advanceAmount
                  )}
                </div>
                <div className="flex items-center justify-between font-semibold text-red-700 dark:text-red-500">
                  <span className="text-gray-600 dark:text-gray-300 font-normal">
                    Due Amount:
                  </span>
                  {formatRupee(
                    singleOrderFromSalesman?.invoiceDetails?.dueAmount
                  )}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className=" font-normal">Due Date:</span>
                  {format(
                    singleOrderFromSalesman?.invoiceDetails?.dueDate,
                    "dd MMM yyyy"
                  )}
                </div>
              </div>
              <hr className="my-3 border-gray-200 dark:border-gray-600" />
              <div>
                <div className="flex items-center justify-between font-semibold lg:text-sm text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Invoice Generated on:</span>
                  {format(
                    singleOrderFromSalesman?.invoiceDetails?.generatedAt,
                    "dd MMM yyyy"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Update Payment Modal --- */}
      {openUpdatePayment && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 lg:w-[30%] md:w-[60%] sm:w-[60%] w-[95%] max-h-[95%] overflow-y-auto rounded-lg">
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <p className="lg:text-xl dark:text-gray-200 md:text-lg sm:text-base text-base font-semibold">
                  Update Payment - #{singleOrderFromSalesman?.orderId}
                </p>
              </div>
            </div>
            <div>
              <form
                className="space-y-5"
                onSubmit={handleSubmit(handleUpdatePayment)}
              >
                <div>
                  <TextField
                    error={!!errors.amount}
                    fullWidth
                    size="small"
                    label="Amount"
                    {...register("amount", {
                      required: "Amount is required",
                    })}
                  />
                  {errors.amount && (
                    <span className="text-red-600 text-xs">
                      {errors.amount.message}
                    </span>
                  )}
                </div>
                <div>
                  <FormControl
                    fullWidth
                    size="small"
                    error={!!errors.paymentMode}
                    className="mb-4"
                  >
                    <InputLabel id="paymentMode-label">Payment Mode</InputLabel>
                    <Controller
                      name="paymentMode"
                      control={control}
                      rules={{ required: "Payment Mode is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="paymentMode-label"
                          id="paymentMode"
                          label="Payment Mode"
                        >
                          <MenuItem>Select Payment Mode</MenuItem>
                          <MenuItem value="UPI">UPI</MenuItem>
                          <MenuItem value="Cash">Cash</MenuItem>
                          <MenuItem value="Bank Transfer">
                            Bank Transfer
                          </MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                  {errors.paymentMode && (
                    <span className="text-red-600 text-xs">
                      {errors.paymentMode.message}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-sm mb-1 ms-3 text-gray-600">
                    Upload Due Payment Proof
                  </span>
                  <input
                    // disabled={singleOrderFromPlanthead?.dueAmount > 0}
                    className="relative mt-1 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none "
                    type="file"
                    id="formFileMultiple"
                    multiple
                    {...register("dueAmountDocs", {
                      required: {
                        value: true,
                        message: "Due Payment Proof is required",
                      },
                    })}
                  />
                  {errors.dueAmountDocs && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.dueAmountDocs.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => setOpenUpdatePayment(false)}
                    variant="outlined"
                    disableElevation
                    size="small"
                    color="primary"
                    sx={{ textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={isUpdatingPayment}
                    type="submit"
                    variant="contained"
                    size="small"
                    disableElevation
                    color="primary"
                    sx={{ textTransform: "none" }}
                  >
                    Submit
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
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[60%] w-[95%]">
            <p className="lg:text-lg dark:text-gray-200 text-base font-semibold">
              Are you sure you want to cancel the order #
              {singleOrderFromSalesman?.orderId} ?
            </p>
            <p className="lg:text-sm dark:text-gray-400 text-xs text-gray-800 my-3">
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
                  size="small"
                  color="error"
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenCancel(false)}
                >
                  Keep Order
                </Button>
                <Button
                  disabled={!reason}
                  variant="contained"
                  disableElevation
                  size="small"
                  color="error"
                  type="Submit"
                  sx={{ textTransform: "none" }}
                  loading={isCancelingOrder}
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

export default DueOrdersForSalesman;
