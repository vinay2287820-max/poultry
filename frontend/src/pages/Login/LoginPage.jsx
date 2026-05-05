import React from "react";
import { Controller, useForm } from "react-hook-form";
import useLogin from "../../hooks/useLogin";
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useUser } from "../../hooks/useUser";
import logo from "../../assets/logo6.png";
import "../../App.css";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const { user, isPending: userLoading } = useUser();

  const { login, isPending } = useLogin();


  const onSubmit = (data) => {
    login(data, {
      
    });
  };

  if (isPending || userLoading)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <CircularProgress />
      </div>
    );

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full dark:bg-gray-950">
      <div className="mb-5">
        <h1 className="font-semibold text-center flex flex-col items-center text-2xl dark:text-gray-300">
          <img src={logo} alt="" className="w-14 h-14" />
          <span className="text-[#1976D2] text-3xl mt-2 text-center logo">
            Welcome Back
          </span>
          <span className="text-gray-400 text-sm mt-2 text-center">
            Select your role and log in to continue
          </span>
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 w-96 max-w-[90%]"
      >
        <div>
          <FormControl
            fullWidth
            size="small"
            error={!!errors.role}
            className="mb-4"
          >
            <InputLabel id="role-label">Role</InputLabel>
            <Controller
              name="role"
              control={control}
              defaultValue=""
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select {...field} labelId="role-label" id="role" label="Role">
                  <MenuItem value="">Select Role</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="salesman">Salesman</MenuItem>
                  <MenuItem value="manager">Sales Manager</MenuItem>
                  <MenuItem value="authorizer">Sales Authorizer</MenuItem>
                  <MenuItem value="plant_head">Plant Head</MenuItem>
                  <MenuItem value="accountant">Accountant</MenuItem>
                </Select>
              )}
            />
            {errors?.role && (
              <span className="text-red-600 text-xs mt-1">
                {errors.role.message}
              </span>
            )}
          </FormControl>
        </div>
        <div>
          <TextField
            error={!!errors.email}
            size="small"
            fullWidth
            id="email"
            label="Email"
            variant="outlined"
            {...register("email", {
              required: { value: true, message: "Email is required" },
            })}
          />
          {errors?.email && (
            <span className="text-red-600 text-xs mt-1">
              {errors?.email?.message}
            </span>
          )}
        </div>
        <div>
          <TextField
            error={!!errors.password}
            size="small"
            id="password"
            fullWidth
            label="Password"
            variant="outlined"
            {...register("password", {
              required: { value: true, message: "Password is required" },
            })}
          />
          {errors?.password && (
            <span className="text-red-600 text-xs mt-1">
              {errors?.password?.message}
            </span>
          )}
        </div>
        <Button disableElevation fullWidth type="submit" variant="contained">
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
