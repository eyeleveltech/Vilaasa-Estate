/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";


interface AdminDirtyFormContextType {
  isFormDirty: boolean;
  setIsFormDirty: (dirty: boolean) => void;
}

const AdminDirtyFormContext = createContext<AdminDirtyFormContextType>({
  isFormDirty: false,
  setIsFormDirty: () => {},
});

export const AdminDirtyFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);

  return (
    <AdminDirtyFormContext.Provider value={{ isFormDirty, setIsFormDirty }}>
      {children}
    </AdminDirtyFormContext.Provider>
  );
};

export const useAdminDirtyForm = () => useContext(AdminDirtyFormContext);
