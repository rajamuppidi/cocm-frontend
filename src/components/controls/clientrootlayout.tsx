// components/controls/clientrootlayout.tsx
'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/controls/AuthenticatedLayout';
import { jwtDecode } from 'jwt-decode';
import dynamic from 'next/dynamic';
import ActivePatientsPage from '@/app/active-patients/page';
import { useDispatch, useSelector } from 'react-redux';
import { setClinic, initializeClinic } from '@/lib/clinicSlice';
import { RootState, AppDispatch } from '@/lib/store';

interface ClientRootLayoutProps {
  children: ReactNode;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clinics: Array<{ id: number; name: string }>;
}

const Clinics = dynamic(() => import('@/components/Clinics'));
const Users = dynamic(() => import('@/components/Users'));
const Dashboard = dynamic(() => import('@/components/dashboard'));

const ClientRootLayout = ({ children }: ClientRootLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const isAuthenticatedRoute = pathname !== '/';
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('clinics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(initializeClinic());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);

      fetch(`http://localhost:4353/api/users/${decoded.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setUser(data);
          setLoading(false);
          if (data.role === 'Admin' && pathname !== '/admin') {
            router.push('/admin');
          } else if (data.role !== 'Admin' && pathname !== '/dashboard' && pathname !== '/active-patients' ) {
            router.push('/dashboard');
          }
          if (data.clinics && data.clinics.length > 0 && !selectedClinic) {
            const storedClinic = localStorage.getItem('selectedClinic');
            if (storedClinic) {
              dispatch(setClinic(JSON.parse(storedClinic)));
            } else {
              dispatch(setClinic(data.clinics[0]));
            }
          }
        })
        .catch(error => {
          console.error('Error fetching user:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [pathname, dispatch, selectedClinic, router]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      const tab = searchParams.get('tab') || 'clinics';
      setActiveTab(tab);
    }
  }, [searchParams, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const renderContent = () => {
    if (user?.role === 'Admin') {
      switch (activeTab) {
        case 'clinics':
          return <Clinics />;
        case 'users':
          return <Users />;
        default:
          return <div>Settings Content</div>;
      }
    } else {
      switch (pathname) {
        case '/active-patients':
          return <ActivePatientsPage />;
        default:
          return <Dashboard user={user} />;
      }
    }
  };

  return (
    <div>
      {isAuthenticatedRoute ? (
        <AuthenticatedLayout user={user}>
          {renderContent()}
        </AuthenticatedLayout>
      ) : (
        <div className="min-h-screen flex items-center justify-center">{children}</div>
      )}
    </div>
  );
};

export default ClientRootLayout;