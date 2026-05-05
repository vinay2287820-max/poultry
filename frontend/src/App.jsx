import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/Login/LoginPage";
import SalesmanDashboardPage from "./pages/Salesman/SalesmanDashboardPage";
import ProductManagementPage from "./pages/Admin/ProductManagementPage";
import EmployeeManagementPage from "./pages/Admin/EmployeeManagementPage";
import OrderManagementPage from "./pages/Admin/OrderManagementPage";
import PlantManagementPage from "./pages/Admin/PlantManagementPage";
import ProtectedRoutes from "./ui/ProtectedRoutes";
import SalesAuthorizerDashboardPage from "./pages/SalesAuthorizer/SalesAuthorizerDashboardPage";
import SalesManagerDashboardPage from "./pages/SalesManager/SalesManagerDashboardPage";
import PlantheadDashboardPage from "./pages/Planthead/PlantheadDashboardPage";
import AccoutantDashboardPage from "./pages/Accountant/AccoutantDashboardPage";
import ProductsManagementPage from "./pages/Planthead/ProductsManagementPage";
import PartyManagementPage from "./pages/Salesman/PartyManagementPage";
import PartyManagementPageAdmin from "./pages/Admin/PartyManagementPage";
import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { useTheme } from "./context/ThemeContext";
import { UnreadChatsProvider } from "./context/UnreadChatsContext";

const App = () => {
  const { resolvedTheme } = useTheme();
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme === "dark" ? "dark" : "light",
          primary: {
            main: "#1976d2", // same rakho jo tumhe light mode me chahiye
          },
          secondary: {
            main: "#9c27b0",
          },
          background: {
            default: resolvedTheme === "dark" ? "#121212" : "#ffffff",
            paper: resolvedTheme === "dark" ? "#1e1e1e" : "#f9f9f9",
          },
          text: {
            primary: resolvedTheme === "dark" ? "#ffffff" : "#000000",
          },
        },
      }),
    [resolvedTheme]
  );

  return (
    <UnreadChatsProvider>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoutes>
                <MainLayout />
              </ProtectedRoutes>
            }
          >
            {/* Admin routes*/}
            <Route path="admin">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route
                path="product-management"
                element={<ProductManagementPage />}
              />
              <Route
                path="employee-management"
                element={<EmployeeManagementPage />}
              />
              <Route
                path="order-management"
                element={<OrderManagementPage />}
              />
              <Route
                path="plant-management"
                element={<PlantManagementPage />}
              />
              <Route
                path="party-management"
                element={<PartyManagementPageAdmin />}
              />
            </Route>

            {/* Salesman routes */}
            <Route path="salesman">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SalesmanDashboardPage />} />
              <Route
                path="party-management"
                element={<PartyManagementPage />}
              />
            </Route>

            {/* Sales Manager routes */}
            <Route path="salesmanager">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SalesManagerDashboardPage />} />
            </Route>

            {/* Sales Authorizer routes */}
            <Route path="salesauthorizer">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route
                path="dashboard"
                element={<SalesAuthorizerDashboardPage />}
              />
            </Route>

            {/* Plant Head routes */}
            <Route path="planthead">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PlantheadDashboardPage />} />
              <Route
                path="product-management"
                element={<ProductsManagementPage />}
              />
            </Route>

            {/* Accountant routes */}
            <Route path="accountant">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AccoutantDashboardPage />} />
            </Route>
          </Route>

          {/* Login route */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </ThemeProvider>
    </UnreadChatsProvider>
  );
};

export default App;
