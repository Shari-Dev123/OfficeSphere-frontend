// // DailyReportHandler.jsx - Handler for Daily Reports in Report Generator
// import React from 'react';
// import { 
//   FiUsers, 
//   FiClock, 
//   FiCheckCircle, 
//   FiAlertCircle,
//   FiBarChart2 
// } from 'react-icons/fi';
// import { Bar } from 'recharts';

// export const DailyReportHandler = {
//   // Extract report data from API response
//   getReportData: (generatedReport, employees) => {
//     if (!generatedReport) return [];

//     console.log('📋 Processing daily report data:', generatedReport);

//     try {
//       let data = [];

//       if (Array.isArray(generatedReport.data)) {
//         data = generatedReport.data;
//       } else if (Array.isArray(generatedReport.reports)) {
//         data = generatedReport.reports;
//       } else if (Array.isArray(generatedReport.dailyReports)) {
//         data = generatedReport.dailyReports;
//       }

//       console.log('📋 Daily reports extracted:', data.length, 'records');
//       return data;
//     } catch (error) {
//       console.error('Error extracting daily report data:', error);
//       return [];
//     }
//   },

//   // Get employee name from different field structures
//   getEmployeeName: (report) => {
//     return (
//       report.employee?.name ||
//       report.employee?.userId?.name ||
//       report.employeeName ||
//       'Unknown Employee'
//     );
//   },

//   // Get employee department
//   getEmployeeDepartment: (report) => {
//     return (
//       report.employee?.department ||
//       report.employee?.userId?.department ||
//       report.department ||
//       'N/A'
//     );
//   },

//   // Get chart data for bar chart
//   getChartData: (reportData) => {
//     if (!reportData || reportData.length === 0) return null;

//     // Group by employee and calculate total hours
//     const employeeHours = {};

//     reportData.forEach((report) => {
//       const name = DailyReportHandler.getEmployeeName(report);
//       const hours = report.totalHoursWorked || 0;

//       if (!employeeHours[name]) {
//         employeeHours[name] = {
//           name: name.split(' ')[0] || name,
//           hours: 0,
//           reports: 0,
//         };
//       }

//       employeeHours[name].hours += hours;
//       employeeHours[name].reports += 1;
//     });

//     // Convert to array and calculate average
//     return Object.values(employeeHours)
//       .map((emp) => ({
//         name: emp.name,
//         avgHours: parseFloat((emp.hours / emp.reports).toFixed(2)),
//         totalReports: emp.reports,
//       }))
//       .slice(0, 10);
//   },

//   // Get pie chart data
//   getPieChartData: (generatedReport, reportData) => {
//     if (!reportData || reportData.length === 0) return null;

//     // Count by status
//     const statusCounts = {
//       Submitted: 0,
//       Reviewed: 0,
//       Approved: 0,
//     };

//     reportData.forEach((report) => {
//       const status = report.status || 'Submitted';
//       if (statusCounts[status] !== undefined) {
//         statusCounts[status]++;
//       }
//     });

//     return Object.entries(statusCounts)
//       .filter(([_, value]) => value > 0)
//       .map(([name, value]) => ({ name, value }));
//   },

//   // Get chart title
//   getChartTitle: () => 'Average Hours Worked per Employee',

//   // Get pie chart title
//   getPieChartTitle: () => 'Report Status Distribution',

//   // Render chart bars
//   renderChartBars: () => (
//     <>
//       <Bar dataKey="avgHours" fill="#0088FE" name="Avg Hours/Day" />
//       <Bar dataKey="totalReports" fill="#00C49F" name="Total Reports" />
//     </>
//   ),

//   // Render summary cards
//   renderSummaryCards: (generatedReport, reportData) => {
//     const stats = DailyReportHandler.calculateStats(generatedReport, reportData);

//     return (
//       <>
//         <div className="summary-card primary">
//           <div className="card-icon">
//             <FiBarChart2 />
//           </div>
//           <div className="card-content">
//             <h5>Total Reports</h5>
//             <p className="card-value">{stats.total}</p>
//           </div>
//         </div>

//         <div className="summary-card warning">
//           <div className="card-icon">
//             <FiAlertCircle />
//           </div>
//           <div className="card-content">
//             <h5>Pending Review</h5>
//             <p className="card-value">{stats.pending}</p>
//           </div>
//         </div>

