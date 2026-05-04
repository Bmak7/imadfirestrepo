import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getCampaignById, listChefAccounts, submitSurveyResponse } from '../lib/db'
import {
  getAllLikertQuestions,
  likertScale,
  openQuestions,
  seniorityOptions,
  staticQuestionnaire,
} from '../lib/questionnaire'

const questionLookup = getAllLikertQuestions()

function QuestionProgress({ answeredCount, totalCount }) {
  const percentage = totalCount === 0 ? 0 : Math.round((answeredCount / totalCount) * 100)
  return (
    <div className="surface-soft p-4">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-slate-700">Progression du questionnaire</p>
        <span className="font-semibold text-slate-800">
          {answeredCount}/{totalCount}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function EmployeePollPage() {
  const { campaignId } = useParams()
  const [searchParams] = useSearchParams()
  const requestedChefId = searchParams.get('chefId')

  const [campaign, setCampaign] = useState(null)
  const [chefs, setChefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [employeeName, setEmployeeName] = useState('')
  const [generalData, setGeneralData] = useState({
    chantier: '',
    poste: '',
    seniority: '',
  })
  const [selectedChefId, setSelectedChefId] = useState('')
  const [likertAnswers, setLikertAnswers] = useState({})
  const [openAnswers, setOpenAnswers] = useState({
    strengths: '',
    priorities: '',
    suggestions: '',
  })

  useEffect(() => {
    let active = true
    Promise.all([getCampaignById(campaignId), listChefAccounts()]).then(
      ([loadedCampaign, loadedChefs]) => {
        if (!active) {
          return
        }
        setCampaign(loadedCampaign)
        setChefs(loadedChefs)
        setLoading(false)
      },
    )
    return () => {
      active = false
    }
  }, [campaignId])

  const availableChefs = useMemo(() => {
    if (!campaign) {
      return []
    }
    if (campaign.isAssignedToAll) {
      return chefs
    }
    return chefs.filter((chef) => campaign.assignedChefIds.includes(chef.id))
  }, [campaign, chefs])

  const forcedChefId =
    requestedChefId && availableChefs.some((chef) => chef.id === requestedChefId)
      ? requestedChefId
      : ''

  const effectiveChefId =
    forcedChefId || selectedChefId || (availableChefs.length === 1 ? availableChefs[0].id : '')

  const answeredCount = Object.keys(likertAnswers).length
  const totalQuestionCount = questionLookup.length

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!campaign) {
      setErrorMessage('Campagne introuvable.')
      return
    }
    if (!employeeName.trim()) {
      setErrorMessage("Le nom de l'employe est obligatoire.")
      return
    }
    if (!generalData.chantier.trim() || !generalData.poste.trim() || !generalData.seniority) {
      setErrorMessage('Les donnees generales sont obligatoires.')
      return
    }
    if (!effectiveChefId) {
      setErrorMessage('Veuillez selectionner votre Chef de Service.')
      return
    }
    const unansweredQuestion = questionLookup.find((question) => !likertAnswers[question.id])
    if (unansweredQuestion) {
      setErrorMessage('Veuillez repondre a toutes les affirmations.')
      return
    }

    setSubmitting(true)
    try {
      await submitSurveyResponse({
        campaignId: campaign.id,
        chefId: effectiveChefId,
        employeeName,
        generalData,
        likertAnswers,
        openAnswers,
      })
      setSuccessMessage('Merci. Votre questionnaire a ete enregistre localement.')
      setEmployeeName('')
      setGeneralData({ chantier: '', poste: '', seniority: '' })
      setLikertAnswers({})
      setOpenAnswers({ strengths: '', priorities: '', suggestions: '' })
      if (!forcedChefId) {
        setSelectedChefId(availableChefs.length === 1 ? availableChefs[0].id : '')
      }
    } catch (submitError) {
      setErrorMessage(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Chargement du questionnaire...</p>
  }

  if (!campaign) {
    return (
      <section className="surface-card p-6">
        <h1 className="text-xl font-semibold text-slate-900">Campagne introuvable</h1>
        <p className="mt-2 text-sm text-slate-600">Le lien QR utilise est invalide.</p>
        <Link to="/" className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:underline">
          Retour a l accueil
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <header className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Questionnaire anonyme</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{campaign.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{staticQuestionnaire.intro}</p>
      </header>

      <QuestionProgress answeredCount={answeredCount} totalCount={totalQuestionCount} />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <section className="surface-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            I. Donnees generales (statistiques uniquement)
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              className={`input-enterprise ${errorMessage && !employeeName.trim() ? 'input-error' : ''}`}
              placeholder="Nom employe"
              aria-label="Nom employe"
            />
            <input
              value={generalData.chantier}
              onChange={(event) =>
                setGeneralData((prev) => ({ ...prev, chantier: event.target.value }))
              }
              className={`input-enterprise ${errorMessage && !generalData.chantier.trim() ? 'input-error' : ''}`}
              placeholder="Chantier"
              aria-label="Chantier"
            />
            <input
              value={generalData.poste}
              onChange={(event) =>
                setGeneralData((prev) => ({ ...prev, poste: event.target.value }))
              }
              className={`input-enterprise ${errorMessage && !generalData.poste.trim() ? 'input-error' : ''}`}
              placeholder="Poste occupe"
              aria-label="Poste occupe"
            />
            <select
              value={generalData.seniority}
              onChange={(event) =>
                setGeneralData((prev) => ({ ...prev, seniority: event.target.value }))
              }
              className={`select-enterprise ${errorMessage && !generalData.seniority ? 'input-error' : ''}`}
              aria-label="Anciennete professionnelle"
            >
              <option value="">Anciennete professionnelle</option>
              {seniorityOptions.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="mt-4 block text-sm text-slate-700">
            <span className="mb-1 block font-medium">Chef de Service</span>
            <select
              disabled={Boolean(forcedChefId)}
              value={effectiveChefId}
              onChange={(event) => setSelectedChefId(event.target.value)}
              className={`select-enterprise ${errorMessage && !effectiveChefId ? 'input-error' : ''}`}
              aria-label="Chef de service"
            >
              <option value="">Selectionner...</option>
              {availableChefs.map((chef) => (
                <option key={chef.id} value={chef.id}>
                  {chef.name} ({chef.department})
                </option>
              ))}
            </select>
          </label>
        </section>

        {staticQuestionnaire.axes.map((axe) => (
          <section key={axe.id} className="surface-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">{axe.title}</h2>
            <div className="mt-4 space-y-4">
              {axe.questions.map((question) => (
                <fieldset key={question.id} className="surface-soft p-4">
                  <legend className="text-sm font-medium text-slate-800">{question.text}</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    {likertScale.map((scale) => (
                      <label
                        key={scale.value}
                        className="interactive flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={scale.value}
                          checked={likertAnswers[question.id] === scale.value}
                          onChange={() =>
                            setLikertAnswers((prev) => ({
                              ...prev,
                              [question.id]: scale.value,
                            }))
                          }
                        />
                        <span>{scale.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        ))}

        <section className="surface-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Questions ouvertes</h2>
          <div className="mt-4 space-y-3">
            {openQuestions.map((question) => (
              <label key={question.id} className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium">{question.label}</span>
                <textarea
                  value={openAnswers[question.id]}
                  onChange={(event) =>
                    setOpenAnswers((prev) => ({
                      ...prev,
                      [question.id]: event.target.value,
                    }))
                  }
                  className="textarea-enterprise"
                  aria-label={question.label}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={submitting} className="btn-primary interactive px-5 py-2 text-sm">
              {submitting ? 'Soumission...' : 'Envoyer le questionnaire'}
            </button>
            <p className="hint">Toutes les reponses sont anonymes et confidentielles.</p>
          </div>

          {successMessage && (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          )}
        </section>
      </form>
    </section>
  )
}
