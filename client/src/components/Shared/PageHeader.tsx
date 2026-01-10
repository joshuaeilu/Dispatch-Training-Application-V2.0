import React from "react";
import type { PageHeaderProps } from "../../types/index.types";

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle
}) => {

  return (
 <header className="mx-6 mt-6  bg-white">
  <div className="py-6 px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold tracking-tight text-brand-maroon">
      {title}
    </h1>
    <p className="mt-1.5 text-base font-medium text-gray-600">
      {subtitle}
    </p>
  </div>
</header>


  );
};
