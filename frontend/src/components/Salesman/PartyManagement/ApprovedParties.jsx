import React, { useState } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { formatRupee } from "../../../utils/formatRupee.js";
import { useSalesmanOrder } from "../../../hooks/useSalesmanOrder";
import { useUser } from "../../../hooks/useUser.js";

const ApprovedParties = ({ party }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const { user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: party.companyName,
      contactPersonNumber: party.contactPersonNumber,
      address: party.address,
      limit: party.limit,
    },
  });

  const { updateParty, updatingParty, deleteParty, deletingParty } =
    useSalesmanOrder();

  const handleUpdateParty = (data) => {
    data.partyId = party._id;
    console.log(data);
    updateParty(data, {
      onSuccess: () => {
        setOpenEdit(false);
      },
    });
  };

  return (
    <div className="shadow bg-white dark:bg-gray-900 rounded-lg lg:p-4 md:p-4 sm:p-3 p-3 lg:flex lg:flex-col justify-between hover:shadow-md transition-all">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-left lg:text-lg md:text-base sm:text-base text-base font-bold dark:text-gray-300">
            {party.companyName}
          </p>
          {party?.partyStatus === "approved" && (
            <p className="text-green-700 dark:text-green-200 dark:bg-green-800 font-semibold text-[10px] lg:text-xs p-1 px-2 bg-green-100 rounded-full">
              Approved
            </p>
          )}
        </div>
        <div className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-2 lg:text-sm md:text-xs sm:text-xs text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-600 dark:text-gray-400 font-normal text-right">
                Address:
              </span>
              <span className="dark:text-gray-300">{party?.address}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-600 dark:text-gray-400 font-normal text-right">
                Contact Person Number:
              </span>
              <span className="dark:text-gray-300">
                {party?.contactPersonNumber}
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-600 dark:text-gray-400 font-normal text-right">
                Limit:
              </span>
              <span className="dark:text-gray-300">
                {formatRupee(party?.limit)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end mt-3">
        <div className="flex items-center gap-1">
          {user.isActive ? (
            <SquarePen
              className="hover:bg-green-100 dark:hover:bg-green-950 text-green-600 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => setOpenEdit(true)}
            />
          ) : (
            <SquarePen
              color="gray"
              className="p-1.5 rounded-lg cursor-not-allowed"
              size={30}
            />
          )}
          {user.isActive ? (
            <Trash2
              className="hover:bg-red-100 dark:hover:bg-red-950 text-red-600 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => setOpenDelete(true)}
            />
          ) : (
            <Trash2
              color="gray"
              className="p-1.5 rounded-lg cursor-not-allowed"
              size={30}
            />
          )}
        </div>
      </div>

      {/* --- Delete Product Modal --- */}
      {openDelete && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[29rem] sm:w-[29rem] w-[95%]">
            <p className="lg:text-lg md:text-lg sm:text-base text-base dark:text-gray-200 font-semibold">
              Are you sure you want to delete {party.companyName}?
            </p>
            <p className="text-gray-500 lg:text-sm md:text-sm sm:text-xs text-xs dark:text-gray-400">
              This action cannot be undone. {party.companyName}'s data will be
              permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 mt-5">
              <Button
                variant="outlined"
                disableElevation
                color="error"
                sx={{ textTransform: "none" }}
                onClick={() => setOpenDelete(false)}
                size="small"
              >
                Cancel
              </Button>
              <Button
                loading={deletingParty}
                loadingPosition="start"
                variant="contained"
                disableElevation
                color="error"
                sx={{ textTransform: "none" }}
                onClick={() => deleteParty(party._id)}
                size="small"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Product Modal --- */}
      {openEdit && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[29rem] sm:w-[29rem] w-[95%]">
            <p className="lg:text-lg md:text-lg sm:text-base text-base dark:text-gray-200 font-semibold mb-7">
              Edit {party.companyName}
            </p>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(handleUpdateParty)}
            >
              <div>
                <TextField
                  size="small"
                  fullWidth
                  id="outlined-basic"
                  label=" Company Name"
                  variant="outlined"
                  {...register("companyName", {
                    required: {
                      value: true,
                      message: "Company Name is required",
                    },
                  })}
                />
                {errors.companyName && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.companyName.message}
                  </span>
                )}
              </div>
              <div>
                <TextField
                  size="small"
                  fullWidth
                  id="outlined-basic"
                  type="number"
                  label="Contact Person Number"
                  variant="outlined"
                  {...register("contactPersonNumber", {
                    required: {
                      value: true,
                      message: "Contact Person Number is required",
                    },
                  })}
                />
                {errors.contactPersonNumber && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.contactPersonNumber.message}
                  </span>
                )}
              </div>
              <div>
                <TextField
                  size="small"
                  fullWidth
                  id="outlined-basic"
                  label="Address"
                  variant="outlined"
                  {...register("address", {
                    required: { value: true, message: "Address is required" },
                  })}
                />
                {errors.address && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </span>
                )}
              </div>
              <TextField
                error={!!errors.limit}
                size="small"
                fullWidth
                id="outlined-basic"
                label="Limit"
                variant="outlined"
                helperText={
                  errors.limit && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.limit.message}
                    </span>
                  )
                }
                {...register("limit", {
                  required: { value: true, message: "Limit is required" },
                })}
              />

              <div className="flex items-center justify-end gap-3 mt-5">
                <Button
                  variant="outlined"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenEdit(false)}
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  loading={updatingParty}
                  loadingPosition="start"
                  variant="contained"
                  disableElevation
                  size="small"
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

export default ApprovedParties;
