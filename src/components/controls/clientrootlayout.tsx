// // components/controls/clientrootlayout.tsx
// 'use client';

// import React, { ReactNode, useEffect, useState } from 'react';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import AuthenticatedLayout from '@/components/controls/AuthenticatedLayout';
// import { jwtDecode } from 'jwt-decode';
// import dynamic from 'next/dynamic';
// import ActivePatientsPage from '@/app/active-patients/page';
// import { useDispatch, useSelector } from 'react-redux';
// import { setClinic, initializeClinic } from '@/lib/clinicSlice';
// import { RootState, AppDispatch } from '@/lib/store';

// interface ClientRootLayoutProps {
//   children: ReactNode;
// }

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: string;
//   clinics: Array<{ id: number; name: string }>;
// }

// const Clinics = dynamic(() => import('@/components/Clinics'));
// const Users = dynamic(() => import('@/components/Users'));
// const Dashboard = dynamic(() => import('@/components/dashboard'));

// const ClientRootLayout = ({ children }: ClientRootLayoutProps) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const dispatch = useDispatch<AppDispatch>();
//   const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
//   const isAuthenticatedRoute = pathname !== '/';
//   const [user, setUser] = useState<User | null>(null);
//   const [activeTab, setActiveTab] = useState('clinics');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     dispatch(initializeClinic());
//   }, [dispatch]);

//   useEffect(() => {
//     console.log('Current pathname:', pathname);
//     const token = localStorage.getItem('token');
//     if (token) {
//       const decoded: any = jwtDecode(token);

//       fetch(`http://localhost:4353/api/users/${decoded.id}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       })
//         .then(response => {
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then(data => {
//           setUser(data);
//           setLoading(false);
//           if (data.role === 'Admin' && pathname !== '/admin') {
//             router.push('/admin');
//           } else if (data.role !== 'Admin' && pathname !== '/dashboard' && pathname !== '/active-patients' && !pathname.startsWith('/patients' )) {
//             router.push('/dashboard');
//           }
//           if (data.clinics && data.clinics.length > 0 && !selectedClinic) {
//             const storedClinic = localStorage.getItem('selectedClinic');
//             if (storedClinic) {
//               dispatch(setClinic(JSON.parse(storedClinic)));
//             } else {
//               dispatch(setClinic(data.clinics[0]));
//             }
//           }
//         })
//         .catch(error => {
//           console.error('Error fetching user:', error);
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, [pathname, dispatch, selectedClinic, router]);

//   useEffect(() => {
//     if (user?.role === 'Admin') {
//       const tab = searchParams.get('tab') || 'clinics';
//       setActiveTab(tab);
//     }
//   }, [searchParams, user]);

//   if (loading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }

//   const renderContent = () => {
//     console.log('RenderContent pathname:', pathname);
//     if (user?.role === 'Admin') {
//       switch (activeTab) {
//         case 'clinics':
//           return <Clinics />;
//         case 'users':
//           return <Users />;
//         default:
//           return <div>Settings Content</div>;
//       }
//     } else {
//       if (pathname === '/active-patients') {
//         return <ActivePatientsPage />;
//       } else if (pathname.startsWith('/patients')) {
//         return children; // Render the patient dashboard
//       } else {
//         return <Dashboard user={user} />;
//       }
//     }
//   };

//   return (
//     <div>
//       {isAuthenticatedRoute ? (
//         <AuthenticatedLayout user={user}>
//           {renderContent()}
//         </AuthenticatedLayout>
//       ) : (
//         <div className="min-h-screen flex items-center justify-center">{children}</div>
//       )}
//     </div>
//   );
// };


// export default ClientRootLayout;


// ClientRootLayout.tsx (Parent component)

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
import { UserContext } from '@/context/UserContext';


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
  const [user, setUser] = useState<User | null>(null);  // Initialize user state
  const [activeTab, setActiveTab] = useState('clinics');
  const [loading, setLoading] = useState(true);

  // Initialize clinic data
  useEffect(() => {
    dispatch(initializeClinic());
  }, [dispatch]);

  // Fetch user information
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        fetch(`http://localhost:4353/api/users/${decoded.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            setUser(data);  // Store the user data
            setLoading(false);  // Stop the loading spinner

            // Handle redirects based on user role
            if (data.role === 'Admin' && pathname !== '/admin') {
              router.push('/admin');
            } else if (
              data.role !== 'Admin' &&
              pathname !== '/dashboard' &&
              pathname !== '/active-patients' &&
              !pathname.startsWith('/patients')
            ) {
              router.push('/dashboard');
            }

            // Handle clinic selection
            if (data.clinics && data.clinics.length > 0 && !selectedClinic) {
              const storedClinic = localStorage.getItem('selectedClinic');
              if (storedClinic) {
                dispatch(setClinic(JSON.parse(storedClinic)));
              } else {
                dispatch(setClinic(data.clinics[0]));
              }
            }
          })
          .catch((error) => {
            console.error('Error fetching user:', error);
            setLoading(false);
          });
      } catch (error) {
        console.error('Error decoding token:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [pathname, dispatch, selectedClinic, router]);

  // Handle tab for admin users
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
      if (pathname === '/active-patients') {
        return <ActivePatientsPage />;
      } else if (pathname.startsWith('/patients')) {
        return children; // Render the patient dashboard
      } else {
        return <Dashboard user={user} />;
      }
    }
  };

  // Render Authenticated Layout with user passed in props, check if path requires authentication
  return (
    <UserContext.Provider value={user}>
      {pathname !== '/' ? (
        <AuthenticatedLayout>
          {renderContent()}
        </AuthenticatedLayout>
      ) : (
        <div className="min-h-screen flex items-center justify-center">{children}</div>
      )}
    </UserContext.Provider>
  );
};

export default ClientRootLayout;
