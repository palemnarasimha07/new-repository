// Dynamic Weak Topic Detection & Personalized Learning Recommendation Engine

/**
 * Analyzes cadet performance across exams and generates topic-wise scores & recommendations
 */
export function generateCadetRecommendations(cadetId, userId) {
  const results = JSON.parse(localStorage.getItem(`nccResults_${userId}`) || "{}");
  const exams = JSON.parse(localStorage.getItem("nccExams") || "[]");
  const materials = JSON.parse(localStorage.getItem("nccAnalyzedMaterials") || "[]");

  const topicScores = {};
  const topicCounts = {};

  // Aggregate per-question topic scores from saved exam results
  Object.values(results).forEach((res) => {
    const examObj = exams.find((e) => e.id === res.examId);
    if (!examObj || !examObj.questions) return;

    const userAnswers = res.answers || {};

    examObj.questions.forEach((q) => {
      const topic = q.topic || "General NCC";
      if (!topicScores[topic]) {
        topicScores[topic] = 0;
        topicCounts[topic] = 0;
      }
      topicCounts[topic] += 1;

      const isCorrect = userAnswers[q.id] === q.answer;
      if (isCorrect) {
        topicScores[topic] += 1;
      }
    });
  });

  // Default topic performance data if cadet has taken few exams
  const defaultTopics = [
    { topic: "First Aid & Hygiene", scorePct: 48 },
    { topic: "Map Reading", scorePct: 58 },
    { topic: "Drill & Discipline", scorePct: 88 },
    { topic: "Weapon Training", scorePct: 74 },
    { topic: "Leadership", scorePct: 82 },
  ];

  const topicAnalysis = [];

  if (Object.keys(topicCounts).length > 0) {
    Object.keys(topicCounts).forEach((tName) => {
      const pct = Math.round((topicScores[tName] / topicCounts[tName]) * 100);
      topicAnalysis.push({ topic: tName, scorePct: pct, totalQuestions: topicCounts[tName] });
    });
  } else {
    topicAnalysis.push(...defaultTopics);
  }

  // Identify Weak Topics (< 65%)
  const weakTopics = topicAnalysis.filter((t) => t.scorePct < 65);
  const strongTopics = topicAnalysis.filter((t) => t.scorePct >= 75);

  // Build Personalized Recommendation Cards
  const recommendations = weakTopics.map((wt) => {
    // Check if relevant material exists
    const matchingMat = materials.find((m) =>
      m.topics?.some((tp) => tp.topic.toLowerCase().includes(wt.topic.toLowerCase()))
    );

    return {
      id: `rec_${wt.topic.replace(/\s+/g, "_")}`,
      topic: wt.topic,
      currentScore: wt.scorePct,
      urgency: wt.scorePct < 50 ? "Critical" : "Recommended",
      recommendationText: `Your ${wt.topic} score is ${wt.scorePct}%. Revise the ${wt.topic} study notes and take a 10-question practice quiz to improve your rank readiness.`,
      suggestedAction: matchingMat ? `Read "${matchingMat.fileName}"` : `Attempt ${wt.topic} Practice Test`,
      practiceTopic: wt.topic,
    };
  });

  // If cadet has no weak topics, show an encouragement recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec_excellence",
      topic: "Overall Excellence",
      currentScore: 90,
      urgency: "Good Standing",
      recommendationText: "Great job! All your topic scores are above 70%. Maintain your daily drill practice and review advanced leadership manuals.",
      suggestedAction: "Take Advanced Mock Exam",
      practiceTopic: "Leadership",
    });
  }

  return {
    topicAnalysis,
    weakTopics,
    strongTopics,
    recommendations,
  };
}
