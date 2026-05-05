import { useState } from "react";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { DownloadIcon, Eye, File, FileClock } from "lucide-react";
import { format } from "date-fns";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import { formatRupee } from "../../../utils/formatRupee.js";
import { useAdminOrder } from "../../../hooks/useAdminOrders.js";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { useTheme } from "../../../context/ThemeContext.jsx";

const downloadInvoice = ({
  accName,
  accEmail,
  partyName,
  partyAddress,
  partyContact,
  totalAmount,
  advanceAmount,
  dueAmount,
  dueDate,
}) => {
  const invoiceBy = { name: accName, email: accEmail };
  const partyDetails = {
    company: partyName,
    address: partyAddress,
    contact: partyContact,
  };
  const paymentInfo = {
    total: totalAmount,
    advance: advanceAmount,
    due: dueAmount,
    dueDate: dueDate,
  };

  const doc = new jsPDF();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80); // dark blue
  doc.text("INVOICE", 14, 20);

  // Reset color
  doc.setTextColor(0, 0, 0);

  // Invoice By
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice By:", 14, 35);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${invoiceBy.name}`, 14, 42);
  doc.text(`Email: ${invoiceBy.email}`, 14, 49);

  // Party Details
  doc.setFont("helvetica", "bold");
  doc.text("Party Details:", 14, 65);
  doc.setFont("helvetica", "normal");
  doc.text(`Company Name: ${partyDetails.company}`, 14, 72);
  doc.text(`Address: ${partyDetails.address}`, 14, 79);
  doc.text(`Contact Person Number: ${partyDetails.contact}`, 14, 86);

  // Payment Information Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(231, 76, 60); // red heading
  doc.text("Payment Information:", 14, 105);

  doc.setTextColor(0, 0, 0); // reset to black
  autoTable(doc, {
    startY: 110,
    theme: "striped",
    headStyles: {
      fillColor: [52, 152, 219], // blue header background
      textColor: 255, // white text
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 12,
    },
    head: [["Total Amount", "Advance Amount", "Due Amount", "Due Date"]],
    body: [
      [
        `${formatRupee(paymentInfo.total)}`,
        `${formatRupee(paymentInfo.advance)}`,
        `${formatRupee(paymentInfo.due)}`,
        paymentInfo.dueDate,
      ],
    ],
  });

  doc.save("invoice.pdf");
};

