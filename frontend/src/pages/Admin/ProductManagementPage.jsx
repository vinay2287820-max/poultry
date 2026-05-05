import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Controller, useForm } from "react-hook-form";
import { useProduct } from "../../hooks/useProduct";
import Product from "../../components/Admin/ProductManagement/Product";

const ProductManagementPage = () => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [openForm, setOpenForm] = useState(false);
  const { addProduct, isLoading, allProducts } = useProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    addProduct(data);
    setOpenForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center lg:mb-5 md:mb-5 sm:mb-5 mb-2">
        <h1 className="lg:text-3xl md:text-xl font-bold sm:text-lg text-base dark:text-gray-200">
          Product Management
        </h1>
        <Button
          size="small"
          variant="contained"
          disableElevation
          sx={{
            fontWeight: "600",
            fontSize: isSmDown ? "10px" : "12px",
          }}
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          {isSmDown ? "Add" : "Add Product"}
        </Button>
      </div>

      {allProducts?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 lg:gap-5 md:gap-3 sm:gap-3 gap-2">
          {allProducts?.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-96 flex-1">
          <p className="text-center dark:text-gray-400">No products found</p>
        </div>
      )}

      {/* Add Product Modal */}
      {openForm && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-7 rounded-lg lg:w-[29rem] md:w-[29rem] sm:w-[29rem] w-[95%]">
            <p className="lg:text-lg text-base font-semibold mb-5 dark:text-gray-300">
              Add Product
            </p>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                      <MenuItem value="supplements">Supplements</MenuItem>
                      <MenuItem value="additives">Additives</MenuItem>
                      <MenuItem value="grains">Grains</MenuItem>
                      <MenuItem value="protein meals">Protein Meals</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  )}
                />
                {errors?.category && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.category.message}
                  </span>
                )}
              </FormControl>
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Product Name"
                variant="outlined"
                {...register("name", {
                  required: {
                    value: true,
                    message: "Product Name is required",
                  },
                })}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Description"
                variant="outlined"
                {...register("description", {
                  required: {
                    value: true,
                    message: "Description is required",
                  },
                })}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Price per bag"
                variant="outlined"
                {...register("price", {
                  required: {
                    value: true,
                    message: "Price is required",
                  },
                })}
              />
              <div className="flex items-center justify-end gap-3 mt-5">
                <Button
                  size="small"
                  variant="outlined"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  loading={isLoading}
                  variant="contained"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  type="submit"
                >
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagementPage;
