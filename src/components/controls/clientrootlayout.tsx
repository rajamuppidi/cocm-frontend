
'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/controls/AuthenticatedLayout';
import { jwtDecode } from 'jwt-decode';
import dynamic from 'next/dynamic';

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
const Dashboard = dynamic(() => import('@/components/dashboard')); // Correct dynamic import

const ClientRootLayout = ({ children }: ClientRootLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticatedRoute = pathname !== '/';
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('clinics');
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(null);

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
          } else if (data.role !== 'Admin' && pathname !== '/dashboard') {
            router.push('/dashboard');
          }
          setSelectedClinic(data.clinics[0]); // Set the first clinic as default
        })
        .catch(error => {
          console.error('Error fetching user:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      const tab = searchParams.get('tab') || 'clinics';
      setActiveTab(tab);
    }
  }, [searchParams, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div>
      {isAuthenticatedRoute ? (
        <AuthenticatedLayout user={user}>
          {user?.role === 'Admin' ? (
            activeTab === 'clinics' ? (
              <Clinics />
            ) : activeTab === 'users' ? (
              <Users />
            ) : (
              <div>Settings Content</div>
            )
          ) : (
            <Dashboard user={user} selectedClinic={selectedClinic} />
          )}
        </AuthenticatedLayout>
      ) : (
        <div className="min-h-screen flex items-center justify-center">{children}</div>
      )}
    </div>
  );
};

export default ClientRootLayout;
