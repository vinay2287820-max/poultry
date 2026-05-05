import React, { useState } from "react";
import { useAdminOrder } from "../../hooks/useAdminOrders";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PartyToApproveForAdmin from "../../components/Admin/PartyManagement/PartyToApproveForAdmin";
import AllPartiesForAdmin from "../../components/Admin/PartyManagement/AllPartiesForAdmin";
import ApprovedPartiesForAdmin from "../../components/Admin/PartyManagement/ApprovedPartiesForAdmin";
import RejectedPartiesForAdmin from "../../components/Admin/PartyManagement/RejectedPartiesForAdmin";

const PartyManagementPage = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const partyTypes = [
    "All Parties",
    "Pending Approvals",
    "Approved Parties",
    "Rejected Parties",
  ];
  const [isActive, setIsActive] = useState("All Parties");
  const {
    partiesToApprove,
    partiesToApproveLoading,
    allParties,
    approvedParties,
    rejectedParties,
    rejectedPartiesLoading,
    approvedPartiesLoading,
    allPartiesLoading,
  } = useAdminOrder();

  if (
    partiesToApproveLoading ||
    allPartiesLoading ||
    approvedPartiesLoading ||
    rejectedPartiesLoading
  ) {
    return <CircularProgress />;
  }

  return (
    <div>
      <div>
        <h1 className="lg:text-3xl md:text-xl font-bold sm:text-lg text-base dark:text-gray-200">
          {isActive}
        </h1>
      </div>

      <div className="lg:my-5 sm:my-5 md:my-5 my-3 hidden md:block lg:block sm:block">
        <ButtonGroup
          aria-label="Medium-sized button group"
          size={isMdUp ? "medium" : "small"}
        >
          {partyTypes.map((party) => (
            <Button
              key={party}
              disableElevation
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
      <div className="lg:my-5 sm:my-5 md:my-5 my-3 md:hidden lg:hidden sm:hidden">
        <FormControl size="small" fullWidth>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
          >
            {partyTypes.map((party) => (
              <MenuItem key={party} value={party}>
                {party}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {isActive === "All Parties" && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 lg:gap-7 md:gap-5 sm:gap-3 gap-3 mt-5 min-h-[200px]">
          {allParties?.length > 0 ? (
            allParties.map((party) => (
              <AllPartiesForAdmin party={party} key={party._id} />
            ))
          ) : (
            <div className="col-span-3 w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
              No Parties Found
            </div>
          )}
        </div>
      )}

      {isActive === "Pending Approvals" && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 lg:gap-7 md:gap-5 sm:gap-3 gap-3 mt-5 min-h-[200px]">
          {partiesToApprove?.length > 0 ? (
            partiesToApprove.map((party) => (
              <PartyToApproveForAdmin party={party} key={party._id} />
            ))
          ) : (
            <div className="col-span-3 w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
              No Pending Parties Found
            </div>
          )}
        </div>
      )}

      {isActive === "Approved Parties" && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 lg:gap-7 md:gap-5 sm:gap-3 gap-3 mt-5 min-h-[200px]">
          {approvedParties?.length > 0 ? (
            approvedParties.map((party) => (
              <ApprovedPartiesForAdmin party={party} key={party._id} />
            ))
          ) : (
            <div className="col-span-3 w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
              No Approved Parties Found
            </div>
          )}
        </div>
      )}

      {isActive === "Rejected Parties" && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 lg:gap-7 md:gap-5 sm:gap-3 gap-3 mt-5 min-h-[200px]">
          {rejectedParties?.length > 0 ? (
            rejectedParties.map((party) => (
              <RejectedPartiesForAdmin party={party} key={party._id} />
            ))
          ) : (
            <div className="col-span-3 w-full h-full flex flex-1 items-center justify-center text-center dark:text-gray-400  lg:min-h-[300px] min-h-[190px]">
              No Rejected Parties Found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartyManagementPage;
