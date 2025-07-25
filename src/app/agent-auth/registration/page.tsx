'use client';

import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Separator } from '@radix-ui/react-separator';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First Name is required'),
  middleName: Yup.string(), 
  sirName: Yup.string().required('Surname is required'),
  phoneNumber: Yup.string()
    .matches(/^\d+$/, 'Phone number must be digits only')
    .required('Phone Number is required'),
  physicalAddress: Yup.string().required('Physical Address is required'),
  villageResidence: Yup.string().required('Village of Residence is required'),
  taResidence: Yup.string().required('T/A of Current Residence is required'),
  districtResidence: Yup.string().required('Current District is required'),
  villagePermanent: Yup.string().required('Village of Permanent Residence is required'),
  taPermanent: Yup.string().required('T/A of Permanent Home is required'),
  districtPermanent: Yup.string().required('District of Origin is required'),
});

const AgentRegistration = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col justify-center items-center w-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-black">Agent Application Form</h2>
        <Formik
          initialValues={{
            firstName: '',
            middleName: '',
            sirName: '',
            phoneNumber: '',
            physicalAddress: '',
            villageResidence: '',
            taResidence: '',
            districtResidence: '',
            villagePermanent: '',
            taPermanent: '',
            districtPermanent: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            // Save the first form data in localStorage
            localStorage.setItem('registrationData', JSON.stringify(values));
            router.push('/agent-auth/complete-registration'); // Navigate to next page
          }}
        >
          {({ isValid, dirty }) => (
            <Form className="space-y-6">

               {/* Separator with Centered Text */}
              <div className="w-full flex flex-col">
              <div className="relative flex items-center my-8 mb-4 mt-12">
              <Separator className="flex-grow border border-gray-400" />
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-black-600 font-medium text-sm">
               Agent Personal Details
              </span>
              </div>
              </div>
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'firstName', label: 'First Name' },
                  { name: 'middleName', label: 'Middle Name' }, // Optional
                  { name: 'sirName', label: 'Surname' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-black font-medium">{field.label}</label>
                    <Field name={field.name} className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm" />
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'phoneNumber', label: 'Phone Number' },
                  { name: 'physicalAddress', label: 'Physical Address' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-black font-medium">{field.label}</label>
                    <Field name={field.name} className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm" />
                  </div>
                ))}
              </div>

              {/* Home of Residence */}
              <h3 className="text-lg font-semibold text-black">Home of Residence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'villageResidence', label: 'Village of Residence' },
                  { name: 'taResidence', label: 'T/A of Current Residence' },
                  { name: 'districtResidence', label: 'Current District' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-black font-medium">{field.label}</label>
                    <Field name={field.name} className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm" />
                  </div>
                ))}
              </div>

              {/* Permanent Home Address */}
              <h3 className="text-lg font-semibold text-black">Permanent Home Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'villagePermanent', label: 'Village of Permanent Residence' },
                  { name: 'taPermanent', label: 'T/A of Permanent Home' },
                  { name: 'districtPermanent', label: 'District of Origin' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-black font-medium">{field.label}</label>
                    <Field name={field.name} className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm" />
                  </div>
                ))}
              </div>
      

              {/* Separator with Centered Text */}
              <div className="w-full flex flex-col">
              <div className="relative flex items-center my-8 mb-4 mt-12">
              <Separator className="flex-grow border border-gray-400" />
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-black-600 font-medium text-sm">
               Next of Kin Details
              </span>
              </div>
              </div>

              {/* Next of Kin Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'firstName', label: 'First Name' },
                  { name: 'middleName', label: 'Middle Name' }, // Optional
                  { name: 'sirName', label: 'Surname' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-black font-medium">{field.label}</label>
                    <Field name={field.name} className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm" />
                  </div>
                ))}
              </div>
              {/* Next of Kin Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'phoneNumber', label: 'Phone Number' },
                  { name: 'physicalAddress', label: 'Physical Address' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-black font-medium">{field.label}</label>
                    <Field name={field.name} className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm" />
                  </div>
                ))}
              </div>

              {/* Next of Kin Home of Residence details */}
              <h3 className="text-lg font-semibold text-black">Next of Kin Home of Residence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'villageResidence', label: 'Village of Residence' },
                  { name: 'taResidence', label: 'T/A of Current Residence' },
                  { name: 'districtResidence', label: 'Current District' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-black font-medium">{field.label}</label>
                    <Field name={field.name} className="border-2 border-black p-2 rounded-md text-black" />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm" />
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={!isValid || !dirty}
                  className={`py-2 px-6 rounded-md w-full sm:w-auto ${
                    !isValid || !dirty
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AgentRegistration;
