// 'use client';

// import React, { useState, useContext } from 'react';
// import { UserContext } from '@/context/UserContext';
// import { useRouter } from 'next/navigation';
// import { useForm, Controller } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from 'date-fns';

// const PHQ9Questions = [
//   "Little interest or pleasure in doing things",
//   "Feeling down, depressed, or hopeless",
//   "Trouble falling or staying asleep, or sleeping too much",
//   "Feeling tired or having little energy",
//   "Poor appetite or overeating",
//   "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
//   "Trouble concentrating on things, such as reading the newspaper or watching television",
//   "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
//   "Thoughts that you would be better off dead, or of hurting yourself in some way"
// ];

// const GAD7Questions = [
//   "Feeling nervous, anxious or on edge",
//   "Not being able to stop or control worrying",
//   "Worrying too much about different things",
//   "Trouble relaxing",
//   "Being so restless that it is hard to sit still",
//   "Becoming easily annoyed or irritable",
//   "Feeling afraid as if something awful might happen"
// ];

// // Validation schema
// const schema = yup.object().shape({
//     contactDate: yup.date().required('Contact date is required'),
//     phq9Answers: yup.array().of(yup.number().required()).length(9),
//     gad7Answers: yup.array().of(yup.number().required()).length(7),
//     discussWithConsultant: yup.boolean(),
//     consultantNotes: yup.string(),
//     sessionType: yup.string().required('Session type is required'),
//     sessionDuration: yup.number().positive().integer().required('Session duration is required'),
// });

// interface InitialAssessmentFormProps {
//     patientId: number;
//     clinicId: number;
//     onClose: () => void;
//     patientName: string;
//     mrn: string;
//     clinicName: string;
// }

// export default function InitialAssessmentForm({ patientId, clinicId, patientName, mrn, clinicName, onClose }: InitialAssessmentFormProps) {
//     const router = useRouter();
//     const user = useContext(UserContext);
//     const [phq9Score, setPHQ9Score] = useState(0);
//     const [gad7Score, setGAD7Score] = useState(0);
//     const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

//     const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
//         resolver: yupResolver(schema),
//         defaultValues: {
//             contactDate: new Date(),
//             phq9Answers: new Array(9).fill(0),
//             gad7Answers: new Array(7).fill(0),
//             discussWithConsultant: false,
//             consultantNotes: '',
//             sessionType: '',
//             sessionDuration: 0
//         }
//     });

//     const discussWithConsultant = watch('discussWithConsultant');

//     const calculateScore = (answers: number[]) => answers.reduce((sum, score) => sum + score, 0);

//     // Submission handler
//     const onSubmit = async (data: any) => {
//         // Ensure the user exists before trying to access the user.id
//         if (!user || !user.id) {
//             setFormMessage({ type: "error", text: "User information is missing. Please log in again." });
//             return;
//         }

//         const phq9Score = calculateScore(data.phq9Answers);
//         const gad7Score = calculateScore(data.gad7Answers);

//         const formattedData = {
//             patientId,
//             clinicId,
//             createdBy: user.id,  // Pass user.id as the person submitting the form
//             contactDate: format(data.contactDate, 'yyyy-MM-dd'),
//             phq9Score,
//             gad7Score,
//             phq9Answers: data.phq9Answers,
//             gad7Answers: data.gad7Answers,
//             discussWithConsultant: data.discussWithConsultant,
//             consultantNotes: data.consultantNotes,
//             sessionType: data.sessionType,
//             sessionDuration: data.sessionDuration
//         };

//         try {
//             const response = await fetch('http://localhost:4353/api/initial-assessment', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(formattedData)
//             });

//             if (response.ok) {
//                 setFormMessage({ type: 'success', text: 'Initial assessment submitted successfully.' });
//                 setTimeout(() => {
//                     router.push(`/patients/${patientId}`);
//                 }, 2000);
//             } else {
//                 setFormMessage({ type: 'error', text: 'Failed to submit the assessment. Please try again.' });
//             }
//         } catch (error) {
//             console.error('Error submitting assessment:', error);
//             setFormMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
//         }
//     };

//     // Ensure that the user object exists before rendering the form
//     if (!user || !user.id) {
//         return <div className="min-h-screen flex items-center justify-center">User information is missing. Please log in again.</div>;
//     }

