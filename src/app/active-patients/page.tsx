'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import ActivePatientsComponent from '@/components/ActivePatientsComponent';

const ActivePatientsPage = () => {
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);

  return <ActivePatientsComponent selectedClinic={selectedClinic} />;
};

export default ActivePatientsPage;