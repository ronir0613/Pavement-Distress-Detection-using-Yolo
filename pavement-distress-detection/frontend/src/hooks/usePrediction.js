import { useState } from 'react'
import client from '../api/client'

export function usePrediction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function runPrediction(file, modelName, confidenceThreshold) {
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('model_name', modelName)
      form.append('confidence_threshold', confidenceThreshold)

      const { data } = await client.post('/predict', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      return data
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Prediction failed.'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  function clearResult() {
    setResult(null)
    setError(null)
  }

  return { loading, error, result, runPrediction, clearResult }
}