//     // Render questions for PHQ-9 and GAD-7
//     const renderQuestions = (questions: string[], name: string) => {
//         return questions.map((question, index) => (
//             <tr key={index} className="border-b border-gray-200">
//                 <td className="py-2 pr-4">{question}</td>
//                 <td className="py-2">
//                     <Controller
//                         name={`${name}[${index}]`}
//                         control={control}
//                         render={({ field }) => (
//                             <div className="flex justify-between">
//                                 {[0, 1, 2, 3].map((value) => (
//                                     <div key={value} className="flex items-center">
//                                         <input
//                                             type="radio"
//                                             id={`${name}-${index}-${value}`}
//                                             {...field}
//                                             value={value}
//                                             checked={field.value === value}
//                                             onChange={() => {
//                                                 field.onChange(value);
//                                                 const newAnswers = [...watch(name)];
//                                                 newAnswers[index] = value;
//                                                 setValue(name, newAnswers);
//                                                 if (name === 'phq9Answers') {
//                                                     setPHQ9Score(calculateScore(newAnswers));
//                                                 } else {
//                                                     setGAD7Score(calculateScore(newAnswers));
//                                                 }
//                                             }}
//                                             className="mr-2"
//                                         />
//                                         <Label htmlFor={`${name}-${index}-${value}`} className="text-sm">
//                                             {value}
//                                         </Label>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     />
//                 </td>
//             </tr>
//         ));
//     };

//     return (
//         <div className="w-full bg-[#f0f4f8] min-h-screen">
//             <Card className="w-full bg-white shadow-lg">
//                 <CardContent className="p-6">
//                     <h1 className="text-3xl font-bold mb-6 text-primary">Initial Assessment</h1>
//                     <div className="flex flex-wrap gap-4 text-lg">
//                         <p> <strong>Patient:</strong> {patientName} </p>
//                         <p> <strong>MRN:</strong> {mrn} </p>
//                         <p> <strong>Clinic:</strong> {clinicName} </p>
//                         <p> <strong>Patient ID:</strong> {patientId} </p>
//                     </div>

//                     {formMessage && (
//                         <div className={`mb-4 p-4 rounded ${formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                             {formMessage.text}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit(onSubmit)}>
//                         <div className="mb-8 bg-gray-50 p-4 rounded-lg">
//                             <Label htmlFor="contactDate" className="block mb-2 text-lg font-medium">Date of Contact:</Label>
//                             <Controller
//                                 name="contactDate"
//                                 control={control}
//                                 render={({ field }) => (
//                                     <DatePicker
//                                         selected={field.value}
//                                         onChange={(date: Date) => field.onChange(date)}
//                                         className="w-full p-2 border rounded-md"
//                                     />
//                                 )}
//                             />
//                             {errors.contactDate && <p className="text-red-500 mt-1">{errors.contactDate.message}</p>}
//                         </div>

//                         <div className="mb-8">
//                             <h2 className="text-2xl font-semibold mb-4 text-primary">Depression Scale: PHQ-9 (Score: {phq9Score})</h2>
//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead>
//                                         <tr className="bg-gray-100">
//                                             <th className="py-3 px-4 text-left">Over the last 2 weeks, how often have you been bothered by any of the following problems?</th>
//                                             <th className="py-3 px-4 text-center">
//                                                 <div className="flex justify-between">
//                                                     <span className="px-2">Not at all</span>
//                                                     <span className="px-2">Several days</span>
//                                                     <span className="px-2">More than half the days</span>
//                                                     <span className="px-2">Nearly every day</span>
//                                                 </div>
//                                             </th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {renderQuestions(PHQ9Questions, 'phq9Answers')}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                         <div className="mb-8">
//                             <h2 className="text-2xl font-semibold mb-4 text-primary">Anxiety Scale: GAD-7 (Score: {gad7Score})</h2>
//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead>
//                                         <tr className="bg-gray-100">
//                                             <th className="py-3 px-4 text-left">Over the last 2 weeks, how often have you been bothered by the following problems?</th>
//                                             <th className="py-3 px-4 text-center">
//                                                 <div className="flex justify-between">
//                                                     <span className="px-2">Not at all</span>
//                                                     <span className="px-2">Several days</span>
//                                                     <span className="px-2">More than half the days</span>
//                                                     <span className="px-2">Nearly every day</span>
//                                                 </div>
//                                             </th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {renderQuestions(GAD7Questions, 'gad7Answers')}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                         <div className="mb-8 bg-gray-50 p-4 rounded-lg">
//                             <h2 className="text-2xl font-semibold mb-4 text-primary">Discuss with Psychiatric Consultant</h2>
//                             <div className="flex items-center space-x-2 mb-4">
//                                 <Controller
//                                     name="discussWithConsultant"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <Checkbox
//                                             id="discussWithConsultant"
//                                             checked={field.value}
//                                             onCheckedChange={(checked) => field.onChange(checked)}
//                                         />
//                                     )}
//                                 />
//                                 <Label htmlFor="discussWithConsultant" className="text-lg">Would you like to discuss this patient with the psychiatric consultant?</Label>
//                             </div>

//                             {/* Conditionally render the notes input based on discussWithConsultant */}
//                             {watch('discussWithConsultant') && (
//                                 <div>
//                                     <Label htmlFor="consultantNotes" className="block mb-2 text-lg">Notes for Psychiatric Consultant:</Label>
//                                     <Controller
//                                         name="consultantNotes"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <Input
//                                                 id="consultantNotes"
//                                                 {...field}
//                                                 className="w-full p-2"
//                                             />
//                                         )}
//                                     />
//                                     {errors.consultantNotes && <p className="text-red-500 mt-1">{errors.consultantNotes.message}</p>}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="mb-8 bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
//                             <div className="flex-1">
//                                 <Label htmlFor="sessionType" className="block mb-2 text-lg">This session was</Label>
//                                 <Controller
//                                 name="sessionType"
//                                 control={control}
//                                 render={({ field }) => (
//                                     <Select onValueChange={(value) => field.onChange(value)}>
//                                         <SelectTrigger className="w-full">
//                                             <SelectValue placeholder="Select session type" />
//                                         </SelectTrigger>
//                                         <SelectContent className="bg-white"> {/* Add the background color here */}
//                                             <SelectItem value="in_clinic">In Clinic</SelectItem>
//                                             <SelectItem value="by_phone">By Phone</SelectItem>
//                                             <SelectItem value="by_video">By Video</SelectItem>
//                                             <SelectItem value="in_group">In Group</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                     )}
//                                 />
//                             </div>

//                             <div className="flex-1">
//                                 <Label htmlFor="sessionDuration" className="block mb-2 text-lg">and took</Label>
//                                 <div className="flex items-center">
//                                     <Input
//                                         id="sessionDuration"
//                                         type="number"
//                                         {...register('sessionDuration', { valueAsNumber: true })}
//                                         className="w-20 inline-block"
//                                     />
//                                     <span className="ml-2 text-lg">minutes</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex justify-end space-x-4">
//                             <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2">Cancel</Button>
//                             <Button type="submit" className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600">Submit</Button>
//                         </div>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }


'use client'

import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

type RootState = {
  clinic: {
    selectedClinic: { id: number; name: string } | null;
  };
};

interface InitialAssessmentFormProps {
  patientId: number;
  clinicId?: number;
  careManagerId: number;
  onClose: () => void;
  onSuccess: () => void;
  patientName: string;
  mrn: string;
  clinicName?: string;
}

const schema = yup.object().shape({
    contactDate: yup.date().required('Contact date is required'),
    phq9Answers: yup.array().of(yup.number().min(0).max(3)).length(9),
    gad7Answers: yup.array().of(yup.number().min(0).max(3)).length(7),
    discussWithConsultant: yup.boolean(),
    sessionType: yup.string().required('Session type is required'),
    sessionDuration: yup.number().positive().integer().required('Session duration is required'),
  });

const PHQ9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way"
];