//         <div className="summary-card success">
//           <div className="card-icon">
//             <FiCheckCircle />
//           </div>
//           <div className="card-content">
//             <h5>Reviewed/Approved</h5>
//             <p className="card-value">{stats.reviewed}</p>
//           </div>
//         </div>

//         <div className="summary-card info">
//           <div className="card-icon">
//             <FiClock />
//           </div>
//           <div className="card-content">
//             <h5>Avg Hours/Day</h5>
//             <p className="card-value">{stats.avgHours}h</p>
//           </div>
//         </div>
//       </>
//     );
//   },

//   // Calculate statistics
//   calculateStats: (generatedReport, reportData) => {
//     const total = reportData.length;
//     const pending = reportData.filter((r) => r.status === 'Submitted').length;
//     const reviewed = reportData.filter(
//       (r) => r.status === 'Reviewed' || r.status === 'Approved'
//     ).length;

//     const totalHours = reportData.reduce(
//       (sum, r) => sum + (r.totalHoursWorked || 0),
//       0
//     );
//     const avgHours = total > 0 ? (totalHours / total).toFixed(2) : '0';

//     return {
//       total,
//       pending,
//       reviewed,
//       avgHours,
//     };
//   },

//   // Render data table
//   renderDataTable: (reportData, getEmployeeName, getEmployeeDepartment) => {
//     const formatDate = (date) => {
//       if (!date) return 'N/A';
//       return new Date(date).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric',
//       });
//     };

//     const getStatusColor = (status) => {
//       switch (status) {
//         case 'Approved':
//           return 'success';
//         case 'Reviewed':
//           return 'info';
//         case 'Submitted':
//           return 'warning';
//         default:
//           return 'secondary';
//       }
//     };

//     return (
//       <table className="data-table">
//         <thead>
//           <tr>
//             <th>Employee</th>
//             <th>Department</th>
//             <th>Date</th>
//             <th>Hours Worked</th>
//             <th>Status</th>
//             <th>Achievements</th>
//             <th>Challenges</th>
//           </tr>
//         </thead>
//         <tbody>
//           {reportData.slice(0, 20).map((report, index) => (
//             <tr key={index}>
//               <td>{DailyReportHandler.getEmployeeName(report)}</td>
//               <td>{DailyReportHandler.getEmployeeDepartment(report)}</td>
//               <td>{formatDate(report.date)}</td>
//               <td>{report.totalHoursWorked || 0}h</td>
//               <td>
//                 <span className={`status-badge ${getStatusColor(report.status)}`}>
//                   {report.status || 'Submitted'}
//                 </span>
//               </td>
//               <td>
//                 {report.achievements
//                   ? report.achievements.substring(0, 50) +
//                     (report.achievements.length > 50 ? '...' : '')
//                   : 'None'}
//               </td>
//               <td>
//                 {report.challenges ? (
//                   <span className="badge-danger">Yes</span>
//                 ) : (
//                   <span className="badge-success">No</span>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );
//   },

//   // Get insights for daily reports
//   getDailyReportInsights: (reportData) => {
//     const insights = [];

//     const avgHours =
//       reportData.reduce((sum, r) => sum + (r.totalHoursWorked || 0), 0) /
//       reportData.length;

//     if (avgHours < 6) {
//       insights.push(
//         `Average work hours (${avgHours.toFixed(2)}h) is below standard (8h)`
//       );
//     } else if (avgHours > 10) {
//       insights.push(
//         `Average work hours (${avgHours.toFixed(2)}h) indicates possible overwork`
//       );
//     }

//     const withChallenges = reportData.filter((r) => r.challenges).length;
//     if (withChallenges > 0) {
//       insights.push(
//         `${withChallenges} report(s) mention challenges or blockers`
//       );
//     }

//     const pending = reportData.filter((r) => r.status === 'Submitted').length;
//     if (pending > 0) {
//       insights.push(`${pending} report(s) are pending review`);
//     }

//     const submissionRate = (reportData.length / 30) * 100; // Assuming 30 days
//     insights.push(
//       `Report submission rate: ${submissionRate.toFixed(2)}% of expected`
//     );

//     return insights.length > 0
//       ? insights
//       : ['All daily reports analyzed successfully'];
//   },
// };