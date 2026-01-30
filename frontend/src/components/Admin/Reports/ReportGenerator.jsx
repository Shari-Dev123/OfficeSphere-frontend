// import React, { useState, useEffect } from 'react';
// import { adminAPI } from '../../../utils/api';
// import { 
//   FiFileText, 
//   FiDownload, 
//   FiCalendar, 
//   FiUsers,
//   FiActivity,
//   FiClock,
//   FiTrendingUp,
//   FiBarChart2,
//   FiFilter,
//   FiRefreshCw,
//   FiEye,
//   FiMail
// } from 'react-icons/fi';
// import { toast } from 'react-toastify';
// import {
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from 'recharts';
// import './ReportGenerator.css';

// function ReportGenerator() {
//   const [loading, setLoading] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [reportType, setReportType] = useState('performance');
//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });
//   const [filters, setFilters] = useState({
//     employeeId: '',
//     department: ''
//   });
//   const [generatedReport, setGeneratedReport] = useState(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [employees, setEmployees] = useState([]);
//   const [departments] = useState([
//     'Development',
//     'Design',
//     'Marketing',
//     'Sales',
//     'HR',
//     'Finance',
//     'Operations'
//   ]);

//   const reportTypes = [
//     {
//       id: 'performance',
//       name: 'Performance Report',
//       description: 'Employee performance and productivity metrics',
//       icon: <FiTrendingUp />,
//       color: 'primary'
//     },
//     {
//       id: 'attendance',
//       name: 'Attendance Report',
//       description: 'Employee attendance and punctuality statistics',
//       icon: <FiClock />,
//       color: 'success'
//     },
//     {
//       id: 'productivity',
//       name: 'Productivity Report',
//       description: 'Task completion and project progress',
//       icon: <FiActivity />,
//       color: 'warning'
//     },
//     {
//       id: 'employee',
//       name: 'Employee Report',
//       description: 'Comprehensive employee data and insights',
//       icon: <FiUsers />,
//       color: 'info'
//     }
//   ];

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

//   useEffect(() => {
//     loadEmployees();
//   }, []);

//   const loadEmployees = async () => {
//     try {
//       const response = await adminAPI.getEmployees();
//       if (response.data?.data) {
//         setEmployees(response.data.data);
//       } else if (Array.isArray(response.data)) {
//         setEmployees(response.data);
//       }
//     } catch (error) {
//       console.error('Error loading employees:', error);
//     }
//   };

//   const handleGenerateReport = async () => {
//     if (!dateRange.startDate || !dateRange.endDate) {
//       toast.error('Please select both start and end dates');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       const params = {
//         startDate: dateRange.startDate,
//         endDate: dateRange.endDate,
//         ...(filters.employeeId && { employeeId: filters.employeeId }),
//         ...(filters.department && { department: filters.department })
//       };

//       let response;

//       switch(reportType) {
//         case 'performance':
//           response = await adminAPI.getPerformanceReport(params);
//           break;
//         case 'attendance':
//           response = await adminAPI.getAttendanceReport(params);
//           break;
//         case 'productivity':
//           response = await adminAPI.getProductivityReport(params);
//           break;
//         case 'employee':
//           response = await adminAPI.getEmployeeReport(params);
//           break;
//         default:
//           response = await adminAPI.generateReport({
//             reportType,
//             ...params,
//             filters
//           });
//       }

//       // Extract data from response
//       const reportData = response.data || response;
      
//       if (!reportData) {
//         toast.error('No data returned from server');
//         return;
//       }

//       setGeneratedReport(reportData);
//       toast.success('Report generated successfully!');
//     } catch (error) {
//       console.error('Error generating report:', error);
//       toast.error(error.response?.data?.message || error.message || 'Failed to generate report');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = async (format) => {
//     if (!generatedReport) {
//       toast.error('No report to download');
//       return;
//     }

//     try {
//       setExporting(true);
      
//       const params = {
//         format: format,
//         startDate: dateRange.startDate,
//         endDate: dateRange.endDate,
//         ...(filters.employeeId && { employeeId: filters.employeeId }),
//         ...(filters.department && { department: filters.department })
//       };

//       const response = await adminAPI.exportReport(reportType, params);
      
