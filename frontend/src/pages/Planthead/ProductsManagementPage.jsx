import React from "react";
import ProductsTable from "../../components/Planthead/ProductsTable";

const ProductsManagementPage = () => {
  return (
    <div>
      <h1 className="lg:text-3xl md:text-2xl font-bold lg:mb-5 md:mb-5 sm:mb-5 mb-2 sm:text-lg text-base dark:text-gray-200">
        Product Management
      </h1>
      <div>
        <ProductsTable />
      </div>
    </div>
  );
};

export default ProductsManagementPage;