const GAD7Questions = [
  "Feeling nervous, anxious or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

export default function InitialAssessmentForm({
  patientId,
  clinicId,
  careManagerId,
  onClose,
  onSuccess,
  patientName,
  mrn,
  clinicName
}: InitialAssessmentFormProps) {
  console.log('InitialAssessmentForm props:', { patientId, clinicId, careManagerId, patientName, mrn, clinicName });

  const router = useRouter();
  const user = useContext(UserContext);
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  
  console.log('Selected Clinic from Redux:', selectedClinic);

  const effectiveClinicId = clinicId || selectedClinic?.id;
  const effectiveClinicName = clinicName || selectedClinic?.name;

  console.log('Effective Clinic ID:', effectiveClinicId);
  console.log('Effective Clinic Name:', effectiveClinicName);

  const [phq9Score, setPHQ9Score] = useState(0);
  const [gad7Score, setGAD7Score] = useState(0);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [psychiatricConsultants, setPsychiatricConsultants] = useState<Array<{ id: number, name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contactDate: new Date(),
      phq9Answers: new Array(9).fill(0),
      gad7Answers: new Array(7).fill(0),
      discussWithConsultant: false,
      psychiatricConsultantId: '',
      consultantNotes: '',
      sessionType: '',
      sessionDuration: 0
    }
  });

  const discussWithConsultant = watch('discussWithConsultant');

  useEffect(() => {
    if (!effectiveClinicId) {
      console.error('No valid clinic ID available');
      setError('No valid clinic ID available');
      setLoading(false);
      return;
    }

    const fetchPsychiatricConsultants = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching consultants for clinic ID: ${effectiveClinicId}`);
        const response = await fetch(`http://localhost:4353/api/patients/consultants?clinicId=${effectiveClinicId}`);
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const consultants = await response.json();
        console.log("Fetched consultants:", consultants);
        setPsychiatricConsultants(Array.isArray(consultants) ? consultants : []);
      } catch (error) {
        console.error('Error fetching consultants:', error);
        setError(`Failed to fetch consultant data: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychiatricConsultants();
  }, [effectiveClinicId]);

  const calculateScore = (answers: number[]) => answers.reduce((sum, score) => sum + score, 0);

  const onSubmit = async (data: any) => {
    if (!user || !user.id) {
      setFormMessage({ type: "error", text: "User information is missing. Please log in again." });
      return;
    }

    const phq9Score = calculateScore(data.phq9Answers);
    const gad7Score = calculateScore(data.gad7Answers);

    const formattedData = {
      patientId,
      clinicId: effectiveClinicId,
      createdBy: user.id,
      contactDate: format(data.contactDate, 'yyyy-MM-dd'),
      phq9Score,
      gad7Score,
      phq9Answers: data.phq9Answers,
      gad7Answers: data.gad7Answers,
      discussWithConsultant: data.discussWithConsultant,
      psychiatricConsultantId: data.discussWithConsultant ? data.psychiatricConsultantId : null,
      consultantNotes: data.consultantNotes,
      sessionType: data.sessionType,
      sessionDuration: data.sessionDuration
    };

    try {
      const response = await fetch('http://localhost:4353/api/initial-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      if (response.ok) {
        setFormMessage({ type: 'success', text: 'Initial assessment submitted successfully.' });
        setTimeout(() => {
          onSuccess();
          router.push(`/patients/${patientId}`);
        }, 2000);
      } else {
        setFormMessage({ type: 'error', text: 'Failed to submit the assessment. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setFormMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    }
  };

  const renderQuestions = (questions: string[], name: string) => {
    return questions.map((question, index) => (
      <tr key={index} className="border-b border-gray-200">
        <td className="py-2 pr-4">{question}</td>
        <td className="py-2">
          <Controller
            name={`${name}[${index}]`}
            control={control}
            render={({ field }) => (
              <div className="flex justify-between">
                {[0, 1, 2, 3].map((value) => (
                  <div key={value} className="flex items-center">
                    <input
                      type="radio"
                      id={`${name}-${index}-${value}`}
                      {...field}
                      value={value}
                      checked={field.value === value}
                      onChange={() => {
                        field.onChange(value);
                        const newAnswers = [...watch(name)];
                        newAnswers[index] = value;
                        setValue(name, newAnswers);
                        if (name === 'phq9Answers') {
                          setPHQ9Score(calculateScore(newAnswers));
                        } else {
                          setGAD7Score(calculateScore(newAnswers));
                        }
                      }}
                      className="mr-2"
                    />
                    <Label htmlFor={`${name}-${index}-${value}`} className="text-sm">
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />
        </td>
      </tr>
    ));
  };

  if (!effectiveClinicId) {
    return <div>Error: No clinic selected. Please select a clinic before accessing this form.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="w-full bg-white shadow-lg">
      <CardContent className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-primary">Initial Assessment</h1>
        <div className="flex flex-wrap gap-4 text-lg">
          <p><strong>Patient:</strong> {patientName}</p>
          <p><strong>MRN:</strong> {mrn}</p>
          <p><strong>Clinic:</strong> {effectiveClinicName}</p>
          <p><strong>Patient ID:</strong> {patientId}</p>
          <p><strong>Clinic ID:</strong> {effectiveClinicId}</p>
        </div>

        {formMessage && (
          <div className={`mb-4 p-4 rounded ${formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <Label htmlFor="contactDate" className="block mb-2 text-lg font-medium">Date of Contact:</Label>
            <Controller
              name="contactDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date: Date) => field.onChange(date)}
                  className="w-full p-2 border rounded-md"
                />
              )}
            />
            {errors.contactDate && <p className="text-red-500 mt-1">{errors.contactDate.message}</p>}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Depression Scale: PHQ-9 (Score: {phq9Score})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Over the last 2 weeks, how often have you been bothered by any of the following problems?</th>
                    <th className="py-3 px-4 text-center">
                      <div className="flex justify-between">
                        <span className="px-2">Not at all</span>
                        <span className="px-2">Several days</span>
                        <span className="px-2">More than half the days</span>
                        <span className="px-2">Nearly every day</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderQuestions(PHQ9Questions, 'phq9Answers')}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Anxiety Scale: GAD-7 (Score: {gad7Score})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Over the last 2 weeks, how often have you been bothered by the following problems?</th>
                    <th className="py-3 px-4 text-center">
                      <div className="flex justify-between">
                        <span className="px-2">Not at all</span>
                        <span className="px-2">Several days</span>
                        <span className="px-2">More than half the days</span>
                        <span className="px-2">Nearly every day</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderQuestions(GAD7Questions, 'gad7Answers')}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Discuss with Psychiatric Consultant</h2>
            <div className="flex items-center space-x-2 mb-4">
              <Controller
                name="discussWithConsultant"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="discussWithConsultant"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                )}
              />
              <Label htmlFor="discussWithConsultant" className="text-lg">Would you like to discuss this patient with the psychiatric consultant?</Label>
            </div>

            {discussWithConsultant && (
              <div>
                <Label htmlFor="psychiatricConsultantId" className="block mb-2 text-lg">Select Psychiatric Consultant:</Label>
                <Controller
                  name="psychiatricConsultantId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select consultant" />
                      </SelectTrigger>
                      <SelectContent className='bg-white'>
                        {psychiatricConsultants.length > 0 ? (
                          psychiatricConsultants.map((consultant) => (
                            <SelectItem key={consultant.id} value={consultant.id.toString()}>
                              {consultant.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-consultants">No consultants available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.psychiatricConsultantId && <p className="text-red-500 mt-1">{errors.psychiatricConsultantId.message}</p>}
                
                <Label htmlFor="consultantNotes" className="block mb-2 text-lg">Notes for Psychiatric Consultant:</Label>
                <Controller
                  name="consultantNotes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="consultantNotes"
                      {...field}
                      className="w-full p-2"
                    />
                  )}
                />
                {errors.consultantNotes && <p className="text-red-500 mt-1">{errors.consultantNotes.message}</p>}
              </div>
            )}
          </div>

          <div className="mb-8 bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="sessionType" className="block mb-2 text-lg">This session was</Label>
              <Controller
                name="sessionType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="in_clinic">In Clinic</SelectItem>
                      <SelectItem value="by_phone">By Phone</SelectItem>
                      <SelectItem value="by_video">By Video</SelectItem>
                      <SelectItem value="in_group">In Group</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex-1">
              <Label htmlFor="sessionDuration" className="block mb-2 text-lg">and took</Label>
              <div className="flex items-center">
                <Input
                  id="sessionDuration"
                  type="number"
                  {...register('sessionDuration', { valueAsNumber: true })}
                  className="w-20 inline-block"
                />
                <span className="ml-2 text-lg">minutes</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2">Cancel</Button>
            <Button type="submit" className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}