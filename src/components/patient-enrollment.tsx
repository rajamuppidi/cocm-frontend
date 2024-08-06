'use client';

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface PatientEnrollmentProps {
  selectedClinic: {
    id: number;
    name: string;
  };
  onClose: () => void;
  onEnrollmentSuccess: () => void;
}

const schema = yup.object().shape({
  mrn: yup.string().required('MRN is required'),
  careManagerId: yup.number().required('Care Manager is required').typeError('Care Manager is required'),
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  enrollmentDate: yup.date().required('Enrollment Date is required').nullable().typeError('Enrollment Date is required'),
  dob: yup.date().required('Date of Birth is required').nullable().typeError('Date of Birth is required'),
});

export default function PatientEnrollment({ selectedClinic, onClose, onEnrollmentSuccess }: PatientEnrollmentProps) {
  const [careManagers, setCareManagers] = useState([]);
  const [psychiatricConsultants, setPsychiatricConsultants] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid }, control, watch, setValue } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (selectedClinic) {
      const fetchAssociatedUsers = async () => {
        try {
          const careManagerResponse = await fetch(`http://localhost:4353/api/patients/care-managers?clinicId=${selectedClinic.id}`);
          const careManagersData = await careManagerResponse.json();
          setCareManagers(Array.isArray(careManagersData) ? careManagersData : []);

          const consultantResponse = await fetch(`http://localhost:4353/api/patients/consultants?clinicId=${selectedClinic.id}`);
          const consultantsData = await consultantResponse.json();
          setPsychiatricConsultants(Array.isArray(consultantsData) ? consultantsData : []);

        } catch (error) {
          setSubmissionStatus('Error fetching associated users');
          console.error("Error fetching associated users:", error);
        }
      };

      fetchAssociatedUsers();
    }
  }, [selectedClinic]);

  const onSubmit = async (data) => {
    setSubmissionStatus(null); // Reset the status before submitting

    // Format dates to "MM/dd/yyyy" before sending to the backend
    const formattedData = {
      ...data,
      enrollmentDate: data.enrollmentDate ? format(data.enrollmentDate, 'MM/dd/yyyy') : null,
      dob: data.dob ? format(data.dob, 'MM/dd/yyyy') : null,
      clinicId: selectedClinic.id,
    };

    try {
      const response = await fetch(`http://localhost:4353/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      if (response.ok) {
        setSubmissionStatus('Patient enrolled successfully');
        setOpenSnackbar(true); // Show success message
        onEnrollmentSuccess(); // Call the callback function to refresh data
        // Do not close the form immediately, wait for the Snackbar to disappear
      } else {
        const errorData = await response.json();
        setSubmissionStatus(`Error enrolling patient: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setSubmissionStatus(`Error enrolling patient: ${error.message}`);
    }
  };

  const setToday = () => {
    const today = new Date();
    setValue('enrollmentDate', today);
  };

  const careManagerId = watch("careManagerId");
  const psychiatricConsultantId = watch("psychiatricConsultantId");

  const handleCloseSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
    onClose(); // Close the form after the Snackbar is closed
  };

  return (
    <center>
      <Card className="w-full max-w-4xl bg-white shadow-md">
        <CardHeader>
          <CardTitle>Patient Enrollment</CardTitle>
          <CardDescription>Enroll a new patient</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <Label htmlFor="clinic">Primary Clinic</Label>
              <Input id="clinic" value={selectedClinic.name} disabled />
            </div>
            <div className="space-y-4">
              <Label htmlFor="enrollment-date">Enrollment Date</Label>
              <div className="flex items-center space-x-2">
                <Controller
                  name="enrollmentDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="MM/dd/yyyy"
                      className="input"
                      placeholderText="Select date"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                    />
                  )}
                />
                <Button type="button" onClick={setToday}>
                  Today
                </Button>
              </div>
              {errors.enrollmentDate && <p className="text-red-600">{errors.enrollmentDate.message}</p>}
            </div>
            <div className="space-y-4">
              <Label htmlFor="mrn">MRN</Label>
              <Input id="mrn" {...register("mrn")} placeholder="Enter MRN" required />
              {errors.mrn && <p className="text-red-600">{errors.mrn.message}</p>}
            </div>
          </CardContent>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <Label htmlFor="care-manager">Care Manager</Label>
              <Select id="care-manager" name="careManagerId" value={careManagerId} onValueChange={(value) => setValue('careManagerId', value)} onMouseDown={(e) => e.stopPropagation()}>
                <SelectTrigger>
                  <SelectValue>{careManagerId ? careManagers.find(manager => manager.id.toString() === careManagerId)?.name : 'Select care manager'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="select-content">
                  {careManagers.length > 0 && careManagers.map(manager => (
                    <SelectItem key={manager.id} value={manager.id.toString()}>{manager.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.careManagerId && <p className="text-red-600">{errors.careManagerId.message}</p>}
            </div>
            <div className="space-y-4">
              <Label htmlFor="consultant">Psychiatric Consultant</Label>
              <Select id="consultant" name="psychiatricConsultantId" value={psychiatricConsultantId} onValueChange={(value) => setValue('psychiatricConsultantId', value)} onMouseDown={(e) => e.stopPropagation()}>
                <SelectTrigger>
                  <SelectValue>{psychiatricConsultantId ? psychiatricConsultants.find(consultant => consultant.id.toString() === psychiatricConsultantId)?.name : 'Select consultant'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="select-content">
                  {psychiatricConsultants.length > 0 && psychiatricConsultants.map(consultant => (
                    <SelectItem key={consultant.id} value={consultant.id.toString()}>{consultant.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <Separator />
          <CardHeader>
            <CardTitle>Demographic Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" {...register("firstName")} placeholder="Enter first name" required />
              {errors.firstName && <p className="text-red-600">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-4">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" {...register("lastName")} placeholder="Enter last name" required />
              {errors.lastName && <p className="text-red-600">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-4">
              <Label htmlFor="dob">Date of Birth</Label>
              <div className="input-container">
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="MM/dd/yyyy"
                      className="input"
                      placeholderText="Select date"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                    />
                  )}
                />
              </div>
              {errors.dob && <p className="text-red-600">{errors.dob.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-500 text-white" disabled={!isValid}>Enroll Patient</Button>          
          </CardFooter>
        </form>
        {submissionStatus && <p className="mt-4 text-center">{submissionStatus}</p>}
      </Card>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Patient enrolled successfully!
        </Alert>
      </Snackbar>
    </center>
  );
}
