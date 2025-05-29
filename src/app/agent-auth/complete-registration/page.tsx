"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

// Define API endpoint
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/agents/register";

// Define types for form values
interface FormValues {
  nationalId: File | null;
  hasVehicle: string;
  vehicleType: string;
  vehicleNumber: string;
  personalDescription: string;
  driversLicense?: File;
}

// Validation Schema
const validationSchema = Yup.object({
  nationalId: Yup.mixed()
    .test("fileRequired", "National ID photo is required", (value) => {
      if (!value) return false;
      return value instanceof File && ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
    })
    .required("National ID photo is required"),
  hasVehicle: Yup.string().required("Please select an option"),
  vehicleType: Yup.string().when("hasVehicle", {
    is: "yes",
    then: () => Yup.string().required("Vehicle type is required"),
  }),
  vehicleNumber: Yup.number().when("hasVehicle", {
    is: "yes",
    then: () => Yup.number().typeError("Must be a number").required("Number of vehicles is required"),
  }),
  personalDescription: Yup.string()
    .required("Personal description is required")
    .max(200, "Description cannot exceed 200 words"),
});

const AgentFinalRegistration = () => {
  const router = useRouter();

  // Handle Form Submission with proper typing
  const handleSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData();
      if (values.nationalId) {
        formData.append("nationalId", values.nationalId);
      }
      formData.append("hasVehicle", values.hasVehicle);
      if (values.hasVehicle === "yes") {
        formData.append("vehicleType", values.vehicleType);
        formData.append("vehicleNumber", values.vehicleNumber.toString());
      }
      formData.append("personalDescription", values.personalDescription);
      if (values.driversLicense) {
        formData.append("driversLicense", values.driversLicense);
      }

      await axios.post(API_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Registration submitted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col justify-center items-center w-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Complete Your Application
        </h2>
        <Formik
          initialValues={{
            nationalId: null,
            hasVehicle: "",
            vehicleType: "",
            vehicleNumber: "",
            personalDescription: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values, isValid, dirty }) => (
            <Form className="space-y-6">
              {/* National ID Upload */}
              <div className="flex flex-col">
                <label className="text-black font-medium">Upload National ID Photo</label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      setFieldValue("nationalId", file);
                    }
                  }}
                  className="border-2 border-black p-2 rounded-md bg-white text-black"
                />
                <ErrorMessage name="nationalId" component="div" className="text-red-500 text-sm" />
              </div>
                
              {/* Driver's License Upload */}
              <div className="flex flex-col">
                <label className="text-black font-medium">Upload Driver&apos;s License Photo</label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      setFieldValue("driversLicense", file);
                    }
                  }}
                  className="border-2 border-black p-2 rounded-md bg-white text-black"
                />
                <ErrorMessage name="driversLicense" component="div" className="text-red-500 text-sm" />
              </div>

              {/* Vehicle Ownership Question */}
              <div className="flex flex-col">
                <label className="text-black font-medium">Do you have a vehicle?</label>
                <div className="flex space-x-4">
                  {["yes", "no"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <Field
                        type="radio"
                        name="hasVehicle"
                        value={option}
                        onChange={() => setFieldValue("hasVehicle", option)}
                        className="mr-2"
                      />
                      <span className="text-black">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                    </label>
                  ))}
                </div>
                <ErrorMessage name="hasVehicle" component="div" className="text-red-500 text-sm" />
              </div>

              {/* Vehicle Details (Conditionally Shown) */}
              {values.hasVehicle === "yes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-black font-medium">Type of Vehicle</label>
                    <Field name="vehicleType" className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name="vehicleType" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-black font-medium">Number of Vehicles</label>
                    <Field
                      name="vehicleNumber"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setFieldValue("vehicleNumber", e.target.value.replace(/\D/g, ""))
                      }
                      className="border-2 border-black p-1 rounded-md text-black w-20"
                    />
                    <ErrorMessage name="vehicleNumber" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>
              )}

              {/* Personal Description */}
              <div className="flex flex-col">
                <label className="text-black font-medium">Personal Description</label>
                <Field
                  as="textarea"
                  name="personalDescription"
                  className="border-2 border-black p-2 rounded-md text-black"
                  rows={4}
                  maxLength={200}
                />
                <ErrorMessage name="personalDescription" component="div" className="text-red-500 text-sm" />
              </div>

              {/* Submit Button */}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => router.push("/agent-auth/registration")}
                  className="flex items-center py-2 px-6 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                >
                  &larr; Previous
                </button>
                <button
                  type="submit"
                  disabled={!isValid || !dirty}
                  className={`py-2 px-6 rounded-md w-full sm:w-auto ${
                    !isValid || !dirty
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Submit Registration
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AgentFinalRegistration;