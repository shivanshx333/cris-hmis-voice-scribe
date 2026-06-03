/**
 * DictationHub.jsx
 * ================
 * Voice dictation + live transcript + processing trigger.
 *
 * Uses the browser's Web Speech API for real-time transcription.
 * Falls back to manual typing if the API is unavailable.
 */

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Wand2, AlertCircle, Loader2 } from 'lucide-react'
import { mockExtract } from './mockExtract.js'

export default function DictationHub({ transcript, setTranscript, onExtracted }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('Tap to Dictate')
  const [speechSupported, setSpeechSupported] = useState(true)
  const recognitionRef = useRef(null)
  const finalTextRef = useRef('')

  // ----------------------------------------------------------------------
  // Initialize Web Speech API
  // ----------------------------------------------------------------------
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setSpeechSupported(false)
      return
    }

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t + ' '
        else interim += t
      }
      finalTextRef.current = final
      setTranscript(final + interim)
    }

    recognition.onend = () => {
      // Auto-restart while user wants to keep recording
      if (recognitionRef.current?._wantsToRun) {
        try { recognition.start() } catch (e) {}
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setSpeechSupported(false)
        stopRecording()
      }
    }

    recognitionRef.current = recognition
    return () => {
      try { recognition.stop() } catch (e) {}
    }
  }, [])

  // ----------------------------------------------------------------------
  // Recording control
  // ----------------------------------------------------------------------
  const startRecording = () => {
    if (!recognitionRef.current) return
    finalTextRef.current = transcript
    recognitionRef.current._wantsToRun = true
    try { recognitionRef.current.start() } catch (e) {}
    setIsRecording(true)
    setStatus('Listening...')
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current._wantsToRun = false
      try { recognitionRef.current.stop() } catch (e) {}
    }
    setIsRecording(false)
    setStatus('Tap to Dictate')
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else if (speechSupported) {
      startRecording()
    }
  }

  // ----------------------------------------------------------------------
  // Process transcript through backend (with mock fallback)
  // ----------------------------------------------------------------------
  const processTranscript = async () => {
    const text = transcript.trim()
    if (!text) return

    if (isRecording) stopRecording()
    setIsProcessing(true)
    setStatus('Processing...')

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      if (!response.ok) throw new Error('backend failed')
      const data = await response.json()
      onExtracted(data)
    } catch (e) {
      // Fallback: offline mock extraction
      const mockData = await mockExtract(text)
      onExtracted(mockData)
    } finally {
      setIsProcessing(false)
      setStatus('Tap to Dictate')
    }
  }

  return (
    <div className="space-y-4">
      {/* Mic Button */}
      <div className="flex flex-col items-center py-3">
        <button
          onClick={toggleRecording}
          disabled={!speechSupported}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${isRecording
              ? 'bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-300 animate-pulse'
              : 'bg-navy hover:bg-navy-dark'}
            ${!speechSupported ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isRecording ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </button>
        <div className="mt-3 text-sm font-medium text-slate-700">
          {isProcessing ? (
            <span className="flex items-center gap-1.5 text-amber-700">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </span>
          ) : (
            status
          )}
        </div>
      </div>

      {/* Speech API unavailable banner */}
      {!speechSupported && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Speech API unavailable — type in the transcript box below to simulate dictation.
          </span>
        </div>
      )}

      {/* Transcript textarea */}
      <div>
        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-600 block mb-1.5">
          Live Transcript
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Patient presenting with fever and cough for 3 days, diagnosed with viral URI, prescribed paracetamol 500mg BD for 5 days..."
          className="w-full min-h-[140px] p-3 bg-slate-50 border border-slate-300 rounded-md text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-y"
        />
      </div>

      {/* Process button */}
      <button
        onClick={processTranscript}
        disabled={!transcript.trim() || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-navy hover:bg-navy-dark text-white text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        Process Transcript
      </button>
    </div>
  )
}
