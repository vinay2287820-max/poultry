import React, { useState } from "react";
import TotalPlants from "../../components/Admin/WarehouseManagement/TotalPlants";
import StockItems from "../../components/Admin/WarehouseManagement/StockItems";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Plant from "../../components/Admin/WarehouseManagement/Plant";
import useWarehouse from "../../hooks/useWarehouse";
import { Controller, useForm } from "react-hook-form";
import useEmployees from "../../hooks/useEmployees";

const PlantManagementPage = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const { addWarehouse, warehouses, isLoading } = useWarehouse();
  const { planthead, accountant } = useEmployees();
  const [openForm, setOpenForm] = useState(false);

  const stockItems = warehouses?.reduce(
    (acc, curr) => acc + curr.stock?.length,
    0
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onAddingWarehouse = (data) => {
    addWarehouse(data);
    setOpenForm(false);
    console.log(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center lg:mb-5 md:mb-5 sm:mb-3 mb-3">
        <h1 className="lg:text-3xl md:text-xl font-bold sm:text-lg text-base dark:text-gray-200">
          Plant Management
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
          {isSmDown ? "Add" : "Add Plant"}
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 lg:gap-5 sm:gap-5 gap-3 md:gap-5 sm:grid-cols-2">
        <TotalPlants total={warehouses?.length} />
        <StockItems stockItems={stockItems} />
      </div>
      {warehouses?.length > 0 ? (
        <div className="lg:mt-5 md:mt-5 sm:mt-3 mt-3 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 lg:gap-5 md:gap-5 sm:gap-3 gap-3">
          {warehouses?.map((warehouse) => (
            <Plant key={warehouse._id} warehouse={warehouse} />
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
          No Plant Found
        </div>
      )}

      {/* Add Warehouse Modal */}
      {openForm && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-7 rounded-lg lg:w-[29rem] md:w-[29rem] sm:w-[29rem] w-[95%]">
            <p className="text-lg font-semibold mb-5 dark:text-gray-200">
              Add Plant
            </p>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onAddingWarehouse)}
            >
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Name"
                variant="outlined"
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
                {errors?.planthead && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.planthead.message}
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
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="acc-label"
                      id="acc"
                      label="Accountant"
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

export default PlantManagementPage;
