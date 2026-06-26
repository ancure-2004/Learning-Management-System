/**
 * Syllabus service — business logic + data access for subject syllabi.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const SubjectSyllabus = require('../models/subjectSyllabus.model');
const Subject = require('../models/subject.model');
const ApiError = require('../utils/ApiError');

const syllabusService = {
  async create(body) {
    const {
      subjectId,
      academicYear,
      semester,
      totalRequiredHours,
      theoryHours,
      labHours,
      units,
      midtermWeight,
      endsemWeight,
      assignmentWeight,
      createdBy,
    } = body;

    // Validate required fields
    if (!subjectId || !academicYear || !semester || !totalRequiredHours) {
      throw ApiError.badRequest(
        'Missing required fields: subjectId, academicYear, semester, totalRequiredHours'
      );
    }

    // Validate that subject exists
    const subject = await Subject.findById(subjectId).lean();
    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }

    // Validate hours breakdown
    if (theoryHours + labHours > totalRequiredHours) {
      throw ApiError.badRequest(
        'Theory hours + Lab hours cannot exceed total required hours'
      );
    }

    // Check if syllabus already exists
    const existingSyllabus = await SubjectSyllabus.findOne({
      subject: subjectId,
      academicYear,
      semester,
    }).lean();

    if (existingSyllabus) {
      throw ApiError.badRequest(
        'Syllabus already exists for this subject, academic year, and semester. Use update endpoint to modify.'
      );
    }

    // Create syllabus
    const syllabus = new SubjectSyllabus({
      subject: subjectId,
      academicYear,
      semester,
      totalRequiredHours,
      theoryHours: theoryHours || 0,
      labHours: labHours || 0,
      units: units || [],
      midtermWeight: midtermWeight || 30,
      endsemWeight: endsemWeight || 50,
      assignmentWeight: assignmentWeight || 20,
      createdBy,
    });

    await syllabus.save();

    return SubjectSyllabus.findById(syllabus._id)
      .populate('subject', 'name code')
      .populate('createdBy', 'firstName lastName')
      .lean();
  },

  async getBySubject(subjectId, query) {
    const { academicYear, semester } = query;

    // Build query
    const findQuery = { subject: subjectId };
    if (academicYear) findQuery.academicYear = academicYear;
    if (semester) findQuery.semester = parseInt(semester);

    const syllabi = await SubjectSyllabus.find(findQuery)
      .populate('subject', 'name code lectures_per_week')
      .populate('createdBy', 'firstName lastName')
      .sort({ academicYear: -1, semester: -1 })
      .lean();

    if (syllabi.length === 0) {
      throw ApiError.notFound('No syllabus found for this subject');
    }

    // If specific year and semester requested, return single syllabus
    if (academicYear && semester) {
      return { syllabus: syllabi[0] };
    }

    // Otherwise return all syllabi
    return { syllabi };
  },

  async update(id, updates) {
    // Validate hours if being updated
    if (updates.theoryHours !== undefined || updates.labHours !== undefined) {
      const syllabus = await SubjectSyllabus.findById(id).lean();
      if (!syllabus) {
        throw ApiError.notFound('Syllabus not found');
      }

      const theoryHours = updates.theoryHours !== undefined ? updates.theoryHours : syllabus.theoryHours;
      const labHours = updates.labHours !== undefined ? updates.labHours : syllabus.labHours;
      const totalHours = updates.totalRequiredHours !== undefined ? updates.totalRequiredHours : syllabus.totalRequiredHours;

      if (theoryHours + labHours > totalHours) {
        throw ApiError.badRequest(
          'Theory hours + Lab hours cannot exceed total required hours'
        );
      }
    }

    // Update syllabus
    const updatedSyllabus = await SubjectSyllabus.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('subject', 'name code')
      .populate('createdBy', 'firstName lastName')
      .lean();

    if (!updatedSyllabus) {
      throw ApiError.notFound('Syllabus not found');
    }

    return updatedSyllabus;
  },

  async getByYear(academicYear, query) {
    const { semester } = query;

    const findQuery = { academicYear };
    if (semester) findQuery.semester = parseInt(semester);

    const syllabi = await SubjectSyllabus.find(findQuery)
      .populate('subject', 'name code lectures_per_week')
      .populate('createdBy', 'firstName lastName')
      .sort({ semester: 1, 'subject.name': 1 })
      .lean();

    return {
      academicYear,
      semester: semester || 'all',
      totalSyllabi: syllabi.length,
      syllabi,
    };
  },

  async remove(id) {
    const syllabus = await SubjectSyllabus.findByIdAndDelete(id);

    if (!syllabus) {
      throw ApiError.notFound('Syllabus not found');
    }

    return syllabus;
  },

  async addUnit(id, body) {
    const { unitNumber, unitName, topics } = body;

    if (!unitNumber || !unitName) {
      throw ApiError.badRequest('Missing required fields: unitNumber, unitName');
    }

    const syllabus = await SubjectSyllabus.findById(id);
    if (!syllabus) {
      throw ApiError.notFound('Syllabus not found');
    }

    // Check if unit already exists
    const existingUnit = syllabus.units.find((u) => u.unitNumber === unitNumber);
    if (existingUnit) {
      throw ApiError.badRequest(`Unit ${unitNumber} already exists`);
    }

    syllabus.units.push({
      unitNumber,
      unitName,
      topics: topics || [],
    });

    await syllabus.save();

    return syllabus;
  },

  async updateUnit(id, unitNumber, updates) {
    const syllabus = await SubjectSyllabus.findById(id);
    if (!syllabus) {
      throw ApiError.notFound('Syllabus not found');
    }

    const unitIndex = syllabus.units.findIndex((u) => u.unitNumber === parseInt(unitNumber));
    if (unitIndex === -1) {
      throw ApiError.notFound('Unit not found');
    }

    // Update unit fields
    if (updates.unitName) syllabus.units[unitIndex].unitName = updates.unitName;
    if (updates.topics) syllabus.units[unitIndex].topics = updates.topics;

    await syllabus.save();

    return syllabus.units[unitIndex];
  },

  async removeUnit(id, unitNumber) {
    const syllabus = await SubjectSyllabus.findById(id);
    if (!syllabus) {
      throw ApiError.notFound('Syllabus not found');
    }

    const unitIndex = syllabus.units.findIndex((u) => u.unitNumber === parseInt(unitNumber));
    if (unitIndex === -1) {
      throw ApiError.notFound('Unit not found');
    }

    syllabus.units.splice(unitIndex, 1);
    await syllabus.save();

    return syllabus;
  },
};

module.exports = syllabusService;
