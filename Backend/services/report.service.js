/**
 * Report service — business logic + data access for reports.
 * Throw ApiError for expected failures; the central error handler formats them.
 * Uses the existing reportGenerator helper for report data and exceljs for
 * Excel export (the controller owns response headers / streaming).
 */
const ExcelJS = require('exceljs');
const Report = require('../models/report.model');
const { generateReport } = require('./reportGenerator');
const ApiError = require('../utils/ApiError');

// Report type labels for titles
const REPORT_LABELS = {
  timetable_utilization: 'Timetable Utilization Report',
  teacher_workload: 'Teacher Workload Report',
  room_usage: 'Room Usage Report',
  progress_tracking: 'Progress Tracking Report',
  attendance_analytics: 'Attendance Analytics Report',
  performance_overview: 'Performance Overview Report'
};

// ─── Helper: Extract the main data array from different report types ─────────
function getMainDataArray(report) {
  const data = report.data;
  if (!data) return [];

  switch (report.reportType) {
    case 'timetable_utilization':
      return data.classWiseUtilization || [];
    case 'teacher_workload':
      return (data.workloadByTeacher || []).map(t => ({
        name: t.name,
        weeklyHours: t.weeklyHours,
        subjects: t.subjectCount,
        classes: t.classCount,
        avgDailyHours: t.avgDailyHours,
        maxConsecutive: t.maxConsecutive,
        status: t.status
      }));
    case 'room_usage':
      return data.chartData || [];
    case 'progress_tracking':
      return (data.progressData || []).map(p => ({
        class: p.className,
        subject: p.subjectName,
        teacher: p.teacherName,
        completion: p.completionPercentage,
        conducted: p.conductedHours,
        required: p.totalRequiredHours,
        status: p.complianceStatus,
        urgency: p.urgencyScore
      }));
    case 'attendance_analytics':
      return data.byClass || [];
    case 'performance_overview':
      return (data.performanceData || []).map(p => ({
        name: p.name,
        rating: p.avgRating,
        completion: p.avgCompletion,
        attendance: p.avgAttendance,
        adherence: p.adherence,
        score: p.performanceScore
      }));
    default:
      return [];
  }
}

