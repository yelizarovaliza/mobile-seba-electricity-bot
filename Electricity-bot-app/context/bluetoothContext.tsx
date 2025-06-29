import React, { createContext, useContext, useState, ReactNode } from "react";

export const BluetoothContext = createContext<any>(null);
export const useBluetooth = () => useContext(BluetoothContext);

interface BluetoothProviderProps {
  children: ReactNode;
}

export function BluetoothProvider({ children }: BluetoothProviderProps) {
  const [connectedDevice, setConnectedDevice] = useState(null);

  return (
    <BluetoothContext.Provider value={{ connectedDevice, setConnectedDevice }}>
      {children}
    </BluetoothContext.Provider>
  );
}