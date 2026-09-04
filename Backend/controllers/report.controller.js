/**
 * Report controller — HTTP layer: reads the request, calls the service,
 * shapes the response (incl. file download headers + send/stream). No business
 * logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/report.service');

exports.generate = asyncHandler(async (req, res) => {
  const result = await reportService.generate(req.body, req.user._id);
  res.json(result);
});

exports.list = asyncHandler(async (req, res) => {
  const result = await reportService.list(req.query);
  res.json(result);
});

exports.getComplianceTrend = asyncHandler(async (req, res) => {
  const result = await reportService.getComplianceTrend();
  res.json(result);
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await reportService.getById(req.params.id);
  res.json(result);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await reportService.remove(req.params.id);
  res.json(result);
});

exports.exportCsv = asyncHandler(async (req, res) => {
  const { filename, csv } = await reportService.exportCsv(req.params.id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csv);
});

exports.exportExcel = asyncHandler(async (req, res) => {
  const { filename, workbook } = await reportService.buildExcel(req.params.id);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
});
