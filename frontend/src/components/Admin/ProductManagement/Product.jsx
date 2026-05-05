import React, { useState } from "react";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { useProduct } from "../../../hooks/useProduct";
import { formatRupee } from "../../../utils/formatRupee";

const Product = ({ product }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const { deleteProduct, updateProductPrice, isLoading } = useProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onEdit = (data) => {
    data.productId = product._id;
    updateProductPrice(data);
    setOpenEdit(false);
  };

  return (
    <div className="shadow dark:bg-gray-900 bg-white dark:text-gray-100 rounded-lg lg:p-4 md:p-3 sm:p-3 p-3 lg:flex lg:flex-col justify-between hover:shadow-md transition-all">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-left lg:text-lg md:text-base sm:text-base text-sm font-semibold">
            {product.name}
          </p>
          <p className="bg-indigo-50 dark:bg-indigo-800 text-indigo-500 dark:text-indigo-100 lg:text-xs md:text-xs sm:text-xs text-[10px] font-semibold rounded-full p-1 px-3">
            {product.category}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs sm:text-sm md:text-sm lg:text-sm">
            <span className="font-semibold">Description:</span>{" "}
            {product.description}
          </p>
          <p className="text-green-700 dark:text-green-500 text-xs sm:text-sm md:text-sm lg:text-sm font-semibold">
            <span className="font-semibold">Price:</span>{" "}
            {formatRupee(product.price)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {format(product.createdAt, "dd/MM/yyyy")}
        </p>
        <div className="lg:flex md:flex hidden sm:hidden items-center gap-1">
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
        <div className="sm:flex flex items-center gap-1 md:hidden lg:hidden">
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

      {/* --- Delete Product Modal --- */}
      {openDelete && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[50%] sm:w-[60%] w-[95%]">
            <p className="lg:text-base font-semibold dark:text-gray-300">
              Are you sure you want to delete {product.name}?
            </p>
            <p className="text-gray-500 lg:text-sm text-xs dark:text-gray-400">
              This action cannot be undone. {product.name}'s data will be
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
                loadingPosition="start"
                variant="contained"
                disableElevation
                color="error"
                sx={{ textTransform: "none" }}
                onClick={() => deleteProduct(product._id)}
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
          <div className="bg-white dark:bg-gray-800 lg:p-7 p-5 rounded-lg lg:w-[29rem] md:w-[50%] sm:w-[60%] w-[95%]">
            <p className="lg:text-xl text-base font-semibold mb-7 dark:text-gray-300">
              Edit {product.name}
            </p>
            <form className="space-y-5" onSubmit={handleSubmit(onEdit)}>
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label=" Category"
                variant="outlined"
                disabled
                defaultValue={product.category}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Product Name"
                variant="outlined"
                disabled
                defaultValue={product.name}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Description"
                variant="outlined"
                disabled
                defaultValue={product.description}
              />
              <TextField
                error={!!errors.price}
                size="small"
                fullWidth
                id="outlined-basic"
                label="Price per bag"
                variant="outlined"
                defaultValue={product.price}
                {...register("price", {
                  required: { value: true, message: "Price is required" },
                })}
              />
              {errors.price && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </span>
              )}
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

export default Product;
