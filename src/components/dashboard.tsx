"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RootState, AppDispatch } from '@/lib/store';
import PatientEnrollment from '@/components/patient-enrollment';  // Adjust the import path as needed

// Icon components
function ActivityIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function BarChartIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function CalendarIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ClockIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SearchIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function UserPlusIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

function UsersIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function XIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface DashboardProps {
  user: any;
}

interface ClinicData {
  totalPatients: number;
  activePatients: number;
  totalMinutesTracked: number;
  averageMinutesPerPatient: number;
  newPatients: number;
  followUpAppointments: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  useEffect(() => {
    if (selectedClinic?.id) {
      fetchClinicData(selectedClinic.id);
    }
  }, [selectedClinic]);

  const handleEnrollmentSuccess = () => {
    setShowEnrollmentForm(false);
    // Optionally, refresh the clinic data here
    if (selectedClinic?.id) {
      fetchClinicData(selectedClinic.id);
    }
  };

  const fetchClinicData = async (clinicId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4353/api/clinics/${clinicId}/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch clinic data');
      }
      const data = await response.json();
      setClinicData(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching clinic data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <header className="flex items-center justify-between bg-gray-800 p-4 text-white">
        <h1 className="text-xl">Dashboard</h1>
        <div>
          Current Clinic: {selectedClinic?.name}
        </div>
      </header>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <UsersIcon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.totalPatients}</div>
              <p className="text-xs text-muted-foreground">+5.2% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-green-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <ActivityIcon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.activePatients}</div>
              <p className="text-xs text-muted-foreground">+3.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Minutes Tracked</CardTitle>
              <ClockIcon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.totalMinutesTracked}</div>
              <p className="text-xs text-muted-foreground">+12.7% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Minutes per Patient</CardTitle>
              <BarChartIcon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.averageMinutesPerPatient}</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white text-black w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patient Enrollment</CardTitle>
              <UsersIcon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{clinicData?.newPatients}</div>
              <p className="text-xs text-muted-foreground">New patients this month</p>
            </CardContent>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => setShowEnrollmentForm(true)} >
                Enroll New Patient
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Follow-up Appointments</CardTitle>
              <ClockIcon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{clinicData?.followUpAppointments}</div>
              <p className="text-xs text-muted-foreground">Scheduled this month</p>
            </CardContent>
            <CardContent>
              <Button variant="outline" size="sm">
                Schedule Follow-up
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <ClockIcon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Calendar className="w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-col items-start w-full h-auto">
                <span className="font-semibold uppercase text-[0.65rem]">Date Range</span>
                <span className="font-normal">Last 30 days</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 max-w-[276px]">
              <Calendar />
            </PopoverContent>
          </Popover>
        </div>
      </main>
      {showEnrollmentForm && (
        <PatientEnrollment
          onClose={() => setShowEnrollmentForm(false)}
          onEnrollmentSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;