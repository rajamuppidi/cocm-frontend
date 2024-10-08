'use client';

import React, { useEffect, useState } from 'react';
import InitialAssessmentForm from './InitialAssessmentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PatientData {
  patientId: number;
  clinicId: number;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  enrollmentDate: string;
  clinicName: string;
  status: string;
  phq9First: number | null;
  phq9Last: number | null;
  gad7First: number | null;
  gad7Last: number | null;
  providers: Provider[];
}

interface Provider {
  id?: number;
  providerType: string;
  name: string;
  phone: string;
  email: string;
  serviceBeginDate: string;
  serviceEndDate: string | null;
}

interface PatientDashboardProps {
  params: {
    patientId: string;
  };
}

export default function PatientDashboard({ params }: PatientDashboardProps) {
  const { patientId } = params;
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInitialAssessment, setShowInitialAssessment] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientData(patientId);
    } else {
      setError("No patient ID provided");
      setLoading(false);
    }
  }, [patientId]);

  const fetchPatientData = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4353/api/patients/${id}`);
      if (!response.ok) throw new Error('Failed to fetch patient data');
      const data = await response.json();
      console.log('Fetched patient data:', data);
      console.log('Clinic ID:', data.clinicId);
      setPatientData(data);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleInitialAssessmentSuccess = () => {
    setShowInitialAssessment(false);
    if (patientId) {
      fetchPatientData(patientId);
    }
  };

  if (loading) return <p>Loading patient data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!patientData) return <p>No patient data available.</p>;

  const careManager = patientData.providers.find(p => p.providerType === 'BHCM');

  const showInitialAssessmentButton = patientData.status === 'E' && patientData.clinicName;

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Clinical Dashboard</h1>
        <p className="text-sm">
          {patientData.lastName}, {patientData.firstName} | Status: {patientData.status}
          <br />
          Patient ID: {patientData.patientId} | MRN: {patientData.mrn}
          <br />
          Age: {new Date().getFullYear() - new Date(patientData.dob).getFullYear()} | DOB: {patientData.dob}
        </p>
      </div>

      <div className="p-4 flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-4">
          {/* Customize Dashboard View */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Customize Dashboard View</h2>
            <div className="space-y-2">
              {['Patient Information', 'Clinical Measures', 'Treatment History', 'Deactivation Information'].map((item, index) => (
                <div key={index} className="flex items-center">
                  <Checkbox id={item.toLowerCase().replace(/\s/g, '-')} defaultChecked={index < 4} />
                  <Label htmlFor={item.toLowerCase().replace(/\s/g, '-')} className="ml-2">{item}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Reminders</h2>
            <p>No reminders</p>
          </div>

          {/* Last Contact */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Last Contact</h2>
            <p>Monday, June 10, 2024</p>
            <p>with Andrea Marsh, Helen Newberry Joy Hospital</p>
          </div>

          {/* Flags */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">Flags</h2>
            <p>Psychiatric Consult: Yes</p>
            <p>Safety Risk: No</p>
            <div className="mt-2">
              <Button variant="outline" className="mr-2">Unflag</Button>
              <Button variant="outline">Flag</Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          {showInitialAssessmentButton && (
            <Button
              onClick={() => setShowInitialAssessment(true)}
              className="mb-4 bg-green-500 hover:bg-green-600 text-white"
            >
              Start Initial Assessment
            </Button>
          )}

          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Enrollment</h3>
                <p><strong>Primary Clinic:</strong> {patientData.clinicName}</p>
                <p><strong>MRN:</strong> {patientData.mrn}</p>
                <p><strong>Enrollment Date:</strong> {patientData.enrollmentDate}</p>
                <p><strong>Patient ID:</strong> {patientData.patientId}</p>
              </div>
              <div>
                <h3 className="font-semibold">Demographic Information</h3>
                <p><strong>Last Name:</strong> {patientData.lastName}</p>
                <p><strong>First Name:</strong> {patientData.firstName}</p>
                <p><strong>Date of Birth:</strong> {patientData.dob}</p>
              </div>
            </div>
          </div>

          {/* Current Providers */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Providers</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Service Begin</th>
                  <th className="p-2 text-left">Service End</th>
                </tr>
              </thead>
              <tbody>
                {patientData.providers.map((provider, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2">{provider.providerType}</td>
                    <td className="p-2">{provider.name}</td>
                    <td className="p-2">{provider.phone}</td>
                    <td className="p-2">{provider.email}</td>
                    <td className="p-2">{provider.serviceBeginDate}</td>
                    <td className="p-2">{provider.serviceEndDate || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Measures */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Clinical Measures</h2>
            {['PHQ-9', 'GAD-7'].map((measure, index) => (
              <div key={index} className="mb-2">
                <p>
                  <strong>{measure} Score:</strong> {index === 0 ? '14/27' : '12/21'}, Moderate
                  <span className="ml-4 text-sm text-gray-500">Last updated by: Andrea Marsh, 6/10/2024</span>
                  <Button variant="outline" size="sm" className="ml-2">History</Button>
                  <Button variant="outline" size="sm" className="ml-2">Expand</Button>
                </p>
              </div>
            ))}
          </div>

          {/* Psychiatric Consultant
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Psychiatric Consultant</h2>
            <h3 className="font-semibold">Discuss with Psychiatric Consultant</h3>
            <div className="flex items-center mt-2">
              <Checkbox id="discussWithConsultant" />
              <Label htmlFor="discussWithConsultant" className="ml-2">
                Would you like to discuss this patient with the psychiatric consultant?
              </Label>
            </div>
            <div className="mt-2">
              <Label htmlFor="consultantNotes" className="block">Notes for Psychiatric Consultant:</Label>
              <Textarea id="consultantNotes" className="w-full mt-1" rows={3} placeholder="medication questions" />
            </div>
          </div> */}

          {/* Treatment History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Treatment History</h2>
            <p>Treatment history information not available.</p>
          </div>
        </div>
      </div>

      <Dialog open={showInitialAssessment} onOpenChange={setShowInitialAssessment}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Initial Assessment</DialogTitle>
          </DialogHeader>
          <InitialAssessmentForm
            patientId={patientData.patientId}
            clinicId={patientData.clinicId}
            careManagerId={careManager?.id || 0}
            onClose={() => setShowInitialAssessment(false)}
            onSuccess={handleInitialAssessmentSuccess}
            patientName={`${patientData.firstName} ${patientData.lastName}`}
            mrn={patientData.mrn}
            clinicName={patientData.clinicName}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}