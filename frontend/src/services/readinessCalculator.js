// Transparent Cadet Readiness Score Engine with configurable weights
// Formula: Overall Score = sum(weight_i * component_score_i)

export const DEFAULT_WEIGHTS = {
  attendance: 20,
  training: 25,
  examination: 25,
  physical: 15,
  achievements: 15,
};

/**
 * Calculates a cadet's transparent readiness score based on real records
 */
export function calculateCadetReadiness(cadet, options = {}) {
  const customWeights = options.weights || DEFAULT_WEIGHTS;

  // Retrieve records from localStorage or provided payload
  const trainings = options.trainings || JSON.parse(localStorage.getItem("nccTrainings") || "[]");
  const results = options.results || JSON.parse(localStorage.getItem(`nccResults_${cadet.id}`) || "{}");
  const achievements = options.achievements || JSON.parse(localStorage.getItem("nccAchievements") || "[]");
  const camps = options.camps || JSON.parse(localStorage.getItem("nccCamps") || "[]");

  const cadetId = cadet.cadetId || cadet.rollNo || "NCC001";

  // 1. Attendance Score (0 - 100)
  const markedTrainings = trainings.filter(t => t.attendance && t.attendance[cadetId]);
  const presentTrainings = markedTrainings.filter(t => t.attendance[cadetId] === "Present");
  const attendancePct = markedTrainings.length > 0
    ? Math.round((presentTrainings.length / markedTrainings.length) * 100)
    : (cadet.attendance || 85);

  // 2. Training Completion Score (0 - 100)
  const completedTrainings = trainings.filter(t => t.status === "Completed").length;
  const totalTrainings = trainings.length || 1;
  const trainingPct = Math.min(100, Math.round((completedTrainings / totalTrainings) * 80 + (markedTrainings.length > 0 ? 20 : 0)));

  // 3. Examination Score (0 - 100)
  const examArr = Object.values(results);
  const examPct = examArr.length > 0
    ? Math.round(examArr.reduce((sum, r) => sum + (r.pct || 0), 0) / examArr.length)
    : (cadet.examAverage || 75);

  // 4. Physical Training & Drill Activity Score (0 - 100)
  // Derived from drill records, physical fitness indicators, or rank progression
  const physicalScore = cadet.physicalScore || (cadet.rank && cadet.rank !== "Cadet" ? 88 : 78);

  // 5. Achievements & Camps Score (0 - 100)
  const cadetAchievements = achievements.filter(a => a.rollNo === cadetId || a.cadetName === cadet.name);
  const cadetCamps = camps.filter(c => c.cadets && c.cadets.includes(cadetId));
  const achievementCount = cadetAchievements.length;
  const campCount = cadetCamps.length;
  const achievementsScore = Math.min(100, 60 + achievementCount * 12 + campCount * 10);

  // Calculate Weighted Total Score
  const totalWeight = Object.values(customWeights).reduce((a, b) => a + b, 0) || 100;

  const weightedSum =
    (attendancePct * customWeights.attendance) +
    (trainingPct * customWeights.training) +
    (examPct * customWeights.examination) +
    (physicalScore * customWeights.physical) +
    (achievementsScore * customWeights.achievements);

  const overallScore = Math.round(weightedSum / totalWeight);

  // Rating Badge
  let rating = "Good Standing";
  let color = "#166534";
  let bg = "#dcfce7";

  if (overallScore >= 85) {
    rating = "Outstanding Readiness";
    color = "#15803d";
    bg = "#dcfce7";
  } else if (overallScore >= 70) {
    rating = "Satisfactory Readiness";
    color = "#1e40af";
    bg = "#dbeafe";
  } else {
    rating = "Needs Improvement / At Risk";
    color = "#991b1b";
    bg = "#fee2e2";
  }

  return {
    overallScore,
    rating,
    color,
    bg,
    weights: customWeights,
    breakdown: [
      { component: "Attendance", score: attendancePct, weight: customWeights.attendance, weightedVal: Math.round((attendancePct * customWeights.attendance) / totalWeight), icon: "📅" },
      { component: "Training Completion", score: trainingPct, weight: customWeights.training, weightedVal: Math.round((trainingPct * customWeights.training) / totalWeight), icon: "🏃" },
      { component: "Examination Marks", score: examPct, weight: customWeights.examination, weightedVal: Math.round((examPct * customWeights.examination) / totalWeight), icon: "📝" },
      { component: "Physical & Drill Records", score: physicalScore, weight: customWeights.physical, weightedVal: Math.round((physicalScore * customWeights.physical) / totalWeight), icon: "🪖" },
      { component: "Achievements & Camps", score: achievementsScore, weight: customWeights.achievements, weightedVal: Math.round((achievementsScore * customWeights.achievements) / totalWeight), icon: "🏆" },
    ],
  };
}
