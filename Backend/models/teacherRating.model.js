const mongoose = require('mongoose');

const teacherRatingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  
  // Overall rating (1-5 stars)
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Category-wise ratings (optional)
  categories: {
    clarity: { 
      type: Number, 
      min: 1, 
      max: 5,
      default: null
    },
    punctuality: { 
      type: Number, 
      min: 1, 
      max: 5,
      default: null
    },
    engagement: { 
      type: Number, 
      min: 1, 
      max: 5,
      default: null
    },
    knowledge: { 
      type: Number, 
      min: 1, 
      max: 5,
      default: null
    },
    accessibility: { 
      type: Number, 
      min: 1, 
      max: 5,
      default: null
    }
  },
  
  // Text feedback (optional)
  feedback: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Anonymous submission flag
  isAnonymous: {
    type: Boolean,
    default: true
  },
  
  // Academic period
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for faster queries
teacherRatingSchema.index({ teacher: 1, academicYear: 1, semester: 1 });
teacherRatingSchema.index({ teacher: 1, subject: 1 });
teacherRatingSchema.index({ student: 1 });

// Compound unique index - one rating per student per teacher per subject per academic period
teacherRatingSchema.index(
  { student: 1, teacher: 1, subject: 1, academicYear: 1, semester: 1 }, 
  { unique: true }
);

// Pre-save middleware to update timestamps
teacherRatingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods for aggregate calculations
teacherRatingSchema.statics.calculateAggregateRating = async function(teacherId, subjectId = null, academicYear = null) {
  const query = { teacher: teacherId };
  if (subjectId) query.subject = subjectId;
  if (academicYear) query.academicYear = academicYear;
  
  const ratings = await this.find(query);
  
  if (ratings.length === 0) {
    return {
      overallAverage: 0,
      categoryAverages: {
        clarity: 0,
        punctuality: 0,
        engagement: 0,
        knowledge: 0,
        accessibility: 0
      },
      totalRatings: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
  
  // Calculate overall average
  const overallSum = ratings.reduce((sum, r) => sum + r.overallRating, 0);
  const overallAverage = overallSum / ratings.length;
  
  // Calculate category averages
  const categoryAverages = {};
  ['clarity', 'punctuality', 'engagement', 'knowledge', 'accessibility'].forEach(category => {
    const categoryRatings = ratings
      .filter(r => r.categories[category] != null)
      .map(r => r.categories[category]);
    
    if (categoryRatings.length > 0) {
      const sum = categoryRatings.reduce((a, b) => a + b, 0);
      categoryAverages[category] = sum / categoryRatings.length;
    } else {
      categoryAverages[category] = 0;
    }
  });
  
  // Calculate distribution
  const distribution = {
    5: ratings.filter(r => r.overallRating === 5).length,
    4: ratings.filter(r => r.overallRating === 4).length,
    3: ratings.filter(r => r.overallRating === 3).length,
    2: ratings.filter(r => r.overallRating === 2).length,
    1: ratings.filter(r => r.overallRating === 1).length
  };
  
  return {
    overallAverage: parseFloat(overallAverage.toFixed(2)),
    categoryAverages: Object.fromEntries(
      Object.entries(categoryAverages).map(([k, v]) => [k, parseFloat(v.toFixed(2))])
    ),
    totalRatings: ratings.length,
    distribution
  };
};

// Method to get trend data (by semester)
teacherRatingSchema.statics.getTrendData = async function(teacherId, limit = 6) {
  const ratings = await this.find({ teacher: teacherId })
    .sort({ academicYear: -1, semester: -1 });
  
  // Group by academic year and semester
  const grouped = {};
  ratings.forEach(rating => {
    const key = `${rating.academicYear}-S${rating.semester}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(rating);
  });
  
  // Calculate average for each period
  const trendData = Object.entries(grouped)
    .map(([period, periodRatings]) => {
      const sum = periodRatings.reduce((acc, r) => acc + r.overallRating, 0);
      return {
        period,
        averageRating: parseFloat((sum / periodRatings.length).toFixed(2)),
        totalRatings: periodRatings.length
      };
    })
    .slice(0, limit)
    .reverse(); // Show oldest to newest
  
  return trendData;
};

module.exports = mongoose.model('TeacherRating', teacherRatingSchema);
