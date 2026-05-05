import { useState } from "react";
import { Button, CircularProgress, IconButton, TextField } from "@mui/material";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import { formatRupee } from "../../../utils/formatRupee.js";
import { useSalesManagerOrder } from "../../../hooks/useSalesManagerOrder.js";
import { useForm } from "react-hook-form";
import { useTheme as useThemeContext } from "../../../context/ThemeContext.jsx";

const ForwardedOrders = () => {
  const { resolvedTheme } = useThemeContext();
  const [singleOrderId, setSingleOrderId] = useState(null);
  const [openView, setOpenView] = useState(false);

  const {
    ForwardedOrdersInSalesManager,
    singleOrderFromSalesManager,
    singleOrderLoading,
    ForwardedOrdersInSalesManagerLoading,
    isForwardingOrder,
    isCancelingOrder,
  } = useSalesManagerOrder(singleOrderId);

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

  if (
    singleOrderLoading ||
    ForwardedOrdersInSalesManagerLoading ||
    isForwardingOrder ||
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
          <Eye
            className="hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-600 active:scale-95 transition-all p-1.5 rounded-lg"
            size={30}
            onClick={() => handleView(params.row.id)}
          />
        </div>
      ),
    },
  ];

  const rows = ForwardedOrdersInSalesManager?.map((order) => ({
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
                <p className="lg:text-xl text-sm dark:text-gray-200 font-bold">
                  Order Details - #{singleOrderFromSalesManager?.orderId}
                </p>
                <IconButton size="small" onClick={() => setOpenView(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
            </div>

            {/* products table */}
            <div className="relative overflow-x-auto mb-5 max-h-52">
              <table className="w-full lg:text-sm text-xs text-left text-gray-500 dark:text-gray-300 overflow-auto">
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
                  {singleOrderFromSalesManager?.items?.map((item, idx) => (
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
              {/* left section */}
              <div className="flex flex-col gap-5">
                {/* order info */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Order Information
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Placed By:
                    </span>
                    {singleOrderFromSalesManager?.placedBy?.name}
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Placed Date:
                    </span>
                    {format(
                      singleOrderFromSalesManager?.createdAt,
                      "dd MMM yyyy"
                    )}
                  </div>
                </div>

                {/* payment info */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Payment Information
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Total Amount:
                    </span>
                    {formatRupee(singleOrderFromSalesManager?.totalAmount)}
                  </div>

                  <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-600">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Advance Amount:
                    </span>
                    {formatRupee(singleOrderFromSalesManager?.advanceAmount)}
                  </div>

                  <div className="flex items-center justify-between font-semibold text-red-700 dark:text-red-600">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Due Amount:
                    </span>
                    {formatRupee(singleOrderFromSalesManager?.dueAmount)}
                  </div>

                  {/* advance status */}
                  {singleOrderFromSalesManager?.advanceAmount > 0 && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Advance Payment Approval:
                      </span>

                      {singleOrderFromSalesManager?.advancePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromSalesManager?.advancePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromSalesManager?.advancePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromSalesManager?.advancePaymentStatus ===
                        "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}

                  {/* due payment status */}
                  {singleOrderFromSalesManager?.duePaymentStatus && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Payment Approval:
                      </span>

                      {singleOrderFromSalesManager?.duePaymentStatus ===
                        "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrderFromSalesManager?.duePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrderFromSalesManager?.duePaymentStatus ===
                        "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrderFromSalesManager?.duePaymentStatus ===
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
                    {singleOrderFromSalesManager?.paymentMode}
                  </div>

                  {singleOrderFromSalesManager?.duePaymentMode && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Payment Mode:
                      </span>
                      {singleOrderFromSalesManager?.duePaymentMode}
                    </div>
                  )}

                  {singleOrderFromSalesManager?.dueAmount !== 0 && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Date:
                      </span>
                      {format(
                        singleOrderFromSalesManager?.dueDate,
                        "dd MMM yyyy"
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="flex flex-col gap-5">
                {/* order status */}
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
                        }[singleOrderFromSalesManager?.orderStatus] ||
                        "text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
                      }  p-0.5 px-2 rounded-full lg:text-xs text-[10px] font-semibold`}
                    >
                      {singleOrderFromSalesManager?.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Payment Status:
                    </span>

                    {singleOrderFromSalesManager?.paymentStatus ===
                      "PendingDues" && (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Pending Dues
                      </span>
                    )}

                    {singleOrderFromSalesManager?.paymentStatus === "Paid" && (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Paid
                      </span>
                    )}

                    {singleOrderFromSalesManager?.paymentStatus ===
                      "ConfirmationPending" && (
                      <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Confirmation Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Invoice Generated:
                    </span>
                    {singleOrderFromSalesManager?.invoiceGenerated ? (
                      <span className="text-green-800 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        No
                      </span>
                    )}
                  </div>
                </div>

                {/* shipping */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Shipping Details
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Address:
                    </span>
                    {singleOrderFromSalesManager?.shippingAddress}
                  </div>
                </div>

                {/* assigned plant */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Assigned Plant
                  </h1>

                  <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Plant:
                    </span>

                    {singleOrderFromSalesManager?.assignedWarehouse ? (
                      <div className="flex flex-col items-center">
                        <p className="dark:text-gray-200">
                          {singleOrderFromSalesManager?.assignedWarehouse?.name}
                        </p>

                        <p className="text-xs font-normal text-gray-600 dark:text-gray-400">
                          (
                          {
                            singleOrderFromSalesManager?.assignedWarehouse
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

                  {singleOrderFromSalesManager?.assignedWarehouse && (
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Plant Approval:
                      </span>

                      {singleOrderFromSalesManager?.approvedBy ? (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Approved
                        </span>
                      ) : (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* notes */}
            <div className="flex flex-col gap-2 lg:text-sm text-xs my-5">
              <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-300">
                Notes
              </h1>
              <p className="bg-yellow-50 dark:bg-yellow-800 text-gray-800 dark:text-gray-200 rounded-lg p-3">
                {singleOrderFromSalesManager?.notes}
              </p>
            </div>

            {/* dispatch info */}
            {singleOrderFromSalesManager?.dispatchInfo && (
              <div className="flex flex-col gap-2 lg:text-sm text-xs bg-green-50 dark:bg-green-800 p-3 rounded-lg mt-5">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Dispatch Info
                </h1>

                <div className="grid lg:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 md:gap-5 lg:gap-7">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Driver Name:
                      </span>
                      {singleOrderFromSalesManager?.dispatchInfo?.driverName}
                    </div>

                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Driver Contact:
                      </span>
                      {singleOrderFromSalesManager?.dispatchInfo?.driverContact}
                    </div>

                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Transport Company:
                      </span>
                      {
                        singleOrderFromSalesManager?.dispatchInfo
                          ?.transportCompany
                      }
                    </div>

                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Vehicle Number:
                      </span>
                      {singleOrderFromSalesManager?.dispatchInfo?.vehicleNumber}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Dispatched By:
                      </span>
                      {
                        singleOrderFromSalesManager?.dispatchInfo?.dispatchedBy
                          ?.name
                      }
                    </div>

                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Plant Head Contact:
                      </span>
                      {
                        singleOrderFromSalesManager?.dispatchInfo?.dispatchedBy
                          ?.phone
                      }
                    </div>

                    <div className="flex items-center justify-between font-semibold dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Dispatched Date:
                      </span>
                      {format(
                        singleOrderFromSalesManager?.dispatchInfo?.dispatchDate,
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
    </div>
  );
};

export default ForwardedOrders;
