import { getAllLikertQuestions, likertScale, staticQuestionnaire } from './questionnaire'

function emptyDistribution() {
  return Object.fromEntries(likertScale.map((item) => [item.value, 0]))
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function computeCampaignAnalytics(campaignId, responses) {
  const relevantResponses = responses.filter((response) => response.campaignId === campaignId)
  const allQuestions = getAllLikertQuestions()

  const questionStats = allQuestions.map((question) => {
    const distribution = emptyDistribution()
    let total = 0
    let weighted = 0

    for (const response of relevantResponses) {
      const score = response.likertAnswers[question.id]
      if (!score) {
        continue
      }
      distribution[score] += 1
      total += 1
      weighted += score
    }

    return {
      questionId: question.id,
      question: question.text,
      total,
      average: total === 0 ? 0 : Number((weighted / total).toFixed(2)),
      distribution,
    }
  })

  const byAxis = staticQuestionnaire.axes.map((axe) => {
    const axisQuestions = questionStats.filter((stat) =>
      axe.questions.some((question) => question.id === stat.questionId),
    )
    const weighted = axisQuestions.reduce((sum, item) => sum + item.average, 0)
    const average = axisQuestions.length === 0 ? 0 : Number((weighted / axisQuestions.length).toFixed(2))
    return {
      axeId: axe.id,
      title: axe.title,
      average,
      questionStats: axisQuestions,
    }
  })

  return {
    totalResponses: relevantResponses.length,
    byAxis,
    openAnswers: relevantResponses.map((response) => ({
      id: response.id,
      employeeName: response.employeeName,
      submittedAt: response.submittedAt,
      strengths: response.openAnswers.strengths,
      priorities: response.openAnswers.priorities,
      suggestions: response.openAnswers.suggestions,
    })),
  }
}
