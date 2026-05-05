import React, { useEffect, useState } from "react";
import { Mail, Phone, Trash2, SquarePen, Eye } from "lucide-react";
import { Button, IconButton, TextField } from "@mui/material";
import useEmployees from "../../../hooks/useEmployees";
import { CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import Avatar from "../../Avatar";
import { formatRupee } from "../../../utils/formatRupee.js";

const Accountant = ({ item, getAccountantStats }) => {
  const { _id } = item;
  const { deleteAccountant, isLoading, updateAccountant } = useEmployees();
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [orderStats, setOrderStats] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    data.id = _id;
    updateAccountant(data, {
      onSuccess: () => {
        setOpenEdit(false);
      },
    });
  };

  useEffect(() => {
    const stats = getAccountantStats(_id);
    setOrderStats(stats);
  }, [_id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 lg:p-5 md:p-3 sm:p-3 p-3 rounded-lg shadow hover:shadow-md transition-all"
      key={item.id}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="hidden md:block lg:block">
            <Avatar name={item.name} online={item.isActive} size={55} />
          </div>
          <div className="md:hidden lg:hidden">
            <Avatar name={item.name} online={item.isActive} size={40} />
          </div>
          <div>
            <p className="font-semibold lg:text-base md:text-base sm:text-sm text-sm dark:text-gray-200">
              {item.name}
            </p>
            <p className="lg:text-sm md:text-sm sm:text-xs text-xs dark:text-gray-300">
              Accountant
            </p>
          </div>
        </div>
        <div className="lg:flex md:flex hidden items-center gap-1">
          {/* <Eye
            className="hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-950 dark:text-blue-500 active:scale-95 transition-all p-1.5 rounded-lg"
            size={30}
            onClick={() => setOpenView(true)}
          /> */}
          <SquarePen
            className="hover:bg-green-100 text-green-600 dark:hover:bg-green-950 active:scale-95 transition-all p-1.5 rounded-lg"
            size={30}
            onClick={() => setOpenEdit(true)}
          />
          <Trash2
            className="hover:bg-red-100 text-red-600 dark:hover:bg-red-950 active:scale-95 transition-all p-1.5 rounded-lg"
            size={30}
            onClick={() => setOpenDelete(true)}
          />
        </div>
        <div className="flex items-center gap-1 md:hidden lg:hidden">
          {/* <Eye
            className="hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-950 dark:text-blue-500 active:scale-95 transition-all p-1.5 rounded-lg"
            size={28}
            onClick={() => setOpenView(true)}
          /> */}
          <SquarePen
            className="hover:bg-green-100 text-green-600 dark:hover:bg-green-950 active:scale-95 transition-all p-1.5 rounded-lg"
            size={28}
            onClick={() => setOpenEdit(true)}
          />
          <Trash2
            className="hover:bg-red-100 text-red-600 dark:hover:bg-red-950 active:scale-95 transition-all p-1.5 rounded-lg"
            size={28}
            onClick={() => setOpenDelete(true)}
          />
        </div>
      </div>

      <div className="md:hidden lg:hidden text-gray-700 dark:text-gray-400 text-sm border-b dark:border-gray-700 border-gray-100 py-3 my-3">
        <div className="flex items-center gap-3 mb-1">
          <Mail size={12} /> <span className="text-xs">{item.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone size={12} /> <span className="text-xs">{item.phone}</span>
        </div>
      </div>
      <div className="md:block lg:block hidden text-gray-700 dark:text-gray-400 text-sm border-b dark:border-gray-700 border-gray-100 py-3 my-3">
        <div className="flex items-center gap-3 mb-1">
          <Mail size={15} /> {item.email}
        </div>
        <div className="flex items-center gap-3">
          <Phone size={15} /> {item.phone}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className=" bg-green-100 dark:bg-green-800 rounded-lg p-2 flex flex-col justify-center">
          <p className="text-green-600 dark:text-green-200 font-semibold text-xs">
            Invoices Issued
          </p>
          <p className="font-semibold text-base text-green-900 dark:text-green-200">
            {orderStats.total ? orderStats?.count : "0"}
          </p>
        </div>
        <div className=" bg-blue-100 dark:bg-blue-800 rounded-lg p-2 flex flex-col justify-center">
          <p className="text-blue-600 dark:text-blue-200 font-semibold text-xs">
            Total Sales
          </p>
          <p className="font-semibold text-base text-blue-900 dark:text-blue-200">
            {orderStats.total ? formatRupee(orderStats?.total) : "₹0"}
          </p>
        </div>
      </div>

      {/* --- Delete Employee Modal --- */}
      {openDelete && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[50%] sm:w-[60%] w-[95%]">
            <p className="lg:text-base font-semibold dark:text-gray-300">
              Are you sure you want to delete {item.name}?
            </p>
            <p className="text-gray-500 lg:text-sm text-xs dark:text-gray-400">
              This action cannot be undone. {item.name}'s data will be
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
                loading={isLoading}
                variant="contained"
                disableElevation
                color="error"
                sx={{ textTransform: "none" }}
                onClick={() => deleteAccountant(item._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Employee Modal --- */}
      {openView && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 relative lg:p-7 p-5 rounded-lg lg:w-[40rem] sm:w-[60%] md:w-[50%] w-[95%] grid">
            <div>
              <div className="flex items-center justify-between">
                <p className="lg:text-xl text-base font-semibold dark:text-gray-300">
                  Employee Details
                </p>
                <IconButton size="small" onClick={() => setOpenView(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <div className="grid lg:grid-cols-2 lg:gap-7">
                <div>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="hidden sm:block md:block lg:block">
                      <Avatar
                        name={item?.name}
                        sx={{ width: 60, height: 60 }}
                      />
                    </div>
                    <div className="sm:hidden md:hidden lg:hidden">
                      <Avatar name={item?.name} size={40} />
                    </div>
                    <div>
                      <p className="lg:text-lg md:text-lg text-sm font-semibold dark:text-gray-300">
                        {item?.name}
                      </p>
                      <p className="lg:text-xs md:text-xs text-xs text-gray-500 dark:text-gray-400">
                        Sales Authorizer
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-700 text-sm py-3 my-3 dark:text-gray-400">
                    <div className="flex items-center gap-3 mb-1 lg:text-xs md:text-xs text-xs">
                      <Mail size={15} /> {item.email}
                    </div>
                    <div className="flex items-center gap-3 lg:text-xs md:text-xs text-xs">
                      <Phone size={15} /> {item.phone}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="lg:text-lg md:text-lg text-sm font-semibold dark:text-gray-300">
                    Performance Metrics
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className=" bg-green-100 dark:bg-green-800 rounded-lg p-2">
                      <p className="lg:text-xs md:text-xs text-xs text-green-600 dark:text-green-200 font-semibold">
                        Orders
                      </p>
                      <p className="font-semibold text-base text-green-900 dark:text-green-200">
                        5
                      </p>
                    </div>
                    <div className=" bg-blue-100 dark:bg-blue-800 rounded-lg p-2">
                      <p className="lg:text-xs md:text-xs text-xs text-blue-600 dark:text-blue-200 font-semibold">
                        Sales
                      </p>
                      <p className="font-semibold text-base text-blue-900 dark:text-blue-200">
                        ₹5000
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Employee Modal --- */}
      {openEdit && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] sm:w-[60%] md:w-[50%] w-[95%]">
            <p className="lg:text-xl text-base font-semibold mb-7 dark:text-gray-300">
              Edit Salesman
            </p>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Name"
                variant="outlined"
                defaultValue={item.name}
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
                defaultValue={item.email}
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
                defaultValue={item.password}
                {...register("password", {
                  required: { value: true, message: "Password is required" },
                })}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Phone"
                variant="outlined"
                defaultValue={item.phone}
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
    </div>
  );
};

export default Accountant;
