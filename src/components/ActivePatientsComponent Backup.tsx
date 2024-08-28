import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  enrollmentDate: string;
  careManager: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Patient;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'mrn', numeric: false, label: 'MRN' },
  { id: 'firstName', numeric: false, label: 'First Name' },
  { id: 'lastName', numeric: false, label: 'Last Name' },
  { id: 'dob', numeric: false, label: 'Date of Birth' },
  { id: 'enrollmentDate', numeric: false, label: 'Enrollment Date' },
  { id: 'careManager', numeric: false, label: 'Care Manager' },
];

function EnhancedTableHead(props: {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Patient) => void;
  order: Order;
  orderBy: string;
}) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Patient) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ 
              backgroundColor: 'black', 
              color: 'white', 
              fontWeight: 'bold' 
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              sx={{
                '&.MuiTableSortLabel-root': {
                  color: 'white',
                },
                '&.MuiTableSortLabel-root:hover': {
                  color: 'white',
                },
                '&.Mui-active': {
                  color: 'white',
                },
                '& .MuiTableSortLabel-icon': {
                  color: 'white !important',
                },
              }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell 
          align="center" 
          sx={{ 
            backgroundColor: 'black', 
            color: 'white', 
            fontWeight: 'bold' 
          }}
        >
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

const ActivePatientsComponent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Patient>('lastName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    if (selectedClinic) {
      const fetchPatients = async () => {
        try {
          const response = await fetch(`http://localhost:4353/api/patients/active?clinicId=${selectedClinic.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch patients');
          }
          const data = await response.json();
          setPatients(data);
          setLoading(false);
        } catch (err) {
          setError('Error fetching patients');
          setLoading(false);
        }
      };

      fetchPatients();
    }
  }, [selectedClinic]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Patient) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (patientId: number) => {
    console.log(`View patient ${patientId}`);
  };

  const handleEdit = (patientId: number) => {
    console.log(`Edit patient ${patientId}`);
  };

  const handleDelete = (patientId: number) => {
    console.log(`Delete patient ${patientId}`);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPatients = filteredPatients.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const paginatedPatients = sortedPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Active Patients
        </Typography>
        {selectedClinic && (
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            Clinic: {selectedClinic.name}
          </Typography>
        )}
        <TextField
          label="Search by name or MRN"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3, backgroundColor: 'background.paper' }}
        />
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {paginatedPatients.map((patient) => (
                    <TableRow hover key={patient.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {!isMobile && (
                        <>
                          <TableCell>{patient.mrn}</TableCell>
                          <TableCell>{patient.firstName}</TableCell>
                          <TableCell>{patient.lastName}</TableCell>
                          <TableCell>{patient.dob}</TableCell>
                          <TableCell>{patient.enrollmentDate}</TableCell>
                          <TableCell>{patient.careManager}</TableCell>
                        </>
                      )}
                      {isMobile && (
                        <TableCell>
                          <Typography variant="subtitle2">{`${patient.firstName} ${patient.lastName}`}</Typography>
                          <Typography variant="body2" color="text.secondary">{`MRN: ${patient.mrn}`}</Typography>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton size="small" color="primary" onClick={() => handleView(patient.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="secondary" onClick={() => handleEdit(patient.id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(patient.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredPatients.length)} of {filteredPatients.length} records
              </Typography>
              <TablePagination
                rowsPerPageOptions={[50, 100, 150, 200, { label: 'All', value: -1 }]}
                component="div"
                count={filteredPatients.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ActivePatientsComponent;