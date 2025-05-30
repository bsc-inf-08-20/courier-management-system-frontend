"use client";

import React, { useState } from "react";

type ResponseData = {
  status: number;
  statusText: string;
  data: any;
};

const defaultUser = {
  name: "",
  email: "",
  password: "",
  phone_number: "",
  city: "",
  area: "",
  role: "ADMIN",
  current_city: "",
  is_active: true,
};
const defaultVehicle = {
  make: "",
  model: "",
  year: 2024,
  license_plate: "",
  vehicle_type: "",
  capacity: 0,
  is_active: true,
  is_in_maintenance: false,
  assigned_driver: null,
  current_city: "",
  destination_city: "",
};
const defaultAssignDriver = {
  vehicleId: "",
  driverId: "",
  bearerToken: "",
};

export default function PostmanLite() {
  // User Creation State
  const [user, setUser] = useState({ ...defaultUser });
  const [userResp, setUserResp] = useState<ResponseData | null>(null);

  // Vehicle Creation State
  const [vehicle, setVehicle] = useState({ ...defaultVehicle });
  const [vehicleResp, setVehicleResp] = useState<ResponseData | null>(null);

  // Assign Driver State
  const [assignDriver, setAssignDriver] = useState({ ...defaultAssignDriver });
  const [assignResp, setAssignResp] = useState<ResponseData | null>(null);

  // Helpers
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setVehicle((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "capacity" || name === "year"
          ? Number(value)
          : value,
    }));
  };
  const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAssignDriver((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handlers
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserResp(null);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await resp.json();
      setUserResp({ status: resp.status, statusText: resp.statusText, data });
    } catch (err) {
      setUserResp({
        status: 0,
        statusText: "Network error",
        data: String(err),
      });
    }
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleResp(null);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicle),
      });
      const data = await resp.json();
      setVehicleResp({ status: resp.status, statusText: resp.statusText, data });
    } catch (err) {
      setVehicleResp({
        status: 0,
        statusText: "Network error",
        data: String(err),
      });
    }
  };

  const handleAssignDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignResp(null);
    try {
      const { vehicleId, driverId, bearerToken } = assignDriver;
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/vehicles/${vehicleId}/assign-driver`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
          },
          body: JSON.stringify({ driverId: Number(driverId) }),
        }
      );
      const data = await resp.json();
      setAssignResp({ status: resp.status, statusText: resp.statusText, data });
    } catch (err) {
      setAssignResp({
        status: 0,
        statusText: "Network error",
        data: String(err),
      });
    }
  };

  // UI
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
        Postman Lite - API Playground
      </h1>
      {/* --- Create User --- */}
      <div className="bg-white border rounded shadow p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Create User</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleUserSubmit}>
          <input name="name" value={user.name} onChange={handleUserChange} className="border p-2 rounded" placeholder="Name" />
          <input name="email" type="email" value={user.email} onChange={handleUserChange} className="border p-2 rounded" placeholder="Email" />
          <input name="password" type="password" value={user.password} onChange={handleUserChange} className="border p-2 rounded" placeholder="Password" />
          <input name="phone_number" value={user.phone_number} onChange={handleUserChange} className="border p-2 rounded" placeholder="Phone Number" />
          <input name="city" value={user.city} onChange={handleUserChange} className="border p-2 rounded" placeholder="City" />
          <input name="area" value={user.area} onChange={handleUserChange} className="border p-2 rounded" placeholder="Area" />
          <select name="role" value={user.role} onChange={handleUserChange} className="border p-2 rounded">
            <option value="ADMIN">ADMIN</option>
            <option value="AGENT">AGENT</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
          <input name="current_city" value={user.current_city} onChange={handleUserChange} className="border p-2 rounded" placeholder="Current City" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={user.is_active} onChange={handleUserChange} />
            Active
          </label>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-2 md:col-span-2">
            Send Request
          </button>
        </form>
        {userResp && (
          <div className="mt-4 p-2 rounded bg-gray-100">
            <div className="text-sm text-gray-600 mb-1">
              Response: <b>{userResp.status}</b> {userResp.statusText}
            </div>
            <pre className="bg-gray-50 text-xs p-2 rounded overflow-x-auto">{JSON.stringify(userResp.data, null, 2)}</pre>
          </div>
        )}
      </div>
      {/* --- Create Vehicle --- */}
      <div className="bg-white border rounded shadow p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4 text-green-700">Create Vehicle</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleVehicleSubmit}>
          <input name="make" value={vehicle.make} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="Make" />
          <input name="model" value={vehicle.model} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="Model" />
          <input name="year" type="number" value={vehicle.year} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="Year" />
          <input name="license_plate" value={vehicle.license_plate} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="License Plate" />
          <input name="vehicle_type" value={vehicle.vehicle_type} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="Vehicle Type" />
          <input name="capacity" type="number" value={vehicle.capacity} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="Capacity" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={vehicle.is_active} onChange={handleVehicleChange} />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_in_maintenance" checked={vehicle.is_in_maintenance} onChange={handleVehicleChange} />
            In Maintenance
          </label>
          <input name="current_city" value={vehicle.current_city} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="Current City" />
          <input name="destination_city" value={vehicle.destination_city} onChange={handleVehicleChange} className="border p-2 rounded" placeholder="Destination City" />
          <button type="submit" className="bg-green-700 text-white rounded px-4 py-2 mt-2 md:col-span-2">
            Send Request
          </button>
        </form>
        {vehicleResp && (
          <div className="mt-4 p-2 rounded bg-gray-100">
            <div className="text-sm text-gray-600 mb-1">
              Response: <b>{vehicleResp.status}</b> {vehicleResp.statusText}
            </div>
            <pre className="bg-gray-50 text-xs p-2 rounded overflow-x-auto">{JSON.stringify(vehicleResp.data, null, 2)}</pre>
          </div>
        )}
      </div>
      {/* --- Assign Driver --- */}
      <div className="bg-white border rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">Assign Driver to Vehicle</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleAssignDriverSubmit}>
          <input name="vehicleId" value={assignDriver.vehicleId} onChange={handleAssignChange} className="border p-2 rounded" placeholder="Vehicle ID (e.g. 6)" />
          <input name="driverId" value={assignDriver.driverId} onChange={handleAssignChange} className="border p-2 rounded" placeholder="Driver ID (e.g. 12)" />
          <input name="bearerToken" value={assignDriver.bearerToken} onChange={handleAssignChange} className="border p-2 rounded" placeholder="Bearer Token (required)" />
          <button type="submit" className="bg-purple-700 text-white rounded px-4 py-2 md:col-span-3">
            Assign Driver
          </button>
        </form>
        {assignResp && (
          <div className="mt-4 p-2 rounded bg-gray-100">
            <div className="text-sm text-gray-600 mb-1">
              Response: <b>{assignResp.status}</b> {assignResp.statusText}
            </div>
            <pre className="bg-gray-50 text-xs p-2 rounded overflow-x-auto">{JSON.stringify(assignResp.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}