import { useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const orders = [
  {
    id: "#1",
    customer: "Ravi Kumar",
    date: "2025-07-30",
    total: 599.99,
    status: "Delivered",
  },
  {
    id: "#2",
    customer: "Aman Singh",
    date: "2025-07-28",
    total: 199.49,
    status: "Pending",
  },
  {
    id: "#3",
    customer: "Mohan Singh",
    date: "2025-07-27",
    total: 899.0,
    status: "Cancelled",
  },
  {
    id: "#4",
    customer: "Aman Singh",
    date: "2025-07-27",
    total: 899.0,
    status: "Delivered",
  },
  {
    id: "#5",
    customer: "Manoj Kumar",
    date: "2025-07-27",
    total: 899.0,
    status: "Pending",
  },
  {
    id: "#6",
    customer: "Mansi Sharma",
    date: "2025-07-27",
    total: 899.0,
    status: "Delivered",
  },
  {
    id: "#7",
    customer: "Mehak Sharma",
    date: "2025-07-27",
    total: 899.0,
    status: "Pending",
  },
  {
    id: "#8",
    customer: "Rahul Kumar",
    date: "2025-07-27",
    total: 899.0,
    status: "Pending",
  },
  {
    id: "#9",
    customer: "Joban Singh",
    date: "2025-07-27",
    total: 899.0,
    status: "Delivered",
  },
  {
    id: "#10",
    customer: "Sachin Mehta",
    date: "2025-07-27",
    total: 899.0,
    status: "Delivered",
  },
];

const RecentOrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);

  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCustomer = order.customer
      .toLowerCase()
      .includes(customerFilter.toLowerCase());
    const matchesDate = order.date.includes(dateFilter);
    const matchesStatus = order.status
      .toLowerCase()
      .includes(statusFilter.toLowerCase());

    return matchesSearch && matchesCustomer && matchesDate && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-5 bg-white shadow hover:shadow-md transition-all rounded-lg my-7">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Recent Orders</h1>
        {customerFilter || dateFilter || statusFilter ? (
          <Button
            variant="text"
            size="small"
            disableElevation
            sx={{ fontWeight: "600" }}
            onClick={() => {
              setCustomerFilter("");
              setDateFilter("");
              setStatusFilter("");
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-3 items-center">
        <div className="col-span-2">
          <TextField
            fullWidth
            size="small"
            label="Search by Order ID, Customer or Status"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-span-1">
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            className="w-full sm:w-40"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <FormControl size="small" className="w-40 sm:w-40" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
      <table className="w-full text-left border-collapse mt-5">
        <thead>
          <tr className="bg-blue-50 text-blue-800">
            <th className="p-3 text-sm border-b">Order ID</th>
            <th className="p-3 text-sm border-b">Customer</th>
            <th className="p-3 text-sm border-b">Date</th>
            <th className="p-3 text-sm border-b">Total</th>
            <th className="p-3 text-sm border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3 text-sm border-b">{order.id}</td>
                <td className="p-3 text-sm border-b">{order.customer}</td>
                <td className="p-3 text-sm border-b">{order.date}</td>
                <td className="p-3 text-sm border-b">
                  ₹{order.total.toFixed(2)}
                </td>
                <td className="p-3 text-sm border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No matching orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-5 lg:w-60">
          <FormControl size="small" className="w-32">
            <InputLabel id="demo-simple-select-label">
              Orders Per Page
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={ordersPerPage}
              label="Orders Per Page"
              onChange={(e) => setOrdersPerPage(e.target.value)}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Button
            size="small"
            variant="text"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            startIcon={<ArrowBackIcon />}
          >
            Previous
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            endIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