const OrdersTable = () => {
  const { resolvedTheme } = useTheme();
  const [singleOrderId, setSingleOrderId] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openDuePaymentInvoice, setOpenDuePaymentInvoice] = useState(false);

  const { orders, singleOrder, ordersLoading, singleOrderLoading } =
    useAdminOrder(singleOrderId);

  console.log(singleOrder);

  const [paginationModel, setPaginationModel] = useState(() => {
    const saved = localStorage.getItem("paginationModel");
    return saved ? JSON.parse(saved) : { page: 0, pageSize: 10 };
  });

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
    localStorage.setItem("paginationModel", JSON.stringify(newModel));
  };

  const handleOpenDuePaymentInvoice = (id) => {
    setSingleOrderId(id);
    setOpenDuePaymentInvoice(true);
  };

  const handleView = (id) => {
    setSingleOrderId(id);
    setOpenView(true);
  };

  const handleOpenInvoice = (id) => {
    setSingleOrderId(id);
    setOpenInvoice(true);
  };

  const handleDownloadInvoice = () => {
    downloadInvoice({
      accName: singleOrder?.invoiceDetails?.invoicedBy?.name,
      accEmail: singleOrder?.invoiceDetails?.invoicedBy?.email,
      partyName: singleOrder?.party?.companyName,
      partyAddress: singleOrder?.party?.address,
      partyContact: singleOrder?.party?.contactPersonNumber,
      totalAmount: singleOrder?.totalAmount,
      advanceAmount: singleOrder?.advanceAmount,
      dueAmount: singleOrder?.dueAmount,
      dueDate: format(singleOrder?.dueDate, "dd MMM yyyy"),
    });
  };

  const totalBeforeDiscount =
    singleOrder?.totalAmount / (1 - singleOrder?.discount / 100);

  if (singleOrderLoading)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <CircularProgress />
      </div>
    );

  const handleDownloadDueInvoice = () => {
    downloadInvoice({
      accName: singleOrder?.dueInvoiceDetails?.invoicedBy?.name,
      accEmail: singleOrder?.dueInvoiceDetails?.invoicedBy?.email,
      partyName: singleOrder?.dueInvoiceDetails?.party?.companyName,
      partyAddress: singleOrder?.dueInvoiceDetails?.party?.address,
      partyContact: singleOrder?.dueInvoiceDetails?.party?.contactPersonNumber,
      totalAmount: singleOrder?.dueInvoiceDetails?.totalAmount,
      advanceAmount: singleOrder?.dueInvoiceDetails?.advanceAmount,
      dueAmount: singleOrder?.dueInvoiceDetails?.dueAmount,
      dueDate: format(singleOrder?.dueInvoiceDetails?.dueDate, "dd MMM yyyy"),
      paymentMode: singleOrder?.dueInvoiceDetails?.paymentMode,
    });
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
      headerName: "Products & Quantity",
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
            color="blue"
            className="hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-950 active:scale-95 transition-all p-1.5 rounded-lg"
            size={30}
            onClick={() => handleView(params.row.id)}
          />
          <Tooltip title="View invoice" placement="top">
            {params.row.invoiceGenerated && (
              <File
                strokeWidth={2.1}
                color="teal"
                className="hover:bg-teal-200 text-teal-600 dark:hover:bg-teal-950 active:scale-95 transition-all p-1.5 rounded-lg"
                size={30}
                onClick={() => handleOpenInvoice(params.row.id)}
              />
            )}
          </Tooltip>

          {params.row.dueInvoiceGenerated && (
            <Tooltip title="View due payment invoice" placement="top">
              <FileClock
                strokeWidth={2.1}
                color="teal"
                className="hover:bg-teal-200 text-teal-600 dark:hover:bg-teal-950 active:scale-95 transition-all p-1.5 rounded-lg"
                size={30}
                onClick={() => handleOpenDuePaymentInvoice(params.row.id)}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const rows = orders?.map((order) => ({
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
    dueInvoiceGenerated: order.dueInvoiceGenerated,
  }));

  if (ordersLoading || singleOrderLoading)
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
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 rounded-lg lg:max-w-[60%] lg:min-w-[50%] lg:max-h-[95%] w-[95%] max-h-[95%] md:w-[80%] overflow-auto">
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <p className="lg:text-xl dark:text-gray-200 text-base font-bold">
                  Order Details - #{singleOrder?.orderId}
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
                  {singleOrder?.items?.map((item, idx) => (
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

            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-7">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Order Information
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Placed By:</span>
                    {singleOrder?.placedBy?.name}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Placed Date:</span>
                    {format(singleOrder?.createdAt, "dd MMM yyyy")}
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Payment Information
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Subtotal:</span>
                    {formatRupee(totalBeforeDiscount)}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">
                      Discount ({singleOrder?.discount}%):
                    </span>
                    -
                    {formatRupee(
                      totalBeforeDiscount - singleOrder?.totalAmount
                    )}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Net Total:</span>
                    {formatRupee(singleOrder?.totalAmount)}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-600">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Advance Amount:
                    </span>
                    {formatRupee(singleOrder?.advanceAmount)}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-red-700 dark:text-red-600">
                    <span className="text-gray-600 dark:text-gray-300 font-normal">
                      Due Amount:
                    </span>
                    {formatRupee(singleOrder?.dueAmount)}
                  </div>
                  {singleOrder?.advanceAmount > 0 && (
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Advance Confirmation:
                      </span>
                      {singleOrder?.advancePaymentStatus === "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrder?.advancePaymentStatus ===
                        "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrder?.advancePaymentStatus === "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrder?.advancePaymentStatus === "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}
                  {singleOrder?.duePaymentStatus && (
                    <div className="flex items-center justify-between font-semibold text-red-700">
                      <span className="text-gray-600 dark:text-gray-300 font-normal">
                        Due Confirmation:
                      </span>
                      {singleOrder?.duePaymentStatus === "Approved" && (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Confirmed
                        </span>
                      )}
                      {singleOrder?.duePaymentStatus === "SentForApproval" && (
                        <span className="text-indigo-700 dark:text-indigo-200 dark:bg-indigo-800 font-semibold bg-indigo-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Sent For Confirmation
                        </span>
                      )}
                      {singleOrder?.duePaymentStatus === "Pending" && (
                        <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Pending
                        </span>
                      )}
                      {singleOrder?.duePaymentStatus === "Rejected" && (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Rejected
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Advance Payment Mode:</span>
                    {singleOrder?.paymentMode}
                  </div>
                  {singleOrder?.duePaymentMode && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Due Payment Mode:</span>
                      {singleOrder?.duePaymentMode}
                    </div>
                  )}
                  {singleOrder?.dueAmount !== 0 && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Due Date:</span>
                      {format(singleOrder?.dueDate, "dd MMM yyyy")}
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
                        }[singleOrder?.orderStatus] ||
                        "text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
                      }  p-0.5 px-2 rounded-full lg:text-xs text-[10px] font-semibold`}
                    >
                      {singleOrder?.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Payment Status:</span>
                    {singleOrder?.paymentStatus === "PendingDues" && (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Pending Dues
                      </span>
                    )}
                    {singleOrder?.paymentStatus === "Paid" && (
                      <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Paid
                      </span>
                    )}
                    {singleOrder?.paymentStatus === "ConfirmationPending" && (
                      <span className="text-yellow-700 dark:text-yellow-200 dark:bg-yellow-800 font-semibold bg-yellow-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Confirmation Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Invoice Generated:</span>
                    {singleOrder?.invoiceGenerated ? (
                      <span className="text-green-800 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        No
                      </span>
                    )}
                  </div>
                  {singleOrder?.dueInvoiceGenerated && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">
                        Due Invoice Generated:
                      </span>
                      {singleOrder?.dueInvoiceGenerated ? (
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
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Shipping Details
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Address:</span>
                    {singleOrder?.shippingAddress}
                  </div>
                </div>

                {/* assigned warehouse */}
                <div className="flex flex-col gap-2 lg:text-sm text-xs">
                  <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                    Assigned Plant
                  </h1>
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Warehouse:</span>
                    {singleOrder?.assignedWarehouse ? (
                      <div className="flex flex-col items-center">
                        <p>{singleOrder?.assignedWarehouse?.name}</p>
                        <p className="text-xs font-normal text-gray-600">
                          ({singleOrder?.assignedWarehouse?.location})
                        </p>
                      </div>
                    ) : (
                      <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                        Not Assigned
                      </span>
                    )}
                  </div>
                  {singleOrder?.approvedBy && (
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Plant Approval:</span>
                      {singleOrder?.approvedBy ? (
                        <span className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold bg-green-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
                          Approved
                        </span>
                      ) : (
                        <span className="text-red-700 dark:text-red-200 dark:bg-red-800 font-semibold bg-red-100 p-0.5 px-2 rounded-full lg:text-xs text-[10px]">
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
              <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                Notes
              </h1>
              <p className="bg-yellow-50 dark:text-gray-200 dark:bg-yellow-800 rounded-lg p-3">
                {singleOrder?.notes}
              </p>
            </div>
            {singleOrder?.canceledBy?.role && (
              <div className="flex flex-col gap-2 lg:text-sm text-xs my-5 border p-3 bg-red-900/10 rounded-lg border-red-800">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Cancellation Information
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Cancelled By:</span>
                  {singleOrder?.canceledBy?.role}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Date:</span>
                  {format(singleOrder?.canceledBy?.date, "dd MMM yyyy")}
                </div>
                <p className="bg-red-50 dark:text-gray-200 dark:bg-red-800 rounded-lg p-3 py-2">
                  <span className="font-bold">Reason:</span>{" "}
                  {singleOrder?.canceledBy?.reason}
                </p>
              </div>
            )}

            {/* dispatch info */}
            {singleOrder?.dispatchInfo && (
              <div className="flex flex-col gap-2 lg:text-sm text-xs bg-green-50 dark:bg-green-800 p-3 rounded-lg mt-5">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Dispatch Info
                </h1>
                <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 lg:gap-7 md:gap-7 gap-2">
                  <div className="flex flex-col gap-2 lg:text-sm text-xs">
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Driver Name</span>
                      {singleOrder?.dispatchInfo?.driverName}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Driver Contact</span>
                      {singleOrder?.dispatchInfo?.driverContact}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Transport Company:</span>{" "}
                      {singleOrder?.dispatchInfo?.transportCompany}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Vehicle Number:</span>{" "}
                      {singleOrder?.dispatchInfo?.vehicleNumber}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:text-sm text-xs">
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Dispatched By:</span>{" "}
                      {singleOrder?.dispatchInfo?.dispatchedBy?.name}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Plant Head Contact:</span>{" "}
                      {singleOrder?.dispatchInfo?.dispatchedBy?.phone}
                    </div>
                    <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                      <span className="font-normal">Dispatched Date:</span>{" "}
                      {format(
                        singleOrder?.dispatchInfo?.dispatchDate,
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
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 lg:w-[35%] md:w-[50%] sm:w-[60%] w-[95%] rounded-lg overflow-auto">
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <p className="lg:text-xl text-base font-semibold dark:text-gray-200">
                  Invoice - #{singleOrder?.orderId}
                </p>
                <div className="flex items-center gap-5">
                  <div className="relative group">
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
                  {singleOrder?.invoiceDetails?.invoicedBy?.name}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Email:</span>
                  {singleOrder?.invoiceDetails?.invoicedBy?.email}
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:text-sm text-xs mt-5">
                <h1 className="font-semibold lg:text-base text-sm dark:text-gray-200 text-gray-800">
                  Party Details
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Company Name:</span>
                  {singleOrder?.party?.companyName}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Address:</span>
                  {singleOrder?.party?.address}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Contact Person Number:</span>
                  {singleOrder?.party?.contactPersonNumber}
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:text-sm text-xs mt-5">
                <h1 className="font-semibold lg:text-base text-sm dark:text-gray-200 text-gray-800">
                  Payment Information
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Total Amount:</span>
                  {formatRupee(singleOrder?.invoiceDetails?.totalAmount)}
                </div>
                <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-500">
                  <span className="text-gray-600 dark:text-gray-300 font-normal">
                    Advance Amount:
                  </span>
                  {formatRupee(singleOrder?.invoiceDetails?.advanceAmount)}
                </div>
                <div className="flex items-center justify-between font-semibold text-red-700 dark:text-red-500">
                  <span className="text-gray-600 dark:text-gray-300 font-normal">
                    Due Amount:
                  </span>
                  {formatRupee(singleOrder?.invoiceDetails?.dueAmount)}
                </div>
                {singleOrder?.invoiceDetails?.dueAmount !== 0 && (
                  <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                    <span className="font-normal">Due Date:</span>
                    {format(
                      singleOrder?.invoiceDetails?.dueDate,
                      "dd MMM yyyy"
                    )}
                  </div>
                )}
              </div>
              <hr className="my-3" />
              <div>
                <div className="flex items-center justify-between font-semibold lg:text-sm text-xs dark:text-gray-300">
                  <span className="text-gray-600 dark:text-gray-300 font-normal">
                    Invoice Generated on:
                  </span>
                  {format(
                    singleOrder?.invoiceDetails?.generatedAt,
                    "dd MMM yyyy"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- View Due Invoice Modal --- */}
      {openDuePaymentInvoice && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 lg:w-[35%] md:w-[50%] sm:w-[60%] w-[95%] rounded-lg overflow-auto">
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <p className="lg:text-xl text-base font-semibold dark:text-gray-200">
                  Due Payment Invoice - #{singleOrder?.orderId}
                </p>
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <Tooltip
                      title="Download Invoice"
                      placement="top"
                      enterDelay={500}
                    >
                      <DownloadIcon
                        onClick={handleDownloadDueInvoice}
                        className="text-blue-600 dark:hover:bg-blue-950 p-1.5 rounded-lg active:scale-95 transition-all"
                        size={30}
                      />
                    </Tooltip>
                  </div>

                  <IconButton
                    size="small"
                    onClick={() => setOpenDuePaymentInvoice(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-2 lg:text-sm text-xs">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Invoiced By
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className=" font-normal">Name:</span>
                  {singleOrder?.dueInvoiceDetails?.invoicedBy?.name}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className=" font-normal">Email:</span>
                  {singleOrder?.dueInvoiceDetails?.invoicedBy?.email}
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:text-sm text-xs mt-5">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Party Details
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className=" font-normal">Company Name:</span>
                  {singleOrder?.dueInvoiceDetails?.party?.companyName}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className=" font-normal">Address:</span>
                  {singleOrder?.dueInvoiceDetails?.party?.address}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className=" font-normal">Contact Person Number:</span>
                  {singleOrder?.dueInvoiceDetails?.party?.contactPersonNumber}
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:text-sm text-xs mt-5">
                <h1 className="font-semibold lg:text-base text-sm text-gray-800 dark:text-gray-200">
                  Payment Information
                </h1>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className=" font-normal">Total Amount:</span>
                  {formatRupee(singleOrder?.dueInvoiceDetails?.totalAmount)}
                </div>
                <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-500">
                  <span className="text-gray-600 dark:text-gray-300 font-normal">
                    Advance Amount:
                  </span>
                  {formatRupee(singleOrder?.dueInvoiceDetails?.advanceAmount)}
                </div>
                <div className="flex items-center justify-between font-semibold text-red-700 dark:text-red-500">
                  <span className="text-gray-600 dark:text-gray-300 font-normal">
                    Due Amount:
                  </span>
                  {formatRupee(singleOrder?.dueInvoiceDetails?.dueAmount)}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Due Date:</span>
                  {format(
                    singleOrder?.dueInvoiceDetails?.dueDate,
                    "dd MMM yyyy"
                  )}
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Payment Mode:</span>
                  {singleOrder?.dueInvoiceDetails?.paymentMode}
                </div>
              </div>
              <hr className="my-3" />
              <div>
                <div className="flex items-center justify-between font-semibold lg:text-sm text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-normal">Invoice Generated on:</span>
                  {format(
                    singleOrder?.dueInvoiceDetails?.generatedAt,
                    "dd MMM yyyy"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
