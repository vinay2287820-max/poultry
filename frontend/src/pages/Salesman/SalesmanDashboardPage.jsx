import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useProduct } from "../../hooks/useProduct";
import { CircularProgress } from "@mui/material";
import { formatRupee } from "../../utils/formatRupee";
import Box from "@mui/material/Box";
import AllOrdersForSalesman from "../../components/Salesman/OrderManagement/AllOrdersForSalesman";
import { useSalesmanOrder } from "../../hooks/useSalesmanOrder";
import DueOrdersForSalesman from "../../components/Salesman/OrderManagement/DueOrdersForSalesman";
import { format } from "date-fns";
import { useUser } from "../../hooks/useUser";
import { CircleX, CloudUploadIcon } from "lucide-react";

const SalesmanDashboardPage = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState("");
  const [dueDateError, setDueDateError] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [selectedParty, setSelectedParty] = useState({});

  const { user } = useUser();

  const { allProducts, isLoading } = useProduct();
  const {
    createOrder,
    isCreatingOrder,
    approvedParties,
    approvedPartiesLoading,
  } = useSalesmanOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm({
    defaultValues: {
      items: [{ product: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  //advance amount docs
  const advanceAmountDocs = watch("advanceAmountDocs");
  const advanceAmountFile = advanceAmountDocs ? advanceAmountDocs[0] : null;

  //items
  const items = watch("items");
  useEffect(() => {
    if (!items || !allProducts) return;

    const total = items.reduce((sum, item) => {
      const product = allProducts.find((p) => p._id === item.product);
      if (!product) return sum;
      return sum + product.price * (Number(item.quantity) || 0);
    }, 0);

    setTotalAmount(Math.round(total));
  }, [items, allProducts]);

  //selected party
  const selectedPartyId = watch("party");
  useEffect(() => {
    const Party = approvedParties?.find(
      (party) => party._id === selectedPartyId
    );
    setSelectedParty(Party);
  }, [selectedPartyId]);

  //due date
  const dueDate = watch("dueDate");
  useEffect(() => {
    if (dueDate < format(new Date(), "yyyy-MM-dd")) {
      setDueDateError("Due Date cannot be in past");
    } else if (!dueDate) {
      setDueDateError("");
    } else {
      setDueDateError("");
    }
  }, [dueDate]);

  //discount
  let enteredDiscount = watch("discount");
  useEffect(() => {
    if (enteredDiscount < 0 || enteredDiscount > 100) {
      setDiscountError("Discount must be between 0 and 100");
    } else {
      setDiscount(Number(enteredDiscount));
    }
    if (enteredDiscount >= 0 && enteredDiscount <= 100) {
      setDiscountError("");
    }
  }, [enteredDiscount]);

  let finalTotalAmount = Math.round(
    totalAmount - (totalAmount * discount) / 100
  );

  //advance amount
  const advanceAmount = watch("advanceAmount");
  const dueAmount = Math.round(finalTotalAmount - advanceAmount);

  useEffect(() => {
    if (advanceAmount > finalTotalAmount) {
      setError("Advance cannot be greater than total amount");
    } else {
      setError("");
    }
    // if (advanceAmount >= 0 && advanceAmount <= finalTotalAmount) {
    //   setError("");
    // }
  }, [finalTotalAmount, advanceAmount]);

  const [openForm, setOpenForm] = useState(false);

  const orderTypes = ["All Orders", "Due Orders"];
  const [isActive, setIsActive] = useState("All Orders");

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("party", JSON.stringify(selectedParty));
    formData.append("advanceAmount", data.advanceAmount);
    formData.append("dueDate", data.dueDate);
    formData.append("discount", data.discount);
    formData.append("paymentMode", data.paymentMode);
    formData.append("notes", data.notes);
    formData.append("advanceAmountDocs", advanceAmountFile);
    formData.append("shippingAddress", data.shippingAddress);
    formData.append("items", JSON.stringify(data.items));
    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }

    createOrder(formData, { onSuccess: () => setOpenForm(false) });
  };

  if (isLoading || approvedPartiesLoading)
    return (
      <div className="flex-1 flex items-center justify-center h-full w-full">
        <CircularProgress />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl md:text-2xl font-bold lg:mb-5 md:mb-5 sm:mb-5 mb-2 sm:text-lg text-base dark:text-gray-200">
          {isActive}
        </h1>
        <Button
          disabled={!user.isActive}
          disableElevation
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          sx={{
            fontWeight: "600",
            fontSize: isSmDown ? "10px" : "12px",
          }}
          onClick={() => setOpenForm(true)}
        >
          Place Order
        </Button>
      </div>

      <div className="mb-5">
        <ButtonGroup aria-label="Medium-sized button group">
          {orderTypes.map((order) => (
            <Button
              key={order._id}
              disableElevation
              size={isMdUp ? "medium" : "small"}
              variant={isActive === order ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
              }}
              onClick={() => setIsActive(order)}
            >
              {order}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div>
        {isActive === "All Orders" && <AllOrdersForSalesman />}
        {isActive === "Due Orders" && <DueOrdersForSalesman />}
      </div>

      {/* Place Order Modal */}
      {openForm && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-7 rounded-lg lg:w-[50%] md:w-[50%] sm:w-[95%] w-[95%] max-h-[95%] overflow-y-auto">
            <p className="lg:text-lg md:text-lg sm:text-base text-base dark:text-gray-200 font-semibold mb-7">
              Place a new Order
            </p>
            <form
              className="grid lg:grid-cols-2 grid-cols-1 gap-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <div className="mb-5">
                  <div className="flex items-start justify-between">
                    <h1 className="font-semibold text-gray-800 mb-3 text-sm dark:text-gray-300">
                      Party Information
                    </h1>

                    {!isNaN(selectedParty?.limit) && (
                      <div>
                        {selectedParty?.limit && (
                          <span className="text-gray-300 text-sm font-semibold">
                            Limit:{" "}
                            {formatRupee(Math.round(selectedParty?.limit))}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-5">
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.party}
                      className="mb-4"
                    >
                      <InputLabel id="party-label">Party</InputLabel>
                      <Controller
                        name="party"
                        control={control}
                        rules={{ required: "Party is required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Party"
                            size="small"
                            fullWidth
                            variant="outlined"
                            error={!!errors.party}
                          >
                            <MenuItem>Select Party</MenuItem>
                            {approvedParties?.map((party) => (
                              <MenuItem key={party._id} value={party._id}>
                                {party.companyName}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>

                    <FormControl
                      fullWidth
                      disabled={!selectedParty}
                      size="small"
                      error={!!errors.shippingAddress}
                      className="mt-4"
                    >
                      <InputLabel id="shippingAddress-label">
                        Shipping Address
                      </InputLabel>
                      <Controller
                        name="shippingAddress"
                        control={control}
                        rules={{ required: "Shippment address is required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Shippment address"
                            size="small"
                            fullWidth
                            variant="outlined"
                            error={!!errors.shippingAddress}
                          >
                            <MenuItem>Select Shippment address</MenuItem>
                            <MenuItem value="Self">Self</MenuItem>
                            {selectedParty?.subAgents?.map((agent, index) => (
                              <MenuItem key={index} value={agent?.address}>
                                {agent?.name} ({agent?.address})
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                  </div>
                </div>

                <div>
                  <div className="flex items-start justify-between">
                    <h1 className="font-semibold text-sm text-gray-800 mb-3 dark:text-gray-300">
                      Product Information
                    </h1>
                    {!isNaN(finalTotalAmount) && (
                      <span className="text-blue-600 dark:text-blue-500 text-sm font-semibold">
                        Total: {formatRupee(Math.round(finalTotalAmount))}
                      </span>
                    )}
                  </div>
                  <div>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex gap-3 items-center mb-3"
                      >
                        {/* Product Select */}
                        <Controller
                          name={`items.${index}.product`}
                          control={control}
                          rules={{ required: "Product is required" }}
                          render={({ field }) => (
                            <FormControl size="small" fullWidth>
                              <InputLabel>Product</InputLabel>
                              <Select
                                {...field}
                                label="Product"
                                onChange={(e) => {
                                  const selectedProduct = e.target.value;
                                  const product = allProducts.filter(
                                    (item) => item._id === selectedProduct
                                  );
                                  const isDuplicate = fields.some(
                                    (item, i) =>
                                      item.product === selectedProduct &&
                                      i !== index
                                  );
                                  if (isDuplicate) {
                                    setDuplicateError(
                                      `${product[0].name} is already added`
                                    );
                                    return;
                                  }
                                  field.onChange(e);
                                  setDuplicateError("");
                                }}
                              >
                                <MenuItem value="">Select Product</MenuItem>
                                {allProducts?.map((product) => (
                                  <MenuItem
                                    key={product?._id}
                                    value={product?._id}
                                  >
                                    {product?.name} (
                                    {formatRupee(product?.price)})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />

                        {/* Quantity Input */}
                        <TextField
                          size="small"
                          type="number"
                          label="Quantity"
                          {...register(`items.${index}.quantity`, {
                            required: "Quantity required",
                            min: 1,
                          })}
                        />

                        {/* Remove Button */}
                        {fields.length > 1 && (
                          <CircleX
                            onClick={() => remove(index)}
                            size={35}
                            className="cursor-pointer text-red-600 hover:text-red-700 active:scale-95 transition-all"
                          />
                        )}
                      </div>
                    ))}
                    {duplicateError && (
                      <p className="mb-1 text-sm text-red-600">
                        {duplicateError}
                      </p>
                    )}
                    {/* Add More Product Button */}
                    <Button
                      fullWidth
                      color="success"
                      size="small"
                      variant="contained"
                      disableElevation
                      onClick={() => append({ product: "", quantity: 1 })}
                    >
                      Add Product
                    </Button>

                    <div className="mt-5">
                      <TextField
                        error={!!errors.discount}
                        size="small"
                        fullWidth
                        helperText={
                          errors.discount && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.discount.message}
                            </p>
                          )
                        }
                        type="number"
                        id="outlined-basic"
                        label="Discount (%)"
                        variant="outlined"
                        {...register("discount", {
                          required: {
                            value: true,
                            message: "Discount is required, enter 0 if null",
                          },
                        })}
                      />
                      {discountError && (
                        <p className="mb-1 text-sm text-red-600">
                          {discountError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <div className="flex items-start justify-between">
                    <h1 className="font-semibold text-gray-800 mb-3 text-sm dark:text-gray-300">
                      Payment Information
                    </h1>
                    {!isNaN(dueAmount) && (
                      <span className="text-red-600 dark:text-red-500 text-sm font-semibold">
                        Due: {formatRupee(Math.round(dueAmount))}
                      </span>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <TextField
                        error={!!errors.advanceAmount || error}
                        size="small"
                        fullWidth
                        type="number"
                        id="outlined-basic"
                        label="Advance Amount"
                        variant="outlined"
                        {...register("advanceAmount", {
                          required: {
                            value: true,
                            message:
                              "Advance Amount is required, enter 0 if null",
                          },
                        })}
                      />
                      {errors.advanceAmount && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.advanceAmount.message}
                        </p>
                      )}
                      {error && (
                        <p className="text-red-600 text-xs mt-1">{error}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                      <label className="text-sm dark:text-gray-300">
                        Upload advance payment proof
                      </label>
                      <input
                        disabled={advanceAmount <= 0 || !advanceAmount}
                        className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-gray-500 dark:border-gray-400 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-gray-700 dark:text-gray-200 dark:bg-gray-800 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-gray-100 dark:file:bg-gray-700 file:px-3 file:py-[0.32rem] file:text-gray-700 dark:file:text-gray-200 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-gray-200 dark:hover:file:bg-gray-600 focus:border-primary dark:focus:border-primary focus:text-gray-700 dark:focus:text-gray-200 focus:shadow-te-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        type="file"
                        id="formFileMultiple"
                        multiple
                        {...register("advanceAmountDocs", {
                          validate: (files) => {
                            const amt = Number(watch("advanceAmount"));
                            if (amt > 0) {
                              return (
                                (files && files.length > 0) ||
                                "Payment proof is required"
                              );
                            }
                            return true;
                          },
                        })}
                      />
                      {errors.advanceAmountDocs && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.advanceAmountDocs.message}
                        </p>
                      )}
                    </div>

                    <Box sx={{ width: "100%" }}>
                      {dueAmount === 0 ? (
                        <TextField
                          disabled
                          error={!!errors.dueDate}
                          fullWidth
                          label="Due Date"
                          type="date"
                          size="small"
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      ) : (
                        <TextField
                          error={!!errors.dueDate}
                          fullWidth
                          label="Due Date"
                          type="date"
                          size="small"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          {...register("dueDate", {
                            required: {
                              value: true,
                              message: "Due Date is required",
                            },
                            validate: (value) => {
                              const today = format(new Date(), "yyyy-MM-dd");
                              if (dueAmount > 0 && value < today) {
                                return "Due date cannot be in the past";
                              }
                              return true;
                            },
                          })}
                        />
                      )}
                      {errors.dueDate && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.dueDate.message}
                        </p>
                      )}
                    </Box>
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.paymentMode}
                      className="mb-4"
                    >
                      <InputLabel id="paymentMode-label">
                        Payment Mode
                      </InputLabel>
                      <Controller
                        name="paymentMode"
                        control={control}
                        rules={{ required: "Payment Mode is required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelId="paymentMode-label"
                            id="paymentMode"
                            label="Payment Mode"
                          >
                            <MenuItem value="">Select Payment Mode</MenuItem>
                            {Number(watch("advanceAmount")) === 0 ? (
                              <MenuItem value="Not Paid">Not Paid</MenuItem>
                            ) : (
                              [
                                <MenuItem key="upi" value="UPI">
                                  UPI
                                </MenuItem>,
                                <MenuItem key="cash" value="Cash">
                                  Cash
                                </MenuItem>,
                                <MenuItem key="bank" value="Bank Transfer">
                                  Bank Transfer
                                </MenuItem>,
                              ]
                            )}
                          </Select>
                        )}
                      />
                      {errors.paymentMode && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.paymentMode.message}
                        </p>
                      )}
                    </FormControl>

                    <div>
                      <TextField
                        size="small"
                        error={!!errors.notes}
                        fullWidth
                        rows={2}
                        multiline
                        id="outlined-basic"
                        label="Notes"
                        variant="outlined"
                        {...register("notes", {
                          required: {
                            value: true,
                            message: "Notes is required",
                          },
                        })}
                      />
                      {errors.notes && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.notes.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-5">
                    <Button
                      variant="outlined"
                      size="small"
                      disableElevation
                      sx={{ textTransform: "none" }}
                      onClick={() => setOpenForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      loading={isCreatingOrder}
                      variant="contained"
                      disableElevation
                      sx={{ textTransform: "none" }}
                      type="submit"
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmanDashboardPage;
