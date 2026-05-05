import React, { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";
import { Button, CircularProgress, TextField, Tooltip } from "@mui/material";
import { useForm } from "react-hook-form";
import { usePlantheadOrder } from "../../hooks/usePlanthead";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "../../context/ThemeContext";

const ProductsTable = () => {
  const { resolvedTheme } = useTheme();
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productId, setProductId] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (productId) {
      const product = productsInPlanthead?.find(
        (product) => product.productId === productId
      );
      setSelectedProduct(product);
      setValue("quantity", product.quantity);
    }
  }, [productId]);

  const {
    updateProductQuantity,
    isUpdatingProductQuantity,
    productsInPlanthead,
    productsInPlantheadLoading,
  } = usePlantheadOrder();

  const onUpdate = (data) => {
    data.productId = productId;
    console.log(data);
    updateProductQuantity(data);
    setOpenEdit(false);
  };

  if (productsInPlantheadLoading) return <CircularProgress />;

  const columns = [
    { field: "product", headerName: "Product", flex: 1, minWidth: 150 },
    { field: "category", headerName: "Category", flex: 1, minWidth: 150 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 150 },
    { field: "quantity", headerName: "Quantity", flex: 1, minWidth: 100 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center h-full gap-1">
          <Tooltip title="Update Quantity" placement="top" enterDelay={500}>
            <SquarePen
              className="hover:bg-green-100 text-green-600 dark:hover:bg-green-950 active:scale-95 transition-all p-1.5 rounded-lg"
              size={30}
              onClick={() => {
                setProductId(params.row.id);
                setOpenEdit(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const rows = productsInPlanthead?.map((product) => ({
    id: product.productId,
    product: product?.name,
    category: product?.category,
    description: product?.description,
    quantity: `${product.quantity} bags`,
  }));

  return (
    <div>
      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        pagination
        autoHeight
        disableColumnResize={false}
        getRowHeight={() => "auto"}
        sx={{
          width: "100%",
          borderRadius: "6px",
          borderColor: resolvedTheme === "dark" ? "transparent" : "#e5e7eb",
          backgroundColor: resolvedTheme === "dark" ? "#0f172a" : "#fff",
          color: resolvedTheme === "dark" ? "#e5e7eb" : "#111827",

          // 🔹 Header Row Background
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor:
              resolvedTheme === "dark"
                ? "#1e293b !important"
                : "#f9fafb !important",
            color: resolvedTheme === "dark" ? "#f1f5f9" : "#000",
          },

          // 🔹 Header Cell
          "& .MuiDataGrid-columnHeader": {
            backgroundColor:
              resolvedTheme === "dark"
                ? "#1e293b !important"
                : "#f9fafb !important",
            color: resolvedTheme === "dark" ? "#9ca3af" : "#000",
          },

          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "600",
            textTransform: "uppercase",
            fontSize: "12px",
          },

          // ❌ Remove blue outline when cell is active/focused
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },

          // 🔹 Hover row (lighter shade)
          "& .MuiDataGrid-row:hover": {
            backgroundColor:
              resolvedTheme === "dark"
                ? "rgba(59,130,246,0.1)"
                : "rgba(59,130,246,0.05)",
            transition: "background-color 0.2s ease-in-out",
          },

          // 🔹 Pagination buttons
          "& .MuiTablePagination-root": {
            color: resolvedTheme === "dark" ? "#e5e7eb" : "#111827",
          },

          "& .MuiPaginationItem-root": {
            borderRadius: "6px",
            color: resolvedTheme === "dark" ? "#e5e7eb" : "#111827",
          },

          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: resolvedTheme === "dark" ? "#1e40af" : "#2563eb",
            color: "#fff",
          },

          "& .MuiPaginationItem-root:hover": {
            backgroundColor: resolvedTheme === "dark" ? "#1e3a8a" : "#dbeafe",
          },

          // ✅ Add these styles for multi-line rows:
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            padding: "8px",
            lineHeight: "normal",
            overflowY: "auto",

            scrollbarColor: "#80808040 transparent",
            scrollbarWidth: "thin",
            scrollbarGutter: "stable",

            borderColor: resolvedTheme === "dark" ? "#374151" : "#e5e7eb",
            backgroundColor: resolvedTheme === "dark" ? "#0f172a" : "#fff",
            color: resolvedTheme === "dark" ? "#9ca3af" : "#000",

            "&::-webkit-scrollbar": {
              width: "4px",
              height: "4px",
            },

            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#80808080",
              borderRadius: "4px",
            },

            "&::-webkit-scrollbar-button:single-button": {
              display: "none",
              width: "0px",
              height: "0px",
              background: "transparent",
              border: "none",
            },

            "&::-webkit-scrollbar-button": {
              display: "none",
              width: 0,
              height: 0,
              background: "transparent",
            },
          },

          "& .MuiDataGrid-row": {
            maxHeight: "100px !important",
            minHeight: "50px !important",
          },
        }}
      />

      {/* --- Edit Product Modal --- */}
      {openEdit && (
        <div className="transition-all bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm w-full z-50 h-screen absolute top-0 left-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-7 rounded-lg w-[29rem]">
            <p className="lg:text-xl text-base dark:text-gray-200 font-semibold mb-7">
              Update Product Quantity
            </p>
            <form className="space-y-5" onSubmit={handleSubmit(onUpdate)}>
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label=" Category"
                variant="outlined"
                name="category"
                disabled
                value={selectedProduct?.category || ""}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Product Name"
                variant="outlined"
                disabled
                name="name"
                value={selectedProduct?.name || ""}
              />
              <TextField
                size="small"
                fullWidth
                id="outlined-basic"
                label="Description"
                variant="outlined"
                disabled
                name="description"
                value={selectedProduct?.description || ""}
              />
              <TextField
                error={!!errors.quantity}
                size="small"
                fullWidth
                id="outlined-basic"
                label="Quantity (in bags)"
                variant="outlined"
                type="number"
                {...register("quantity", {
                  required: { value: true, message: "Quantity is required" },
                })}
              />
              {errors.quantity && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.quantity.message}
                </span>
              )}
              <div className="flex items-center justify-end gap-3 mt-5">
                <Button
                  variant="outlined"
                  disableElevation
                  sx={{ textTransform: "none" }}
                  onClick={() => setOpenEdit(false)}
                >
                  Cancel
                </Button>
                <Button
                  loading={isUpdatingProductQuantity}
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

export default ProductsTable;
