import React, { useState } from "react";
import { useSalesmanOrder } from "../../hooks/useSalesmanOrder";
import Party from "../../components/Salesman/PartyManagement/Party";
import ApprovedParties from "../../components/Salesman/PartyManagement/ApprovedParties";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useFieldArray, useForm } from "react-hook-form";
import { useUser } from "../../hooks/useUser";
import RejectedParties from "../../components/Salesman/PartyManagement/RejectedParties";
import { CircleX } from "lucide-react";

const PartyManagementPage = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [singleOrderId, setSingleOrderId] = useState(null);
  const partyTypes = ["All Parties", "Approved Parties", "Rejected Parties"];
  const [isActive, setIsActive] = useState("All Parties");
  const [openAdd, setOpenAdd] = useState(false);

  const { user } = useUser();

  const {
    parties,
    approvedParties,
    rejectedParties,
    partiesLoading,
    approvedPartiesLoading,
    rejectedPartiesLoading,
    addParty,
    addingParty,
  } = useSalesmanOrder(singleOrderId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      subAgents: [{ name: "", address: "", phone: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subAgents",
  });

  const onSubmit = (data) => {
    addParty(data, {
      onSuccess: () => {
        setOpenAdd(false);
      },
    });
  };

  if (partiesLoading || approvedPartiesLoading || rejectedPartiesLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl md:text-xl font-bold lg:mb-5 md:mb-5 sm:mb-5 mb-2 sm:text-lg text-base dark:text-gray-200">
          {isActive}
        </h1>
        <Button
          disableElevation
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAdd(true)}
          sx={{
            fontWeight: "600",
            fontSize: isSmDown ? "10px" : "12px",
          }}
          disabled={!user.isActive}
        >
          Add Party
        </Button>
      </div>

      <div className="mb-5 mt-2">
        <ButtonGroup aria-label="Medium-sized button group">
          {partyTypes.map((party) => (
            <Button
              key={party}
              disableElevation
              size={isMdUp ? "medium" : "small"}
              variant={isActive === party ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
              }}
              onClick={() => setIsActive(party)}
            >
              {party}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="mb-5">
        {isActive === "All Parties" && (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 lg:gap-7 md:gap-5 sm:gap-5 gap-3">
            {parties?.length > 0 ? (
              parties?.map((party) => <Party party={party} key={party._id} />)
            ) : (
              <div className="w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No parties found
              </div>
            )}
          </div>
        )}
        {isActive === "Approved Parties" && (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 lg:gap-7 md:gap-5 sm:gap-5 gap-3">
            {approvedParties?.length > 0 ? (
              approvedParties?.map((party) => (
                <ApprovedParties party={party} key={party._id} />
              ))
            ) : (
              <div className="col-span-3 w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No approved parties found
              </div>
            )}
          </div>
        )}
        {isActive === "Rejected Parties" && (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 lg:gap-7 md:gap-5 sm:gap-5 gap-3">
            {rejectedParties?.length > 0 ? (
              rejectedParties?.map((party) => (
                <RejectedParties party={party} key={party._id} />
              ))
            ) : (
              <div className="col-span-3 w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
                No rejected parties found
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Add Party Modal --- */}
      {openAdd && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-7 rounded-lg lg:w-[29rem] md:w-[29rem] sm:w-[29rem] w-[95%] max-h-[95%] overflow-y-auto">
            <p className="lg:text-lg md:text-lg dark:text-gray-200 sm:text-base text-base font-semibold mb-7">
              Add a new party
            </p>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Company Name"
                variant="outlined"
                error={!!errors.companyName}
                helperText={
                  errors.companyName && (
                    <span className="text-red-600 text-xs mt-1">
                      {errors.companyName.message}
                    </span>
                  )
                }
                {...register("companyName", {
                  required: {
                    value: true,
                    message: "Company Name is required",
                  },
                })}
              />

              <TextField
                size="small"
                fullWidth
                type="number"
                id="outlined-basic"
                label="Contact Person Number"
                variant="outlined"
                error={!!errors.contactPersonNumber}
                helperText={
                  errors.contactPersonNumber && (
                    <span className="text-red-600 text-xs mt-1">
                      {errors.contactPersonNumber.message}
                    </span>
                  )
                }
                {...register("contactPersonNumber", {
                  required: {
                    value: true,
                    message: "Contact person number is required",
                  },
                })}
              />

              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Address"
                variant="outlined"
                error={!!errors.address}
                helperText={
                  errors.address && (
                    <span className="text-red-600 text-xs mt-1">
                      {errors.address.message}
                    </span>
                  )
                }
                {...register("address", {
                  required: {
                    value: true,
                    message: "Address is required",
                  },
                })}
              />

              <TextField
                size="small"
                fullWidth
                type="number"
                id="outlined-basic"
                label="Limit"
                variant="outlined"
                error={!!errors.limit}
                helperText={
                  errors.limit && (
                    <span className="text-red-600 text-xs mt-1">
                      {errors.limit.message}
                    </span>
                  )
                }
                {...register("limit", {
                  required: {
                    value: true,
                    message: "Limit is required",
                  },
                })}
              />

              <div>
                <h1 className="font-semibold text-gray-700 text-sm mb-2 dark:text-gray-300">
                  Sub Agents
                </h1>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 border-b-2 dark:border-gray-600 pb-5 mb-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Agent {index + 1}
                      </p>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        startIcon={
                          <CircleX
                            onClick={() => remove(index)}
                            size={13}
                            strokeWidth={1.7}
                            className="active:scale-95 cursor-pointer transition-all text-red-600"
                          />
                        }
                        disableElevation
                        sx={{ textTransform: "none" }}
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <TextField
                      size="small"
                      fullWidth
                      id="outlined-basic"
                      label="Name"
                      variant="outlined"
                      error={!!errors.limit}
                      helperText={
                        errors.limit && (
                          <span className="text-red-600 text-xs mt-1">
                            {errors.limit.message}
                          </span>
                        )
                      }
                      {...register(`subAgents.${index}.name`)}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      id="outlined-basic"
                      label="Address"
                      variant="outlined"
                      error={!!errors.limit}
                      helperText={
                        errors.limit && (
                          <span className="text-red-600 text-xs mt-1">
                            {errors.limit.message}
                          </span>
                        )
                      }
                      {...register(`subAgents.${index}.address`)}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      id="outlined-basic"
                      label="Phone"
                      variant="outlined"
                      error={!!errors.limit}
                      helperText={
                        errors.limit && (
                          <span className="text-red-600 text-xs mt-1">
                            {errors.limit.message}
                          </span>
                        )
                      }
                      {...register(`subAgents.${index}.phone`)}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      id="outlined-basic"
                      label="Email"
                      variant="outlined"
                      error={!!errors.limit}
                      helperText={
                        errors.limit && (
                          <span className="text-red-600 text-xs mt-1">
                            {errors.limit.message}
                          </span>
                        )
                      }
                      {...register(`subAgents.${index}.email`)}
                    />
                  </div>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  disableElevation
                  startIcon={<AddIcon />}
                  sx={{ textTransform: "none" }}
                  size="small"
                  onClick={() => append({})}
                >
                  Add Sub Agent
                </Button>
              </div>

              <div className="flex items-center justify-end gap-3 mt-5">
                <Button
                  variant="outlined"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  size="small"
                  onClick={() => setOpenAdd(false)}
                >
                  Cancel
                </Button>
                <Button
                  loading={addingParty}
                  loadingPosition="start"
                  size="small"
                  variant="contained"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  type="submit"
                >
                  Add Party
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyManagementPage;