//       const blob = new Blob([response.data], { 
//         type: format === 'pdf' ? 'application/pdf' : 
//               format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
//               'text/csv'
//       });
      
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `${reportType}-report-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
      
//       toast.success('Report downloaded successfully!');
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       toast.error(error.response?.data?.message || 'Failed to download report');
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handleEmailReport = () => {
//     toast.info('Email feature coming soon!');
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const resetFilters = () => {
//     setFilters({
//       employeeId: '',
//       department: ''
//     });
//   };

//   const selectedReport = reportTypes.find(r => r.id === reportType);

//   // Safe data extraction with null checks
//   const getReportData = () => {
//     if (!generatedReport) return [];
    
//     if (reportType === 'performance') {
//       return Array.isArray(generatedReport.data) ? generatedReport.data : [];
//     } else if (reportType === 'attendance') {
//       return Array.isArray(generatedReport.employeeBreakdown) ? generatedReport.employeeBreakdown : [];
//     } else if (reportType === 'productivity') {
//       return Array.isArray(generatedReport.projectBreakdown) ? generatedReport.projectBreakdown : [];
//     } else if (reportType === 'employee') {
//       return Array.isArray(generatedReport.data) ? generatedReport.data : [];
//     }
    
//     return [];
//   };

//   const getChartData = () => {
//     const data = getReportData();
//     if (!data || data.length === 0) return null;

//     if (reportType === 'performance') {
//       return data.slice(0, 10).map(emp => ({
//         name: emp.employeeName?.split(' ')[0] || 'Unknown',
//         score: parseFloat(emp.performanceScore) || 0,
//         tasks: emp.metrics?.completedTasks || 0
//       }));
//     } else if (reportType === 'attendance') {
//       return data.slice(0, 10).map(emp => ({
//         name: emp.employeeName?.split(' ')[0] || 'Unknown',
//         present: emp.presentDays || 0,
//         absent: emp.absentDays || 0,
//         late: emp.lateDays || 0
//       }));
//     } else if (reportType === 'productivity') {
//       return data.slice(0, 10).map(proj => ({
//         name: proj.projectName?.substring(0, 15) || 'Unknown',
//         completed: proj.completedTasks || 0,
//         total: proj.totalTasks || 0
//       }));
//     }

//     return null;
//   };

//   const getPieChartData = () => {
//     if (!generatedReport?.summary) return null;

//     if (reportType === 'performance') {
//       return [
//         { name: 'Excellent (90+)', value: generatedReport.summary.excellentCount || 0 },
//         { name: 'Good (75-89)', value: generatedReport.summary.goodCount || 0 },
//         { name: 'Average (60-74)', value: generatedReport.summary.averageCount || 0 },
//         { name: 'Poor (<60)', value: generatedReport.summary.poorCount || 0 }
//       ].filter(item => item.value > 0);
//     } else if (reportType === 'attendance') {
//       return [
//         { name: 'Present', value: generatedReport.summary.presentCount || 0 },
//         { name: 'Absent', value: generatedReport.summary.absentCount || 0 },
//         { name: 'Late', value: generatedReport.summary.lateCount || 0 },
//         { name: 'Leave', value: generatedReport.summary.leaveCount || 0 }
//       ].filter(item => item.value > 0);
//     } else if (reportType === 'productivity') {
//       return [
//         { name: 'Completed', value: generatedReport.summary.completedTasks || 0 },
//         { name: 'In Progress', value: generatedReport.summary.inProgressTasks || 0 },
//         { name: 'Pending', value: generatedReport.summary.pendingTasks || 0 },
//         { name: 'Overdue', value: generatedReport.summary.overdueTasks || 0 }
//       ].filter(item => item.value > 0);
//     }

//     return null;
//   };

//   const reportData = getReportData();
//   const chartData = getChartData();
//   const pieData = getPieChartData();

//   return (
//     <div className="report-generator">
//       <div className="page-header">
//         <div>
//           <h1><FiBarChart2 /> Report Generator</h1>
//           <p>Generate comprehensive reports with advanced analytics</p>
//         </div>
//         <div className="header-actions">
//           <button 
//             className="btn btn-outline"
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             <FiFilter /> {showFilters ? 'Hide' : 'Show'} Filters
//           </button>
//         </div>
//       </div>

//       <div className="report-container">
//         {/* Report Type Selection */}
//         <div className="report-section">
//           <h3 className="section-title">
//             <FiFileText /> Select Report Type
//           </h3>
//           <div className="report-types-grid">
//             {reportTypes.map((type) => (
//               <div
//                 key={type.id}
//                 className={`report-type-card ${reportType === type.id ? 'active' : ''} ${type.color}`}
//                 onClick={() => setReportType(type.id)}
//               >
//                 <div className={`report-icon ${type.color}`}>
//                   {type.icon}
//                 </div>
//                 <h4>{type.name}</h4>
//                 <p>{type.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Date Range Selection */}
//         <div className="report-section">
//           <h3 className="section-title">
//             <FiCalendar /> Select Date Range
//           </h3>
//           <div className="date-range-container">
//             <div className="date-input-group">
//               <label>Start Date</label>
//               <input
//                 type="date"
//                 value={dateRange.startDate}
//                 onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
//                 max={dateRange.endDate}
//               />
//             </div>
//             <div className="date-separator">to</div>
//             <div className="date-input-group">
//               <label>End Date</label>
//               <input
//                 type="date"
//                 value={dateRange.endDate}
//                 onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
//                 min={dateRange.startDate}
//                 max={new Date().toISOString().split('T')[0]}
//               />
//             </div>
//           </div>

//           <div className="quick-ranges">
//             <button className="quick-range-btn" onClick={() => {
//               const endDate = new Date();
//               const startDate = new Date(endDate);
//               startDate.setDate(startDate.getDate() - 7);
//               setDateRange({
//                 startDate: startDate.toISOString().split('T')[0],
//                 endDate: endDate.toISOString().split('T')[0]
//               });
//             }}>Last 7 Days</button>
//             <button className="quick-range-btn" onClick={() => {
//               const endDate = new Date();
//               const startDate = new Date(endDate);
//               startDate.setDate(startDate.getDate() - 30);
//               setDateRange({
//                 startDate: startDate.toISOString().split('T')[0],
//                 endDate: endDate.toISOString().split('T')[0]
//               });
//             }}>Last 30 Days</button>
//             <button className="quick-range-btn" onClick={() => {
//               const endDate = new Date();
//               const startDate = new Date(endDate);
//               startDate.setMonth(startDate.getMonth() - 3);
//               setDateRange({
//                 startDate: startDate.toISOString().split('T')[0],
//                 endDate: endDate.toISOString().split('T')[0]
//               });
//             }}>Last 3 Months</button>
//             <button className="quick-range-btn" onClick={() => {
//               const endDate = new Date();
//               const startDate = new Date(endDate.getFullYear(), 0, 1);
//               setDateRange({
//                 startDate: startDate.toISOString().split('T')[0],
//                 endDate: endDate.toISOString().split('T')[0]
//               });
//             }}>This Year</button>
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         {showFilters && (
//           <div className="report-section filters-section">
//             <h3 className="section-title">
//               <FiFilter /> Advanced Filters
//             </h3>
//             <div className="filters-grid">
//               {(reportType === 'performance' || reportType === 'attendance' || reportType === 'employee') && (
//                 <div className="filter-group">
//                   <label>Employee</label>
//                   <select
//                     value={filters.employeeId}
//                     onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
//                   >
//                     <option value="">All Employees</option>
//                     {employees.map(emp => (
//                       <option key={emp._id} value={emp._id}>
//                         {emp.name || emp.user?.name || 'Unknown'}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {(reportType === 'performance' || reportType === 'attendance' || reportType === 'employee') && (
//                 <div className="filter-group">
//                   <label>Department</label>
//                   <select
//                     value={filters.department}
//                     onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
//                   >
//                     <option value="">All Departments</option>
//                     {departments.map(dept => (
//                       <option key={dept} value={dept}>{dept}</option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <div className="filter-actions">
//                 <button className="btn btn-outline btn-sm" onClick={resetFilters}>
//                   <FiRefreshCw /> Reset Filters
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Generate Button */}
//         <div className="generate-section">
//           <button
//             className="btn btn-primary btn-large"
//             onClick={handleGenerateReport}
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <div className="btn-spinner"></div>
//                 Generating Report...
//               </>
//             ) : (
//               <>
//                 <FiFileText />
//                 Generate {selectedReport?.name}
//               </>
//             )}
//           </button>
//         </div>

//         {/* Generated Report Preview */}
//         {generatedReport && (
//           <div className="report-section report-results">
//             <div className="report-results-header">
//               <h3 className="section-title">
//                 <FiEye /> Report Results
//               </h3>
//               <div className="download-buttons">
//                 <button className="btn btn-icon" onClick={() => handleDownload('pdf')} disabled={exporting}>
//                   <FiDownload /> PDF
//                 </button>
//                 <button className="btn btn-icon" onClick={() => handleDownload('excel')} disabled={exporting}>
//                   <FiDownload /> Excel
//                 </button>
//                 <button className="btn btn-icon" onClick={() => handleDownload('csv')} disabled={exporting}>
//                   <FiDownload /> CSV
//                 </button>
//                 <button className="btn btn-icon" onClick={handlePrint}>
//                   <FiFileText /> Print
//                 </button>
//                 <button className="btn btn-icon" onClick={handleEmailReport}>
//                   <FiMail /> Email
//                 </button>
//               </div>
//             </div>

//             <div className="report-preview">
//               <div className="preview-header">
//                 <div className="preview-info">
//                   <h4>{selectedReport?.name}</h4>
//                   <p className="report-period">
//                     <FiCalendar /> 
//                     {new Date(dateRange.startDate).toLocaleDateString()} - 
//                     {new Date(dateRange.endDate).toLocaleDateString()}
//                   </p>
//                   <p className="report-generated">
//                     Generated: {new Date().toLocaleString()}
//                   </p>
//                 </div>
//               </div>

//               {/* Summary Cards */}
//               {generatedReport.summary && (
//                 <div className="summary-cards">
//                   {reportType === 'performance' && (
//                     <>
//                       <div className="summary-card primary">
//                         <div className="card-icon"><FiUsers /></div>
//                         <div className="card-content">
//                           <h5>Total Employees</h5>
//                           <p className="card-value">{generatedReport.summary.totalEmployees || 0}</p>
//                         </div>
//                       </div>
//                       <div className="summary-card success">
//                         <div className="card-icon"><FiTrendingUp /></div>
//                         <div className="card-content">
//                           <h5>Avg Performance</h5>
//                           <p className="card-value">{generatedReport.summary.avgPerformanceScore || 0}%</p>
//                         </div>
//                       </div>
//                       <div className="summary-card warning">
//                         <div className="card-icon"><FiActivity /></div>
//                         <div className="card-content">
//                           <h5>Task Completion</h5>
//                           <p className="card-value">{generatedReport.summary.avgTaskCompletionRate || 0}%</p>
//                         </div>
//                       </div>
//                       <div className="summary-card info">
//                         <div className="card-icon"><FiClock /></div>
//                         <div className="card-content">
//                           <h5>Attendance</h5>
//                           <p className="card-value">{generatedReport.summary.avgAttendanceRate || 0}%</p>
//                         </div>
//                       </div>
//                     </>
//                   )}

//                   {reportType === 'attendance' && (
//                     <>
//                       <div className="summary-card success">
//                         <div className="card-icon"><FiUsers /></div>
//                         <div className="card-content">
//                           <h5>Total Records</h5>
//                           <p className="card-value">{generatedReport.summary.totalRecords || 0}</p>
//                         </div>
//                       </div>
//                       <div className="summary-card primary">
//                         <div className="card-icon"><FiClock /></div>
//                         <div className="card-content">
//                           <h5>Present Days</h5>
//                           <p className="card-value">{generatedReport.summary.presentCount || 0}</p>
//                         </div>
//                       </div>
//                       <div className="summary-card danger">
//                         <div className="card-icon"><FiActivity /></div>
//                         <div className="card-content">
//                           <h5>Absent Days</h5>
//                           <p className="card-value">{generatedReport.summary.absentCount || 0}</p>
//                         </div>
//                       </div>
//                       <div className="summary-card warning">
//                         <div className="card-icon"><FiTrendingUp /></div>
//                         <div className="card-content">
//                           <h5>Late Arrivals</h5>
//                           <p className="card-value">{generatedReport.summary.lateCount || 0}</p>
//                         </div>
//                       </div>
//                     </>
//                   )}

//                   {reportType === 'productivity' && (
//                     <>
//                       <div className="summary-card primary">
//                         <div className="card-icon"><FiActivity /></div>
//                         <div className="card-content">
//                           <h5>Total Tasks</h5>
//                           <p className="card-value">{generatedReport.summary.totalTasks || 0}</p>
//                         </div>
//                       </div>
//                       <div className="summary-card success">
//                         <div className="card-icon"><FiTrendingUp /></div>
//                         <div className="card-content">
//                           <h5>Completed</h5>
//                           <p className="card-value">{generatedReport.summary.completedTasks || 0}</p>
//                         </div>
//                       </div>
//                       <div className="summary-card info">
//                         <div className="card-icon"><FiBarChart2 /></div>
//                         <div className="card-content">
//                           <h5>Completion Rate</h5>
//                           <p className="card-value">{generatedReport.summary.taskCompletionRate || 0}%</p>
//                         </div>
//                       </div>
//                       <div className="summary-card warning">
//                         <div className="card-icon"><FiClock /></div>
//                         <div className="card-content">
//                           <h5>Efficiency</h5>
//                           <p className="card-value">{generatedReport.summary.efficiency || 0}%</p>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* Charts Section */}
//               {(chartData || pieData) && (
//                 <div className="charts-section">
//                   <div className="charts-grid">
//                     {chartData && (
//                       <div className="chart-container">
//                         <h5 className="chart-title">
//                           {reportType === 'performance' && 'Top Performers'}
//                           {reportType === 'attendance' && 'Attendance Overview'}
//                           {reportType === 'productivity' && 'Project Completion'}
//                         </h5>
//                         <ResponsiveContainer width="100%" height={300}>
//                           <BarChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="name" />
//                             <YAxis />
//                             <Tooltip />
//                             <Legend />
//                             {reportType === 'performance' && (
//                               <>
//                                 <Bar dataKey="score" fill="#0088FE" name="Performance Score" />
//                                 <Bar dataKey="tasks" fill="#00C49F" name="Tasks Completed" />
//                               </>
//                             )}
//                             {reportType === 'attendance' && (
//                               <>
//                                 <Bar dataKey="present" fill="#00C49F" name="Present" />
//                                 <Bar dataKey="late" fill="#FFBB28" name="Late" />
//                                 <Bar dataKey="absent" fill="#FF8042" name="Absent" />
//                               </>
//                             )}
//                             {reportType === 'productivity' && (
//                               <>
//                                 <Bar dataKey="completed" fill="#00C49F" name="Completed" />
//                                 <Bar dataKey="total" fill="#0088FE" name="Total" />
//                               </>
//                             )}
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </div>
//                     )}

//                     {pieData && (
//                       <div className="chart-container">
//                         <h5 className="chart-title">
//                           {reportType === 'performance' && 'Performance Distribution'}
//                           {reportType === 'attendance' && 'Attendance Status'}
//                           {reportType === 'productivity' && 'Task Status'}
//                         </h5>
//                         <ResponsiveContainer width="100%" height={300}>
//                           <PieChart>
//                             <Pie
//                               data={pieData}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                               outerRadius={80}
//                               fill="#8884d8"
//                               dataKey="value"
//                             >
//                               {pieData.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                               ))}
//                             </Pie>
//                             <Tooltip />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Insights */}
//               {generatedReport.insights && generatedReport.insights.length > 0 && (
//                 <div className="insights-section">
//                   <h5 className="section-subtitle">
//                     <FiActivity /> Key Insights
//                   </h5>
//                   <div className="insights-list">
//                     {generatedReport.insights.map((insight, index) => (
//                       <div key={index} className="insight-item">
//                         <span className="insight-icon">💡</span>
//                         <p>{insight}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Data Table */}
//               {reportData.length > 0 && (
//                 <div className="data-table-section">
//                   <h5 className="section-subtitle">
//                     <FiFileText /> Detailed Data ({reportData.length} records)
//                   </h5>
//                   <div className="table-responsive">
//                     {reportType === 'performance' && (
//                       <table className="data-table">
//                         <thead>
//                           <tr>
//                             <th>Employee</th>
//                             <th>Department</th>
//                             <th>Tasks</th>
//                             <th>Completion</th>
//                             <th>Attendance</th>
//                             <th>Score</th>
//                             <th>Rating</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {reportData.slice(0, 20).map((emp, index) => (
//                             <tr key={index}>
//                               <td>{emp.employeeName || 'N/A'}</td>
//                               <td>{emp.department || 'N/A'}</td>
//                               <td>{emp.metrics?.completedTasks || 0}</td>
//                               <td>{emp.metrics?.taskCompletionRate || 0}%</td>
//                               <td>{emp.metrics?.attendanceRate || 0}%</td>
//                               <td><span className="score-badge">{emp.performanceScore || 0}%</span></td>
//                               <td><span className="rating-badge">{emp.rating || 'N/A'}</span></td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}

//                     {reportType === 'attendance' && (
//                       <table className="data-table">
//                         <thead>
//                           <tr>
//                             <th>Employee</th>
//                             <th>Department</th>
//                             <th>Days</th>
//                             <th>Present</th>
//                             <th>Absent</th>
//                             <th>Late</th>
//                             <th>Rate</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {reportData.slice(0, 20).map((emp, index) => (
//                             <tr key={index}>
//                               <td>{emp.employeeName || 'N/A'}</td>
//                               <td>{emp.department || 'N/A'}</td>
//                               <td>{emp.totalDays || 0}</td>
//                               <td>{emp.presentDays || 0}</td>
//                               <td>{emp.absentDays || 0}</td>
//                               <td>{emp.lateDays || 0}</td>
//                               <td>{emp.attendanceRate || 0}%</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}

//                     {reportType === 'productivity' && (
//                       <table className="data-table">
//                         <thead>
//                           <tr>
//                             <th>Project</th>
//                             <th>Client</th>
//                             <th>Status</th>
//                             <th>Tasks</th>
//                             <th>Completed</th>
//                             <th>Rate</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {reportData.slice(0, 20).map((proj, index) => (
//                             <tr key={index}>
//                               <td>{proj.projectName || 'N/A'}</td>
//                               <td>{proj.client || 'N/A'}</td>
//                               <td><span className={`status-badge ${proj.status}`}>{proj.status}</span></td>
//                               <td>{proj.totalTasks || 0}</td>
//                               <td>{proj.completedTasks || 0}</td>
//                               <td>{proj.completionRate || 0}%</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}

//                     {reportType === 'employee' && (
//                       <table className="data-table">
//                         <thead>
//                           <tr>
//                             <th>Employee</th>
//                             <th>Department</th>
//                             <th>Position</th>
//                             <th>Tasks</th>
//                             <th>Projects</th>
//                             <th>Attendance</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {reportData.slice(0, 20).map((emp, index) => (
//                             <tr key={index}>
//                               <td>{emp.personalInfo?.name || 'N/A'}</td>
//                               <td>{emp.personalInfo?.department || 'N/A'}</td>
//                               <td>{emp.personalInfo?.position || 'N/A'}</td>
//                               <td>{emp.performance?.completedTasks || 0}/{emp.performance?.totalTasks || 0}</td>
//                               <td>{emp.projects?.active || 0}/{emp.projects?.total || 0}</td>
//                               <td>{emp.attendance?.attendanceRate || 0}%</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                   {reportData.length > 20 && (
//                     <div className="show-more">
//                       <p>Showing first 20 of {reportData.length} records. Download full report for complete data.</p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {reportData.length === 0 && (
//                 <div className="no-data">
//                   <p>No data available for the selected criteria. Try different filters or date range.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ReportGenerator;












































import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { 
  FiFileText, 
  FiDownload, 
  FiCalendar, 
  FiUsers,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiBarChart2,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiMail
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ReportGenerator.css';

function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportType, setReportType] = useState('performance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    employeeId: '',
    department: ''
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments] = useState([
    'Development',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations'
  ]);

  const reportTypes = [
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Employee performance and productivity metrics',
      icon: <FiTrendingUp />,
      color: 'primary'
    },
    {
      id: 'attendance',
      name: 'Attendance Report',
      description: 'Employee attendance and punctuality statistics',
      icon: <FiClock />,
      color: 'success'
    },
    {
      id: 'productivity',
      name: 'Productivity Report',
      description: 'Task completion and project progress',
      icon: <FiActivity />,
      color: 'warning'
    },
    {
      id: 'employee',
      name: 'Employee Report',
      description: 'Comprehensive employee data and insights',
      icon: <FiUsers />,
      color: 'info'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await adminAPI.getEmployees();
      if (response.data?.data) {
        setEmployees(response.data.data);
      } else if (Array.isArray(response.data)) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        ...(filters.department && { department: filters.department })
      };

      let response;

      switch(reportType) {
        case 'performance':
          response = await adminAPI.getPerformanceReport(params);
          break;
        case 'attendance':
          response = await adminAPI.getAttendanceReport(params);
          break;
        case 'productivity':
          response = await adminAPI.getProductivityReport(params);
          break;
        case 'employee':
          response = await adminAPI.getEmployeeReport(params);
          break;
        default:
          response = await adminAPI.generateReport({
            reportType,
            ...params,
            filters
          });
      }

      // Extract data from response
      const reportData = response.data || response;
      
      if (!reportData) {
        toast.error('No data returned from server');
        return;
      }

      console.log(`📊 ${reportType} Report Data:`, reportData);
      
      setGeneratedReport(reportData);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    if (!generatedReport) {
      toast.error('No report to download');
      return;
    }

    try {
      setExporting(true);
      
      const params = {
        format: format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        ...(filters.department && { department: filters.department })
      };

      const response = await adminAPI.exportReport(reportType, params);
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(error.response?.data?.message || 'Failed to download report');
    } finally {
      setExporting(false);
    }
  };

  const handleEmailReport = () => {
    toast.info('Email feature coming soon!');
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setFilters({
      employeeId: '',
      department: ''
    });
  };

  const selectedReport = reportTypes.find(r => r.id === reportType);

  // ✅ FIXED: Handle different backend response structures
  // Safe data extraction with null checks
  const getReportData = () => {
    if (!generatedReport) return [];
    
    console.log('📋 Processing report data for:', reportType);
    console.log('📋 Generated report structure:', generatedReport);
    
    try {
      if (reportType === 'performance') {
        // Handle both possible structures
        const data = generatedReport.data || generatedReport.performanceData || [];
        return Array.isArray(data) ? data : [];
      } 
      else if (reportType === 'attendance') {
        // Handle attendance data - multiple possible structures
        let data = [];
        
        if (Array.isArray(generatedReport.employeeBreakdown)) {
          data = generatedReport.employeeBreakdown;
        } 
        else if (Array.isArray(generatedReport.data)) {
          data = generatedReport.data;
        } 
        else if (generatedReport.attendanceData && Array.isArray(generatedReport.attendanceData)) {
          data = generatedReport.attendanceData;
        }
        
        console.log('📋 Attendance data extracted:', data.length, 'records');
        return data;
      } 
      else if (reportType === 'productivity') {
        const data = generatedReport.projectBreakdown || generatedReport.data || [];
        return Array.isArray(data) ? data : [];
      } 
      else if (reportType === 'employee') {
        // Handle employee report data structure
        let data = [];
        
        if (Array.isArray(generatedReport.data)) {
          data = generatedReport.data;
        }
        else if (generatedReport.employees && Array.isArray(generatedReport.employees)) {
          data = generatedReport.employees;
        }
        else if (generatedReport.employeeData && Array.isArray(generatedReport.employeeData)) {
          data = generatedReport.employeeData;
        }
        
        console.log('📋 Employee data extracted:', data.length, 'records');
        return data;
      }
    } catch (error) {
      console.error('Error extracting report data:', error);
    }
    
    return [];
  };

  // ✅ FIXED: Handle field name variations in chart data
  const getChartData = () => {
    const data = getReportData();
    if (!data || data.length === 0) {
      console.log('No data available for chart');
      return null;
    }

    console.log('📊 Creating chart data from:', data.length, 'records');

    try {
      if (reportType === 'performance') {
        return data.slice(0, 10).map(emp => {
          // Handle different field name variations
          const name = emp.employeeName || emp.name || emp.user?.name || emp.fullName || 'Unknown';
          const score = emp.performanceScore || emp.score || emp.rating || 0;
          const tasks = emp.metrics?.completedTasks || emp.completedTasks || emp.tasksCompleted || 0;
          
          return {
            name: name.split(' ')[0] || name,
            score: parseFloat(score),
            tasks: parseInt(tasks)
          };
        });
      } 
      else if (reportType === 'attendance') {
        return data.slice(0, 10).map(emp => {
          // Handle different field name variations for attendance
          const name = emp.employeeName || emp.name || emp.employee?.name || 'Unknown';
          const present = emp.presentDays || emp.present || emp.daysPresent || 0;
          const absent = emp.absentDays || emp.absent || emp.daysAbsent || 0;
          const late = emp.lateDays || emp.late || emp.daysLate || 0;
          
          return {
            name: name.split(' ')[0] || name,
            present: parseInt(present),
            absent: parseInt(absent),
            late: parseInt(late)
          };
        });
      } 
      else if (reportType === 'productivity') {
        return data.slice(0, 10).map(proj => {
          const name = proj.projectName || proj.name || 'Unknown';
          const completed = proj.completedTasks || proj.tasksCompleted || 0;
          const total = proj.totalTasks || proj.tasks || 0;
          
          return {
            name: name.substring(0, 15),
            completed: parseInt(completed),
            total: parseInt(total)
          };
        });
      }
    } catch (error) {
      console.error('Error creating chart data:', error);
    }

    return null;
  };

  // ✅ FIXED: Handle summary data variations
  const getPieChartData = () => {
    if (!generatedReport?.summary) {
      console.log('No summary data available');
      return null;
    }

    console.log('📊 Summary data:', generatedReport.summary);

    try {
      if (reportType === 'performance') {
        return [
          { 
            name: 'Excellent (90+)', 
            value: generatedReport.summary.excellentCount || 
                   generatedReport.summary.excellentEmployees || 
                   generatedReport.summary.topPerformers?.length || 0 
          },
          { 
            name: 'Good (75-89)', 
            value: generatedReport.summary.goodCount || 
                   generatedReport.summary.goodEmployees || 0 
          },
          { 
            name: 'Average (60-74)', 
            value: generatedReport.summary.averageCount || 
                   generatedReport.summary.averageEmployees || 0 
          },
          { 
            name: 'Poor (<60)', 
            value: generatedReport.summary.poorCount || 
                   generatedReport.summary.poorEmployees || 0 
          }
        ].filter(item => item.value > 0);
      } 
      else if (reportType === 'attendance') {
        return [
          { 
            name: 'Present', 
            value: generatedReport.summary.presentCount || 
                   generatedReport.summary.presentDays || 
                   generatedReport.summary.daysPresent || 0 
          },
          { 
            name: 'Absent', 
            value: generatedReport.summary.absentCount || 
                   generatedReport.summary.absentDays || 
                   generatedReport.summary.daysAbsent || 0 
          },
          { 
            name: 'Late', 
            value: generatedReport.summary.lateCount || 
                   generatedReport.summary.lateDays || 
                   generatedReport.summary.daysLate || 0 
          },
          { 
            name: 'Leave', 
            value: generatedReport.summary.leaveCount || 
                   generatedReport.summary.leaveDays || 
                   generatedReport.summary.daysLeave || 0 
          }
        ].filter(item => item.value > 0);
      } 
      else if (reportType === 'productivity') {
        return [
          { 
            name: 'Completed', 
            value: generatedReport.summary.completedTasks || 
                   generatedReport.summary.tasksCompleted || 0 
          },
          { 
            name: 'In Progress', 
            value: generatedReport.summary.inProgressTasks || 
                   generatedReport.summary.tasksInProgress || 0 
          },
          { 
            name: 'Pending', 
            value: generatedReport.summary.pendingTasks || 
                   generatedReport.summary.tasksPending || 0 
          },
          { 
            name: 'Overdue', 
            value: generatedReport.summary.overdueTasks || 
                   generatedReport.summary.tasksOverdue || 0 
          }
        ].filter(item => item.value > 0);
      }
    } catch (error) {
      console.error('Error creating pie chart data:', error);
    }

    return null;
  };

  // ✅ FIXED: Helper function to get employee name from different structures
  const getEmployeeName = (emp) => {
    return emp.employeeName || 
           emp.name || 
           emp.user?.name || 
           emp.fullName || 
           emp.personalInfo?.name || 
           'Unknown';
  };

  // ✅ FIXED: Helper function to get department from different structures
  const getEmployeeDepartment = (emp) => {
    return emp.department || 
           emp.user?.department || 
           emp.personalInfo?.department || 
           'N/A';
  };

  const reportData = getReportData();
  const chartData = getChartData();
  const pieData = getPieChartData();

  return (
    <div className="report-generator">
      <div className="page-header">
        <div>
          <h1><FiBarChart2 /> Report Generator</h1>
          <p>Generate comprehensive reports with advanced analytics</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      <div className="report-container">
        {/* Report Type Selection */}
        <div className="report-section">
          <h3 className="section-title">
            <FiFileText /> Select Report Type
          </h3>
          <div className="report-types-grid">
            {reportTypes.map((type) => (
              <div
                key={type.id}
                className={`report-type-card ${reportType === type.id ? 'active' : ''} ${type.color}`}
                onClick={() => setReportType(type.id)}
              >
                <div className={`report-icon ${type.color}`}>
                  {type.icon}
                </div>
                <h4>{type.name}</h4>
                <p>{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="report-section">
          <h3 className="section-title">
            <FiCalendar /> Select Date Range
          </h3>
          <div className="date-range-container">
            <div className="date-input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                max={dateRange.endDate}
              />
            </div>
            <div className="date-separator">to</div>
            <div className="date-input-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                min={dateRange.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="quick-ranges">
            <button className="quick-range-btn" onClick={() => {
              const endDate = new Date();
              const startDate = new Date(endDate);
              startDate.setDate(startDate.getDate() - 7);
              setDateRange({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
              });
            }}>Last 7 Days</button>
            <button className="quick-range-btn" onClick={() => {
              const endDate = new Date();
              const startDate = new Date(endDate);
              startDate.setDate(startDate.getDate() - 30);
              setDateRange({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
              });
            }}>Last 30 Days</button>
            <button className="quick-range-btn" onClick={() => {
              const endDate = new Date();
              const startDate = new Date(endDate);
              startDate.setMonth(startDate.getMonth() - 3);
              setDateRange({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
              });
            }}>Last 3 Months</button>
            <button className="quick-range-btn" onClick={() => {
              const endDate = new Date();
              const startDate = new Date(endDate.getFullYear(), 0, 1);
              setDateRange({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
              });
            }}>This Year</button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="report-section filters-section">
            <h3 className="section-title">
              <FiFilter /> Advanced Filters
            </h3>
            <div className="filters-grid">
              {(reportType === 'performance' || reportType === 'attendance' || reportType === 'employee') && (
                <div className="filter-group">
                  <label>Employee</label>
                  <select
                    value={filters.employeeId}
                    onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name || emp.user?.name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(reportType === 'performance' || reportType === 'attendance' || reportType === 'employee') && (
                <div className="filter-group">
                  <label>Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-actions">
                <button className="btn btn-outline btn-sm" onClick={resetFilters}>
                  <FiRefreshCw /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="generate-section">
          <button
            className="btn btn-primary btn-large"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Generating Report...
              </>
            ) : (
              <>
                <FiFileText />
                Generate {selectedReport?.name}
              </>
            )}
          </button>
        </div>

        {/* Generated Report Preview */}
        {generatedReport && (
          <div className="report-section report-results">
            <div className="report-results-header">
              <h3 className="section-title">
                <FiEye /> Report Results
              </h3>
              <div className="download-buttons">
                <button className="btn btn-icon" onClick={() => handleDownload('pdf')} disabled={exporting}>
                  <FiDownload /> PDF
                </button>
                <button className="btn btn-icon" onClick={() => handleDownload('excel')} disabled={exporting}>
                  <FiDownload /> Excel
                </button>
                <button className="btn btn-icon" onClick={() => handleDownload('csv')} disabled={exporting}>
                  <FiDownload /> CSV
                </button>
                <button className="btn btn-icon" onClick={handlePrint}>
                  <FiFileText /> Print
                </button>
                <button className="btn btn-icon" onClick={handleEmailReport}>
                  <FiMail /> Email
                </button>
              </div>
            </div>

            <div className="report-preview">
              <div className="preview-header">
                <div className="preview-info">
                  <h4>{selectedReport?.name}</h4>
                  <p className="report-period">
                    <FiCalendar /> 
                    {new Date(dateRange.startDate).toLocaleDateString()} - 
                    {new Date(dateRange.endDate).toLocaleDateString()}
                  </p>
                  <p className="report-generated">
                    Generated: {new Date().toLocaleString()}
                  </p>
                  <p className="report-record-count">
                    Records: {reportData.length}
                  </p>
                </div>
              </div>

              {/* Summary Cards - FIXED to handle different field names */}
              {generatedReport.summary && (
                <div className="summary-cards">
                  {reportType === 'performance' && (
                    <>
                      <div className="summary-card primary">
                        <div className="card-icon"><FiUsers /></div>
                        <div className="card-content">
                          <h5>Total Employees</h5>
                          <p className="card-value">
                            {generatedReport.summary.totalEmployees || 
                             generatedReport.summary.employeeCount || 
                             reportData.length || 0}
                          </p>
                        </div>
                      </div>
                      <div className="summary-card success">
                        <div className="card-icon"><FiTrendingUp /></div>
                        <div className="card-content">
                          <h5>Avg Performance</h5>
                          <p className="card-value">
                            {generatedReport.summary.avgPerformanceScore || 
                             generatedReport.summary.averageScore || 
                             '0'}%
                          </p>
                        </div>
                      </div>
                      <div className="summary-card warning">
                        <div className="card-icon"><FiActivity /></div>
                        <div className="card-content">
                          <h5>Task Completion</h5>
                          <p className="card-value">
                            {generatedReport.summary.avgTaskCompletionRate || 
                             generatedReport.summary.averageCompletion || 
                             '0'}%
                          </p>
                        </div>
                      </div>
                      <div className="summary-card info">
                        <div className="card-icon"><FiClock /></div>
                        <div className="card-content">
                          <h5>Attendance</h5>
                          <p className="card-value">
                            {generatedReport.summary.avgAttendanceRate || 
                             generatedReport.summary.averageAttendance || 
                             '0'}%
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {reportType === 'attendance' && (
                    <>
                      <div className="summary-card success">
                        <div className="card-icon"><FiUsers /></div>
                        <div className="card-content">
                          <h5>Total Records</h5>
                          <p className="card-value">
                            {generatedReport.summary.totalRecords || 
                             generatedReport.summary.totalDays || 
                             reportData.length || 0}
                          </p>
                        </div>
                      </div>
                      <div className="summary-card primary">
                        <div className="card-icon"><FiClock /></div>
                        <div className="card-content">
                          <h5>Present Days</h5>
                          <p className="card-value">
                            {generatedReport.summary.presentCount || 
                             generatedReport.summary.daysPresent || 0}
                          </p>
                        </div>
                      </div>
                      <div className="summary-card danger">
                        <div className="card-icon"><FiActivity /></div>
                        <div className="card-content">
                          <h5>Absent Days</h5>
                          <p className="card-value">
                            {generatedReport.summary.absentCount || 
                             generatedReport.summary.daysAbsent || 0}
                          </p>
                        </div>
                      </div>
                      <div className="summary-card warning">
                        <div className="card-icon"><FiTrendingUp /></div>
                        <div className="card-content">
                          <h5>Late Arrivals</h5>
                          <p className="card-value">
                            {generatedReport.summary.lateCount || 
                             generatedReport.summary.daysLate || 0}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {reportType === 'productivity' && (
                    <>
                      <div className="summary-card primary">
                        <div className="card-icon"><FiActivity /></div>
                        <div className="card-content">
                          <h5>Total Tasks</h5>
                          <p className="card-value">
                            {generatedReport.summary.totalTasks || 
                             generatedReport.summary.tasksTotal || 0}
                          </p>
                        </div>
                      </div>
                      <div className="summary-card success">
                        <div className="card-icon"><FiTrendingUp /></div>
                        <div className="card-content">
                          <h5>Completed</h5>
                          <p className="card-value">
                            {generatedReport.summary.completedTasks || 
                             generatedReport.summary.tasksCompleted || 0}
                          </p>
                        </div>
                      </div>
                      <div className="summary-card info">
                        <div className="card-icon"><FiBarChart2 /></div>
                        <div className="card-content">
                          <h5>Completion Rate</h5>
                          <p className="card-value">
                            {generatedReport.summary.taskCompletionRate || 
                             generatedReport.summary.completionRate || '0'}%
                          </p>
                        </div>
                      </div>
                      <div className="summary-card warning">
                        <div className="card-icon"><FiClock /></div>
                        <div className="card-content">
                          <h5>Efficiency</h5>
                          <p className="card-value">
                            {generatedReport.summary.efficiency || 
                             generatedReport.summary.productivity || '0'}%
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Charts Section */}
              {(chartData || pieData) && (
                <div className="charts-section">
                  <div className="charts-grid">
                    {chartData && chartData.length > 0 && (
                      <div className="chart-container">
                        <h5 className="chart-title">
                          {reportType === 'performance' && 'Top Performers'}
                          {reportType === 'attendance' && 'Attendance Overview'}
                          {reportType === 'productivity' && 'Project Completion'}
                        </h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {reportType === 'performance' && (
                              <>
                                <Bar dataKey="score" fill="#0088FE" name="Performance Score" />
                                <Bar dataKey="tasks" fill="#00C49F" name="Tasks Completed" />
                              </>
                            )}
                            {reportType === 'attendance' && (
                              <>
                                <Bar dataKey="present" fill="#00C49F" name="Present" />
                                <Bar dataKey="late" fill="#FFBB28" name="Late" />
                                <Bar dataKey="absent" fill="#FF8042" name="Absent" />
                              </>
                            )}
                            {reportType === 'productivity' && (
                              <>
                                <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                                <Bar dataKey="total" fill="#0088FE" name="Total" />
                              </>
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {pieData && pieData.length > 0 && (
                      <div className="chart-container">
                        <h5 className="chart-title">
                          {reportType === 'performance' && 'Performance Distribution'}
                          {reportType === 'attendance' && 'Attendance Status'}
                          {reportType === 'productivity' && 'Task Status'}
                        </h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Insights */}
              {generatedReport.insights && generatedReport.insights.length > 0 && (
                <div className="insights-section">
                  <h5 className="section-subtitle">
                    <FiActivity /> Key Insights
                  </h5>
                  <div className="insights-list">
                    {generatedReport.insights.map((insight, index) => (
                      <div key={index} className="insight-item">
                        <span className="insight-icon">💡</span>
                        <p>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Table - FIXED to handle different data structures */}
              {reportData.length > 0 && (
                <div className="data-table-section">
                  <h5 className="section-subtitle">
                    <FiFileText /> Detailed Data ({reportData.length} records)
                  </h5>
                  <div className="table-responsive">
                    {reportType === 'performance' && (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Tasks</th>
                            <th>Completion</th>
                            <th>Attendance</th>
                            <th>Score</th>
                            <th>Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.slice(0, 20).map((emp, index) => (
                            <tr key={index}>
                              <td>{getEmployeeName(emp)}</td>
                              <td>{getEmployeeDepartment(emp)}</td>
                              <td>{emp.metrics?.completedTasks || emp.completedTasks || 0}</td>
                              <td>{emp.metrics?.taskCompletionRate || emp.completionRate || 0}%</td>
                              <td>{emp.metrics?.attendanceRate || emp.attendanceRate || 0}%</td>
                              <td><span className="score-badge">{emp.performanceScore || emp.score || 0}%</span></td>
                              <td><span className="rating-badge">{emp.rating || 'N/A'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {reportType === 'attendance' && (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Days</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Late</th>
                            <th>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.slice(0, 20).map((emp, index) => (
                            <tr key={index}>
                              <td>{getEmployeeName(emp)}</td>
                              <td>{getEmployeeDepartment(emp)}</td>
                              <td>{emp.totalDays || emp.days || 0}</td>
                              <td>{emp.presentDays || emp.present || 0}</td>
                              <td>{emp.absentDays || emp.absent || 0}</td>
                              <td>{emp.lateDays || emp.late || 0}</td>
                              <td>{emp.attendanceRate || emp.rate || 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {reportType === 'productivity' && (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Client</th>
                            <th>Status</th>
                            <th>Tasks</th>
                            <th>Completed</th>
                            <th>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.slice(0, 20).map((proj, index) => (
                            <tr key={index}>
                              <td>{proj.projectName || proj.name || 'N/A'}</td>
                              <td>{proj.client || 'N/A'}</td>
                              <td><span className={`status-badge ${proj.status?.toLowerCase() || 'pending'}`}>
                                {proj.status || 'Pending'}
                              </span></td>
                              <td>{proj.totalTasks || proj.tasks || 0}</td>
                              <td>{proj.completedTasks || proj.completed || 0}</td>
                              <td>{proj.completionRate || proj.progress || 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {reportType === 'employee' && (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Position</th>
                            <th>Tasks</th>
                            <th>Projects</th>
                            <th>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.slice(0, 20).map((emp, index) => (
                            <tr key={index}>
                              <td>{getEmployeeName(emp)}</td>
                              <td>{getEmployeeDepartment(emp)}</td>
                              <td>{emp.position || emp.designation || emp.personalInfo?.position || 'N/A'}</td>
                              <td>{(emp.performance?.completedTasks || emp.completedTasks || 0)}/{(emp.performance?.totalTasks || emp.totalTasks || 0)}</td>
                              <td>{(emp.projects?.active || emp.activeProjects || 0)}/{(emp.projects?.total || emp.totalProjects || 0)}</td>
                              <td>{emp.attendance?.attendanceRate || emp.attendanceRate || 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {reportData.length > 20 && (
                    <div className="show-more">
                      <p>Showing first 20 of {reportData.length} records. Download full report for complete data.</p>
                    </div>
                  )}
                </div>
              )}

              {reportData.length === 0 && (
                <div className="no-data">
                  <p>No data available for the selected criteria. Try different filters or date range.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportGenerator;