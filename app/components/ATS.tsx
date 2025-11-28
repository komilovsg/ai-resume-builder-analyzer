import React from 'react'
import { useTranslation } from 'react-i18next'

interface AtsSuggestion {
    type: 'good' | 'improve'
    tip: string
}

interface AtsProps {
    score: number
    suggestions: AtsSuggestion[]
}

export default function ATS({ score, suggestions }: AtsProps) {
    const { t } = useTranslation();
    const isStrong = score > 69
    const isGoodStart = !isStrong && score > 49

    const gradientClass = isStrong
        ? 'from-green-100'
        : isGoodStart
            ? 'from-yellow-100'
            : 'from-red-100'

    const iconSrc = isStrong
        ? '/icons/ats-good.svg'
        : isGoodStart
            ? '/icons/ats-warning.svg'
            : '/icons/ats-bad.svg'

    const headlineColor = isStrong
        ? 'text-green-700'
        : isGoodStart
            ? 'text-yellow-700'
            : 'text-red-700'

    return (
        <div className={`w-full rounded-2xl shadow-md bg-gradient-to-br ${gradientClass} to-white p-6 animate-in fade-in duration-700`}> 
            <div className="flex items-center gap-3">
                <img src={iconSrc} alt="ATS status" className="w-8 h-8" />
                <h3 className={`text-xl font-semibold ${headlineColor}`}>{t('resumeReview.ats.score')} - {score}/100</h3>
            </div>

            <div className="mt-4 space-y-2">
                <h4 className="text-lg font-medium">{t('resumeReview.ats.title')}</h4>
                <p className="text-sm text-gray-600">
                    {t('resumeReview.ats.description')}
                </p>
            </div>

            <ul className="mt-4 space-y-3">
                {suggestions.map((suggestion, index) => {
                    const suggestionIcon = suggestion.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'
                    const suggestionColor = suggestion.type === 'good' ? 'text-green-700' : 'text-yellow-700'
                    return (
                        <li key={`${suggestion.type}-${index}`} className="flex items-start gap-3">
                            <img src={suggestionIcon} alt={suggestion.type} className="w-5 h-5 mt-0.5" />
                            <p className={`text-sm ${suggestionColor}`}>{suggestion.tip}</p>
                        </li>
                    )
                })}
            </ul>

            <p className="mt-5 text-sm text-gray-600">
                {t('resumeReview.ats.footer')}
            </p>
        </div>
    )
}
