import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [responseText, setResponseText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchTestApi = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/test')

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const text = await response.text()
      setResponseText(text)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setErrorMessage(message)
      setResponseText('')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchTestApi()
  }, [])

  return (
    <div className="page">
      <header className="page-header">
        <h1>API Test</h1>
        <p>GET /api/test</p>
      </header>
      <div className="controls">
        <button type="button" onClick={fetchTestApi} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
        {errorMessage ? <span className="error">{errorMessage}</span> : null}
      </div>
      <label className="textbox-label" htmlFor="api-response">
        Response
      </label>
      <textarea
        id="api-response"
        className="textbox"
        value={responseText}
        readOnly
        rows={10}
        placeholder={isLoading ? 'Loading response...' : 'No response yet.'}
      />
    </div>
  )
}

export default App
