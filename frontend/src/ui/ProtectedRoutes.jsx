import { useUser } from "../hooks/useUser";
import { Navigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, isPending, error } = useUser();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    console.log(error);
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoutes;
