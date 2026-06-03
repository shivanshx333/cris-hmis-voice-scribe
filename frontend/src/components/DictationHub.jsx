/**
 * DictationHub.jsx
 * ================
 * Voice dictation hub:
 *  - Web Speech API for real-time transcription
 *  - Live audio level visualization while recording
 *  - Quick prescription template buttons for demos
 *  - Process Transcript runs the in-browser regex extractor
 */

import { useState, useEffect, useRef } from 'react'
import {
  Mic, MicOff, Wand2, AlertCircle, Loader2, FileText,
  Thermometer, Activity, Droplets,
} from 'lucide-react'
import { extract } from './extractor.js'

// --------------------------------------------------------------------------
// Sample templates — for demo / quick fill (subtle, hidden behind icons)
// --------------------------------------------------------------------------
const TEMPLATES = [
  {
    id: 'fever',
    icon: Thermometer,
    label: 'Fever / Cold',
    text: 'Patient presenting with fever and cough for 3 days, body ache and runny nose. Diagnosed with viral upper respiratory infection. Prescribed Paracetamol 500mg 1-0-1 for 5 days and Cetirizine 10mg 0-0-1 for 5 days. Advised CBC and rest.',
  },
  {
    id: 'bp',
    icon: Activity,
    label: 'Hypertension',
    text: 'Patient presenting with headache and dizziness, c/o elevated blood pressure. Diagnosed with Stage 1 Hypertension. Prescribed Amlodipine 5mg 1-0-0 for 30 days and Telmisartan 40mg 0-0-1 for 30 days. Advised ECG, Lipid Profile, KFT and follow-up in 4 weeks.',
  },
  {
    id: 'diabetes',
    icon: Droplets,
    label: 'Diabetes',
    text: 'Patient presenting with increased thirst, frequent urination and fatigue. Diagnosed with Type 2 Diabetes Mellitus. Prescribed Metformin 500mg 1-0-1 for 30 days. Advised HbA1c, FBS, PPBS, KFT and dietary counseling.',
  },
]

export default function DictationHub({ transcript, setTranscript, onExtracted, recordTrigger }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('Tap to Dictate')
  const [speechSupported, setSpeechSupported] = useState(true)
  const [audioLevels, setAudioLevels] = useState([0, 0, 0, 0, 0, 0, 0, 0])

  const recognitionRef = useRef(null)
  const finalTextRef = useRef('')
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const animationFrameRef = useRef(null)

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
      stopAudioAnalyzer()
    }
  }, [])

  // External trigger (e.g., Space keyboard shortcut)
  useEffect(() => {
    if (recordTrigger === undefined) return
    toggleRecording()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordTrigger])

  // ----------------------------------------------------------------------
  // Audio-level visualization
  // ----------------------------------------------------------------------
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      audioContextRef.current = audioCtx
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        // Sample 8 evenly-spaced bins for the bar visualization
        const bars = []
        const step = Math.floor(data.length / 8)
        for (let i = 0; i < 8; i++) {
          bars.push(Math.min(100, (data[i * step] / 255) * 100))
        }
        setAudioLevels(bars)
        animationFrameRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (e) {
      // Mic blocked — silently skip waveform; speech recognition will still work
    }
  }

  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop())
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {})
    mediaStreamRef.current = null
    audioContextRef.current = null
    analyserRef.current = null
    setAudioLevels([0, 0, 0, 0, 0, 0, 0, 0])
  }

  // ----------------------------------------------------------------------
  // Recording control
  // ----------------------------------------------------------------------
  const startRecording = () => {
    if (!recognitionRef.current) return
    finalTextRef.current = transcript
    recognitionRef.current._wantsToRun = true
    try { recognitionRef.current.start() } catch (e) {}
    startAudioAnalyzer()
    setIsRecording(true)
    setStatus('Listening...')
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current._wantsToRun = false
      try { recognitionRef.current.stop() } catch (e) {}
    }
    stopAudioAnalyzer()
    setIsRecording(false)
    setStatus('Tap to Dictate')
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else if (speechSupported) startRecording()
  }

  // ----------------------------------------------------------------------
  // Process transcript through the in-browser extractor
  // ----------------------------------------------------------------------
  const processTranscript = async () => {
    const text = transcript.trim()
    if (!text) return
    if (isRecording) stopRecording()
    setIsProcessing(true)
    setStatus('Processing...')
    await new Promise((r) => setTimeout(r, 350))
    onExtracted(extract(text))
    setIsProcessing(false)
    setStatus('Tap to Dictate')
  }

  const loadTemplate = (text) => {
    setTranscript(text)
    finalTextRef.current = text
  }

  return (
    <div className="space-y-4">
      {/* Mic Button + audio bars */}
      <div className="flex flex-col items-center py-2">
        <div className="relative flex items-center gap-3">
          <button
            onClick={toggleRecording}
            disabled={!speechSupported}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all
              ${isRecording
                ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-200'
                : 'bg-navy hover:bg-navy-dark hover:scale-105 shadow-md'}
              ${!speechSupported ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isRecording ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
            {isRecording && (
              <span className="absolute inset-0 rounded-full animate-ping bg-rose-400 opacity-30" />
            )}
          </button>

          {/* Audio level bars */}
          {isRecording && (
            <div className="flex items-end gap-1 h-12">
              {audioLevels.map((level, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-rose-500 to-rose-300 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(8, level * 0.4)}px` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 text-sm font-medium text-slate-700">
          {isProcessing ? (
            <span className="flex items-center gap-1.5 text-amber-700">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </span>
          ) : (
            <span className={isRecording ? 'text-rose-700' : ''}>{status}</span>
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

      {/* Quick templates */}
      <div>
        <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
          Quick Templates
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TEMPLATES.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => loadTemplate(t.text)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-navy hover:text-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 transition-colors"
              >
                <Icon className="w-3 h-3" />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Transcript textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
            Live Transcript
          </label>
          {transcript.trim() && (
            <span className="text-[10px] text-slate-500">
              {transcript.trim().split(/\s+/).length} words
            </span>
          )}
        </div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Patient presenting with fever and cough for 3 days, diagnosed with viral URI, prescribed paracetamol 500mg BD for 5 days..."
          className="w-full min-h-[120px] p-3 bg-slate-50 border border-slate-300 rounded-md text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy resize-y transition-shadow"
        />
      </div>

      {/* Process button */}
      <button
        onClick={processTranscript}
        disabled={!transcript.trim() || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-navy hover:bg-navy-dark text-white text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
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
