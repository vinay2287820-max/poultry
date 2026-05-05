import React, { useState } from "react";
import OrdersForAccountant from "../../components/Accountant/OrdersForAccountant";
import ApproveAdvancePaymentOrders from "../../components/Accountant/ApproveAdvancePaymentOrders";
import ApproveDuePaymentOrders from "../../components/Accountant/ApproveDuePaymentOrders";
import { Button, ButtonGroup, useMediaQuery, useTheme } from "@mui/material";

const AccoutantDashboardPage = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const orderTypes = ["Dispatched Orders", "Approve Advance", "Approve Due"];
  const [isActive, setIsActive] = useState("Dispatched Orders");
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl md:text-2xl font-bold lg:mb-5 md:mb-5 sm:mb-5 mb-2 sm:text-lg text-base dark:text-gray-200">
          {isActive}
        </h1>
      </div>

      <div className="mb-5">
        <ButtonGroup aria-label="Medium-sized button group">
          {orderTypes.map((order) => (
            <Button
              size={isMdUp ? "medium" : "small"}
              key={order}
              disableElevation
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
        {isActive === "Dispatched Orders" && <OrdersForAccountant />}
        {isActive === "Approve Advance" && <ApproveAdvancePaymentOrders />}
        {isActive === "Approve Due" && <ApproveDuePaymentOrders />}
      </div>
    </div>
  );
};

export default AccoutantDashboardPage;
