import React, { useState } from "react";
import { SiDecentraland } from "react-icons/si";
import { IoLocationOutline } from "react-icons/io5";
import { CircleMinus, Phone } from "lucide-react";
import {
  MdOutlineAccountBalance,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { Box, Eye, Mail, SquarePen, Trash2, User } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import useWarehouse from "../../../hooks/useWarehouse.js";
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
import { Controller, useForm } from "react-hook-form";
import useEmployees from "../../../hooks/useEmployees.js";
import { useSingleWarehouse } from "../../../hooks/useSingleWarehouse.js";
import { CgDollar } from "react-icons/cg";
import { useProduct } from "../../../hooks/useProduct.js";
import useFilteredProducts from "../../../hooks/useFilteredProducts.js";
import { formatRupee } from "../../../utils/formatRupee.js";

const Plant = ({ warehouse }) => {
  const { planthead, accountant } = useEmployees();
  const { updateWarehouse, deleteWarehouse, isLoading } = useWarehouse();
  const { singleWarehouse, singleWarehouseLoading } = useSingleWarehouse(
    warehouse._id
  );
  const { deleteProductFromWarehouse, addProductToWarehouse } = useProduct(
    warehouse._id
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openManageStock, setOpenManageStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const { filteredProducts, isPending } = useFilteredProducts(selectedCategory);

  const handleEditWarehouse = (data) => {
    data._id = warehouse._id;
    updateWarehouse(data);
    setOpenEdit(false);
  };

  const handleDeleteProduct = (productId) => {
    const data = {
      warehouseId: warehouse._id,
      productId: productId,
    };
    deleteProductFromWarehouse(data);
    setOpenDelete(false);
  };

  const handleAddProduct = (data) => {
    data.warehouseId = warehouse._id;
    data.productId = selectedProductId;
    console.log("handle add product", data);
    addProductToWarehouse(data);
  };

  if (singleWarehouseLoading || isPending) return <CircularProgress />;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-5 shadow hover:shadow-md transition-all">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 dark:bg-pink-800 rounded-full">
            <SiDecentraland className="lg:text-4xl md:text-3xl sm:text-2xl opacity-70 text-pink-600 dark:text-pink-200" />
          </div>
          <div>
            <p className="font-semibold lg:text-lg md:text-base sm:text-sm text-sm dark:text-gray-200">
              {warehouse?.name}
            </p>
            <div className="flex items-center gap-1">
              <IoLocationOutline className="text-gray-600 dark:text-gray-300 lg:text-lg md:text-sm sm:text-sm text-xs" />
              <p className="lg:text-sm md:text-xs sm:text-xs text-gray-600 text-xs dark:text-gray-300">
                {warehouse?.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="lg:text-sm md:text-xs sm:text-xs text-xs text-gray-600 flex justify-between">
          <span className="flex items-center gap-1">
            <MdOutlineManageAccounts className="text-pink-600" />
            <span className="dark:text-gray-300">Plant Head:</span>
          </span>
          <span className="text-black dark:text-gray-300">
            {warehouse?.plantHead?.name}
          </span>
        </div>
        <div className="lg:text-sm md:text-xs sm:text-xs text-xs text-gray-600 flex justify-between">
          <span className="flex items-center gap-1">
            <MdOutlineAccountBalance className="text-green-600" />
            <span className="dark:text-gray-300">Accountant:</span>
          </span>
          <span className="text-black dark:text-gray-300">
            {warehouse?.accountant?.name}
          </span>
        </div>
        <div className="lg:text-sm md:text-xs sm:text-xs text-xs text-gray-600 flex justify-between">
          <span className="flex items-center gap-1">
            <Box className="text-blue-600" size={15} strokeWidth={1.5} />
            <span className="dark:text-gray-300">Stock items:</span>
          </span>
          <span className="text-black dark:text-gray-300">
            {warehouse?.stock?.length}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mt-5">
        <button
          onClick={() => setOpenManageStock(true)}
          className="p-1 px-2 rounded-lg bg-violet-100 dark:bg-violet-800 text-violet-800 w-full text-sm dark:text-gray-300 hover:bg-violet-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Box size={15} strokeWidth={1.5} />
          <span className="lg:text-sm md:text-xs sm:text-xs text-xs dark:text-gray-300">
            Manage Products
          </span>
        </button>
        <Eye
          className="hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-950 active:scale-95 transition-all p-0.5 px-2 rounded-lg"
          size={40}
          onClick={() => setOpenView(true)}
        />
        <SquarePen
          className="hover:bg-green-100 text-green-600 dark:hover:bg-green-950 active:scale-95 transition-all p-0.5 px-2 rounded-lg"
          size={40}
          onClick={() => setOpenEdit(true)}
        />
        <Trash2
          className="hover:bg-red-100 text-red-600 dark:hover:bg-red-950 active:scale-95 transition-all p-0.5 px-2 rounded-lg"
          size={40}
          onClick={() => setOpenDelete(true)}
        />
      </div>

      {/* --- Edit Plant Modal --- */}
      {openEdit && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[50%] sm:w-[60%] w-[95%]">
            <p className="lg:text-xl dark:text-gray-200 text-base font-semibold mb-7">
              Edit Plant
            </p>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(handleEditWarehouse)}
            >
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Name"
                variant="outlined"
                defaultValue={warehouse?.name}
                {...register("name", {
                  required: { value: true, message: "Name is required" },
                })}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Location"
                variant="outlined"
                defaultValue={warehouse?.location}
                {...register("location", {
                  required: { value: true, message: "Location is required" },
                })}
              />
              <FormControl
                fullWidth
                size="small"
                error={!!errors.plantHead}
                className="mb-4"
              >
                <InputLabel id="plantHead-label">Plant Head</InputLabel>
                <Controller
                  name="plantHead"
                  control={control}
                  rules={{ required: "Plant Head is required" }}
                  defaultValue={warehouse?.plantHead?._id}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="plantHead-label"
                      id="plantHead"
                      label="Plant Head"
                    >
                      <MenuItem>Select Plant Head</MenuItem>
                      {planthead?.map((head) => (
                        <MenuItem key={head._id} value={head._id}>
                          {head.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors?.plantHead && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.plantHead.message}
                  </span>
                )}
              </FormControl>
              <FormControl
                fullWidth
                size="small"
                error={!!errors.accountant}
                className="mb-4"
              >
                <InputLabel id="acc-label">Accountant</InputLabel>
                <Controller
                  name="accountant"
                  control={control}
                  rules={{ required: "Accountant is required" }}
                  defaultValue={warehouse?.accountant?._id}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="acc-label"
                      id="acc"
                      label="Accountant"
                      defaultValue={warehouse.accountant.name}
                    >
                      <MenuItem>Select Accountant</MenuItem>
                      {accountant?.map((acc) => (
                        <MenuItem key={acc._id} value={acc._id}>
                          {acc.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors?.accountant && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.accountant.message}
                  </span>
                )}
              </FormControl>

              <div className="flex items-center justify-end gap-3 mt-5">
                <Button
                  size="small"
                  variant="outlined"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenEdit(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  loading={isLoading}
                  loadingPosition="start"
                  variant="contained"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Plant Modal --- */}
      {openDelete && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[50%] sm:w-[60%] w-[95%]">
            <p className="lg:text-base font-semibold dark:text-gray-200">
              Are you sure you want to delete {warehouse.name}?
            </p>
            <p className="text-gray-500 lg:text-sm text-xs dark:text-gray-400">
              This action cannot be undone. {warehouse.name}'s data will be
              permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 mt-5">
              <Button
                size="small"
                variant="outlined"
                disableElevation
                color="error"
                sx={{ textTransform: "none" }}
                onClick={() => setOpenDelete(false)}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                disableElevation
                color="error"
                sx={{ textTransform: "none" }}
                onClick={() => deleteWarehouse(warehouse?._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Plant Modal --- */}
      {openView && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 rounded-lg lg:w-[90%] lg:h-[90%] md:w-[95%] sm:w-[60%] md:h-[95%] w-[95%] h-[95%] overflow-auto">
            <div>
              <div className="flex items-center justify-between">
                <p className="lg:text-xl text-base font-semibold dark:text-gray-200">
                  Plant Details
                </p>
                <IconButton size="small" onClick={() => setOpenView(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 lg:mt-5 mt-2 gap-5">
                <div className="lg:pe-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-pink-100 dark:bg-pink-800 rounded-full">
                        <SiDecentraland className="lg:text-4xl text-2xl opacity-70 text-pink-600 dark:text-pink-200" />
                      </div>
                      <div>
                        <p className="font-semibold lg:text-lg text-sm dark:text-gray-200">
                          {warehouse.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <IoLocationOutline className="text-gray-600 lg:text-base text-xs dark:text-gray-300" />
                          <p className="lg:text-sm text-xs text-gray-600 dark:text-gray-300">
                            {warehouse.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Earnings */}
                  <div className="border dark:border-none p-3 rounded-lg flex justify-between items-center mt-5 dark:bg-gray-900">
                    <div>
                      <p className="font-semibold mb-1 lg:text-base text-xs dark:text-gray-300">
                        Total Earnings
                      </p>
                      <p className="lg:text-2xl font-semibold text-xl dark:text-gray-200">
                        {formatRupee(singleWarehouse?.totalEarnings)}
                      </p>
                    </div>
                    <div className="lg:w-12 lg:h-12 w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-800 rounded-full">
                      <CgDollar className="lg:text-3xl text-2xl opacity-70 text-green-600 dark:text-green-200" />
                    </div>
                  </div>

                  {/* Plant Head and Accountant */}
                  <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 lg:gap-5 md:gap-2 gap-2 lg:mt-5 mt-2">
                    <div className="bg-white dark:bg-gray-900 dark:border-none border rounded-lg p-3">
                      <h3 className="font-semibold lg:text-base text-sm dark:text-gray-200">
                        Plant Head
                      </h3>

                      <div className="flex items-center my-1">
                        <User
                          className="text-green-600 mr-2 hidden md:block lg:block"
                          size={20}
                        />
                        <User
                          className="text-green-600 mr-2 md:hidden lg:hidden"
                          size={15}
                        />
                        <span className="font-medium lg:text-sm text-xs dark:text-gray-300">
                          {warehouse?.plantHead?.name}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Mail
                          className="text-blue-600 mr-2 hidden md:block lg:block"
                          size={18}
                        />
                        <Mail
                          className="text-blue-600 mr-2 md:hidden lg:hidden"
                          size={15}
                        />
                        <a
                          href={`mailto:${warehouse?.plantHead?.email}`}
                          className="hover:underline lg:text-sm text-xs font-medium dark:text-gray-300"
                        >
                          {warehouse?.plantHead?.email}
                        </a>
                      </div>
                      <div className="flex items-center my-1">
                        <Phone
                          className="text-violet-600 mr-2 hidden md:block lg:block"
                          size={18}
                        />
                        <Phone
                          className="text-violet-600 mr-2 md:hidden lg:hidden"
                          size={14}
                        />
                        <span className="font-medium lg:text-sm text-xs dark:text-gray-300">
                          {warehouse?.plantHead?.phone}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 dark:border-none border rounded-lg p-3">
                      <h3 className="font-semibold lg:text-base text-sm dark:text-gray-200">
                        Accountant
                      </h3>

                      <div className="flex items-center my-1 lg:text-base text-xs">
                        <User
                          className="text-green-600 mr-2 hidden md:block lg:block"
                          size={20}
                        />
                        <User
                          className="text-green-600 mr-2 md:hidden lg:hidden"
                          size={15}
                        />
                        <span className="font-medium lg:text-sm text-xs dark:text-gray-300">
                          {warehouse?.accountant?.name}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Mail
                          className="text-blue-600 mr-2 hidden md:block lg:block"
                          size={18}
                        />
                        <Mail
                          className="text-blue-600 mr-2 md:hidden lg:hidden"
                          size={15}
                        />
                        <a
                          href={`mailto:${warehouse?.accountant?.email}`}
                          className="hover:underline lg:text-sm text-xs font-medium dark:text-gray-300"
                        >
                          {warehouse?.accountant?.email}
                        </a>
                      </div>
                      <div className="flex items-center my-1">
                        <Phone
                          className="text-violet-600 mr-2 hidden md:block lg:block"
                          size={18}
                        />
                        <Phone
                          className="text-violet-600 mr-2 md:hidden lg:hidden"
                          size={14}
                        />
                        <span className="font-medium lg:text-sm text-xs dark:text-gray-300">
                          {warehouse?.accountant?.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Items */}
                <div>
                  <div>
                    <p className="font-semibold lg:text-base text-sm dark:text-gray-200">
                      Stock Items
                    </p>

                    <div className="relative max-h-[17rem] md:h-[15rem] lg:h-[17rem] border dark:border-2 dark:border-gray-900 overflow-auto rounded mt-2">
                      <table className="w-full text-center border-collapse">
                        <thead className="sticky top-0 bg-blue-50 text-blue-800 z-10 dark:bg-gray-900 dark:text-gray-300">
                          <tr className="lg:text-sm text-xs">
                            <th className="p-3 border-b dark:border-none">
                              Product Name
                            </th>
                            <th className="p-3 border-b dark:border-none">
                              Description
                            </th>
                            <th className="p-3 border-b dark:border-none">
                              Quantity
                            </th>
                            <th className="p-3 border-b dark:border-none">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {singleWarehouse?.stock.length > 0 ? (
                            singleWarehouse?.stock.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 lg:text-sm text-xs dark:bg-gray-800 dark:text-gray-300"
                              >
                                <td className="p-3 border-b dark:border-gray-900">
                                  {item?.product?.name}
                                </td>
                                <td className="p-3 border-b dark:border-gray-900">
                                  {item?.product?.description}
                                </td>
                                <td className="p-3 border-b dark:border-gray-900">
                                  {item?.quantity} bags
                                </td>
                                <td className="p-3 border-b dark:border-gray-900">
                                  {formatRupee(item?.product?.price)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="p-4 text-center lg:text-sm text-xs text-gray-500 dark:text-gray-300"
                              >
                                No available stock
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:flex flex-col items-center justify-between gap-5">
                {/* Assigned Orders */}
                <div className="mt-5 w-full">
                  <p className="font-semibold text-base text-black dark:text-gray-200">
                    Assigned Orders
                  </p>

                  <div className="relative max-h-52 overflow-auto rounded mt-2 border dark:border-2 dark:border-gray-900">
                    <table className="w-full text-center border-collapse">
                      <thead className="sticky top-0 bg-violet-50 text-violet-800 z-10 dark:bg-gray-900 dark:text-gray-300">
                        <tr className="lg:text-sm text-xs">
                          <th className="p-3 border-b dark:border-gray-900">
                            Product Name
                          </th>
                          <th className="p-3 border-b dark:border-gray-900">
                            Quantity
                          </th>
                          <th className="p-3 border-b dark:border-gray-900">
                            Total Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {singleWarehouse?.assignedOrders?.length > 0 ? (
                          singleWarehouse?.assignedOrders?.map(
                            (order, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 lg:text-sm text-xs dark:bg-gray-800 dark:text-gray-300"
                              >
                                <td className="p-3 border-b dark:border-gray-900">
                                  <div className="flex flex-col gap-1 items-center">
                                    {order?.items?.map((item, idx) => (
                                      <span key={idx}>
                                        {item?.product?.name}
                                      </span>
                                    ))}
                                  </div>
                                </td>

                                <td className="p-3 border-b dark:border-gray-900">
                                  <div className="flex flex-col gap-1">
                                    {order?.items?.map((item, idx) => (
                                      <span key={idx}>{item?.quantity}</span>
                                    ))}
                                  </div>
                                </td>

                                <td className="p-3 border-b dark:border-gray-900">
                                  {formatRupee(order?.totalAmount)}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="p-4 text-center lg:text-sm text-xs text-gray-500 dark:text-gray-400"
                            >
                              No assigned orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dispatched Orders */}
                <div className="mt-5 w-full">
                  <p className="font-semibold text-base text-black dark:text-gray-200">
                    Dispatched Orders
                  </p>

                  <div className="relative max-h-52 overflow-auto rounded mt-2 border dark:border-2 dark:border-gray-900">
                    <table className="w-full text-center border-collapse">
                      <thead className="sticky top-0 bg-green-50 text-green-800 z-10 dark:bg-gray-900 dark:text-gray-300">
                        <tr className="lg:text-sm text-xs">
                          <th className="p-3 border-b dark:border-gray-900">
                            Product Name
                          </th>
                          <th className="p-3 border-b dark:border-gray-900">
                            Quantity
                          </th>
                          <th className="p-3 border-b dark:border-gray-900">
                            Total Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {singleWarehouse?.dispatchedOrders?.length > 0 ? (
                          singleWarehouse?.dispatchedOrders?.map(
                            (order, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 lg:text-sm text-xs dark:bg-gray-800 dark:text-gray-300"
                              >
                                <td className="p-3 border-b dark:border-gray-900">
                                  <div className="flex flex-col gap-1 items-center">
                                    {order?.items?.map((item, idx) => (
                                      <span key={idx}>
                                        {item?.product?.name}
                                      </span>
                                    ))}
                                  </div>
                                </td>

                                <td className="p-3 border-b dark:border-gray-900">
                                  <div className="flex flex-col gap-1">
                                    {order?.items?.map((item, idx) => (
                                      <span key={idx}>{item?.quantity}</span>
                                    ))}
                                  </div>
                                </td>

                                <td className="p-3 border-b dark:border-gray-900">
                                  {formatRupee(order?.totalAmount)}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="p-4 text-center lg:text-sm text-xs text-gray-400"
                            >
                              No dispatched orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Manage Products Modal --- */}
      {openManageStock && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[60rem] md:w-[90%] w-[95%] max-h-[95%] overflow-auto">
            <div className="flex items-center justify-between">
              <p className="lg:text-xl text-base font-semibold dark:text-gray-200">
                Product Management - {warehouse?.name}
              </p>
              <IconButton
                size="small"
                onClick={() => setOpenManageStock(false)}
              >
                <CloseIcon />
              </IconButton>
            </div>
            <div className="grid lg:grid-cols-3 grid-cols-1 gap-5 mt-2">
              <div className="col-span-2">
                <p className="font-semibold mb-3 lg:text-base text-sm dark:text-gray-300">
                  Available Products
                </p>
                <div className="relative lg:max-h-64 md:max-h-64 max-h-56 overflow-auto rounded mt-2">
                  <table className="w-full dark:border-2 dark:border-gray-900">
                    <thead>
                      <tr className="bg-blue-50 sticky z-50 top-0 text-blue-800 dark:text-gray-300 dark:bg-gray-900 text-center lg:text-sm text-xs">
                        <th className="p-2">Product Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {singleWarehouse?.stock?.length > 0 ? (
                        singleWarehouse?.stock?.map((item, index) => (
                          <tr
                            key={index}
                            className="text-center lg:text-sm text-xs dark:text-gray-300"
                          >
                            <td className="p-2">{item?.product?.name}</td>
                            <td className="p-2">{item?.product?.category}</td>
                            <td className="p-2">{item?.quantity} Bags</td>
                            <td className="p-2">₹{item?.product?.price}/bag</td>
                            <td className="p-2 flex items-center justify-center">
                              <Tooltip title="Remove Product" placement="right">
                                <CircleMinus
                                  color="red"
                                  className="hover:bg-red-100 dark:hover:bg-red-950 active:scale-95 transition-all p-1.5 rounded-lg"
                                  size={30}
                                  onClick={() =>
                                    handleDeleteProduct(item?.product?._id)
                                  }
                                />
                              </Tooltip>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-4 text-center lg:text-sm text-xs text-gray-500 dark:text-gray-400"
                          >
                            No available products
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold lg:text-base text-sm dark:text-gray-300">
                    Add Products
                  </p>
                </div>
                <div>
                  <form onSubmit={handleSubmit(handleAddProduct)}>
                    <div className="space-y-4">
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!errors.category}
                        className="mb-4"
                      >
                        <InputLabel id="category-label">Category</InputLabel>
                        <Controller
                          name="category"
                          control={control}
                          rules={{ required: "Category is required" }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId="category-label"
                              id="category"
                              label="Category"
                              onChange={(e) => {
                                field.onChange(e);
                                setSelectedCategory(e.target.value);
                              }}
                            >
                              <MenuItem>Select Product Category</MenuItem>
                              <MenuItem value="broiler starter feed">
                                Broiler Starter Feed
                              </MenuItem>
                              <MenuItem value="broiler grower feed">
                                Broiler Grower Feed
                              </MenuItem>
                              <MenuItem value="broiler finisher feed">
                                Broiler Finisher Feed
                              </MenuItem>
                              <MenuItem value="layer starter feed">
                                Layer Starter Feed
                              </MenuItem>
                              <MenuItem value="layer grower feed">
                                Layer Grower Feed
                              </MenuItem>
                              <MenuItem value="layer finisher feed">
                                Layer Finisher Feed
                              </MenuItem>
                              <MenuItem value="layer mash">Layer Mash</MenuItem>
                              <MenuItem value="concentrates & premixes">
                                Concentrates & Premixes
                              </MenuItem>
                              <MenuItem value="supplements">
                                Supplements
                              </MenuItem>
                              <MenuItem value="additives">Additives</MenuItem>
                              <MenuItem value="grains">Grains</MenuItem>
                              <MenuItem value="protein meals">
                                Protein Meals
                              </MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          )}
                        />
                        {errors?.category && (
                          <span className="text-red-500 text-xs mt-1">
                            {errors.category.message}
                          </span>
                        )}
                      </FormControl>
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!errors.productId}
                        disabled={filteredProducts?.length === 0}
                        className="mb-4"
                      >
                        <InputLabel id="productId-label">
                          Product Name
                        </InputLabel>
                        <Controller
                          name="productId"
                          control={control}
                          rules={{ required: "Product Name is required" }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId="productId-label"
                              id="productId"
                              onChange={(e) => {
                                field.onChange(e);
                                setSelectedProductId(e.target.value);
                              }}
                              label="Product Name"
                            >
                              <MenuItem>Select Product Name</MenuItem>
                              {filteredProducts?.map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors?.productId && (
                          <span className="text-red-500 text-xs mt-1">
                            {errors.productId.message}
                          </span>
                        )}
                      </FormControl>
                      <Button
                        size="small"
                        fullWidth
                        color="success"
                        variant="outlined"
                        disableElevation
                        type="submit"
                      >
                        Add Product
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plant;