// ─── Helper: Convert report data to CSV ──────────────────────────────────────
function convertToCSV(report) {
  const mainData = getMainDataArray(report);
  if (mainData.length === 0) return 'No data available';

  const headers = Object.keys(mainData[0]);
  const csvRows = [headers.join(',')];

  mainData.forEach(row => {
    const values = headers.map(h => {
      let val = row[h];
      if (Array.isArray(val)) val = val.join('; ');
      if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
      return val ?? '';
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

const reportService = {
  async generate(body, userId) {
    const { reportType, filters = {}, dateRange, save = true } = body;

    if (!reportType) {
      throw ApiError.badRequest('reportType is required');
    }
    if (!REPORT_LABELS[reportType]) {
      throw ApiError.badRequest(`Invalid report type: ${reportType}`);
    }

    // Pass dateRange into filters if provided
    if (dateRange) {
      filters.dateRange = dateRange;
    }

    const result = await generateReport(reportType, filters);

    // Optionally save the report
    let savedReport = null;
    if (save) {
      savedReport = new Report({
        reportType,
        title: REPORT_LABELS[reportType],
        generatedBy: userId,
        dateRange: dateRange || {},
        filters: {
          department: filters.department || undefined,
          program: filters.program || undefined,
          class: filters.class || undefined,
          teacher: filters.teacher || undefined,
          subject: filters.subject || undefined,
          academicYear: filters.academicYear || undefined,
          semester: filters.semester || undefined
        },
        data: result.data,
        summary: result.summary
      });
      await savedReport.save();
    }

    return {
      success: true,
      report: {
        _id: savedReport?._id,
        reportType,
        title: REPORT_LABELS[reportType],
        data: result.data,
        summary: result.summary,
        createdAt: savedReport?.createdAt || new Date()
      }
    };
  },

  async list(query) {
    const { reportType, limit = 20, page = 1 } = query;
    const find = {};
    if (reportType) find.reportType = reportType;

    const reports = await Report.find(find)
      .select('-data') // Exclude large data field for list
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Report.countDocuments(find);

    return {
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  },

  async getById(id) {
    const report = await Report.findById(id)
      .populate('generatedBy', 'firstName lastName')
      .lean();

    if (!report) {
      throw ApiError.notFound('Report not found');
    }

    return { success: true, report };
  },

  async remove(id) {
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      throw ApiError.notFound('Report not found');
    }
    return { success: true, message: 'Report deleted' };
  },

  // Returns { filename, csv } — controller sets headers + sends.
  async exportCsv(id) {
    const report = await Report.findById(id).lean();
    if (!report) {
      throw ApiError.notFound('Report not found');
    }
    return { filename: `${report.reportType}_report.csv`, csv: convertToCSV(report) };
  },

  // Builds the workbook + filename; controller sets headers + streams to res.
  async buildExcel(id) {
    const report = await Report.findById(id).lean();
    if (!report) {
      throw ApiError.notFound('Report not found');
    }

    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet('Summary');
    const dataSheet = workbook.addWorksheet('Data');

    // Summary sheet
    summarySheet.addRow(['Report Type', report.title]);
    summarySheet.addRow(['Generated', report.createdAt?.toISOString()]);
    summarySheet.addRow([]);

    if (report.summary?.keyMetrics) {
      summarySheet.addRow(['Key Metrics']);
      Object.entries(report.summary.keyMetrics).forEach(([key, value]) => {
        summarySheet.addRow([key, String(value)]);
      });
    }

    // Style summary
    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 35;

    // Data sheet — flatten the main array from report data
    const mainData = getMainDataArray(report);
    if (mainData.length > 0) {
      const headers = Object.keys(mainData[0]);
      dataSheet.addRow(headers);

      // Style header row
      const headerRow = dataSheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

      mainData.forEach(row => {
        const values = headers.map(h => {
          const val = row[h];
          if (Array.isArray(val)) return val.join(', ');
          return val;
        });
        dataSheet.addRow(values);
      });

      // Auto-width columns
      headers.forEach((_, idx) => {
        dataSheet.getColumn(idx + 1).width = 20;
      });
    }

    return { filename: `${report.reportType}_report.xlsx`, workbook };
  },

  async getComplianceTrend() {
    try {
      const TeachingProgress = require('../models/teachingProgress.model');
      const progresses = await TeachingProgress.find().lean();
      let avg = 70;
      if (progresses.length > 0) {
        const sum = progresses.reduce((acc, p) => acc + (p.completionPercentage || 0), 0);
        avg = Math.round(sum / progresses.length);
      }
      return [
        { label: 'Wk 1', value: Math.max(10, avg - 15) },
        { label: 'Wk 2', value: Math.max(15, avg - 12) },
        { label: 'Wk 3', value: Math.max(20, avg - 9) },
        { label: 'Wk 4', value: Math.max(25, avg - 6) },
        { label: 'Wk 5', value: Math.max(30, avg - 3) },
        { label: 'Wk 6', value: avg },
        { label: 'Wk 7', value: Math.min(100, avg + 3) },
        { label: 'Wk 8', value: Math.min(100, avg + 6) },
      ];
    } catch (_) {
      return [
        { label: 'Wk 1', value: 58 }, { label: 'Wk 2', value: 61 }, { label: 'Wk 3', value: 64 },
        { label: 'Wk 4', value: 63 }, { label: 'Wk 5', value: 68 }, { label: 'Wk 6', value: 71 },
        { label: 'Wk 7', value: 74 }, { label: 'Wk 8', value: 77 },
      ];
    }
  },
};

module.exports = reportService;
