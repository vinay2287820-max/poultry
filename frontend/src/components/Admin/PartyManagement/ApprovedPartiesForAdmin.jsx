import React, { useState } from "react";
import { formatRupee } from "../../../utils/formatRupee.js";
import { Button, TextField } from "@mui/material";
import { useAdminOrder } from "../../../hooks/useAdminOrders.js";
import { useForm } from "react-hook-form";
import { SquarePen } from "lucide-react";

const ApprovedPartiesForAdmin = ({ party }) => {
  const { updateParty, isUpdatingParty } = useAdminOrder();
  const [openEdit, setOpenEdit] = useState(false);

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
    <div className="shadow bg-white dark:bg-gray-900 rounded-lg md:p-3 lg:p-4 sm:p-3 p-3 lg:flex lg:flex-col justify-between hover:shadow-md transition-all">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-left lg:text-lg dark:text-gray-200 md:text-base sm:text-base text-base font-semibold">
            {party.companyName}
          </p>
          {party?.partyStatus === "approved" && (
            <p className="p-1 px-3 text-xs dark:text-green-200 text-green-700 dark:bg-green-900 bg-green-100 font-semibold rounded-full">
              Approved
            </p>
          )}
        </div>
        <div className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-2 lg:text-sm md:text-xs sm:text-xs text-xs">
            <div className="flex items-center justify-between font-semibold dark:text-gray-300">
              <span className="text-gray-600 dark:text-gray-400 font-normal text-right">
                Address:
              </span>
              <span className="text-right">{party?.address}</span>
            </div>
            <div className="flex items-center justify-between font-semibold dark:text-gray-300">
              <span className="text-gray-600 dark:text-gray-400 font-normal text-right">
                Contact Person Number:
              </span>
              {party?.contactPersonNumber}
            </div>
            <div className="flex items-center justify-between font-semibold dark:text-gray-300">
              <span className="text-gray-600 dark:text-gray-400 font-normal text-right">
                Limit:
              </span>
              {formatRupee(party?.limit)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end lg:mt-2">
          <div className="flex items-center gap-1">
            <SquarePen
              className="hover:bg-green-100 text-green-600  dark:hover:bg-green-950 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => setOpenEdit(true)}
            />
          </div>
        </div>
      </div>

      {/* --- Edit party Modal --- */}
      {openEdit && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] sm:w-[60%] md:w-[29rem] w-[95%]">
            <p className="lg:text-xl text-base dark:text-gray-200 font-semibold mb-7">
              Edit {party?.companyName}
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
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Address"
                variant="outlined"
                helperText={
                  errors.address && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </span>
                  )
                }
                {...register("address", {
                  required: { value: true, message: "Address is required" },
                })}
              />
              <TextField
                error={!!errors.discount}
                size="small"
                fullWidth
                id="outlined-basic"
                label="Limit"
                helperText={
                  errors.limit && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.limit.message}
                    </span>
                  )
                }
                variant="outlined"
                {...register("limit", {
                  required: { value: true, message: "Limit is required" },
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
                  loading={isUpdatingParty}
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

export default ApprovedPartiesForAdmin;
