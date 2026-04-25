import React, { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

import { supabase } from '../lib/supabase'

export const ConnectionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Testing connection…')
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const url = process.env.REACT_APP_SUPABASE_URL
        const key = process.env.REACT_APP_SUPABASE_ANON_KEY

        console.log('Environment check:', {
          url: url ? 'Set' : 'Missing',
          key: key ? 'Set' : 'Missing',
        })

        if (!url || !key) {
          setIsSuccess(false)
          setTestResult('Environment variables missing')
          return
        }

        if (!supabase) {
          setIsSuccess(false)
          setTestResult('Supabase client not initialized')
          return
        }

        const { data, error } = await supabase
          .from('v_sports_directory')
          .select('count')
          .limit(1)

        if (error) {
          setIsSuccess(false)
          setTestResult(`Query failed: ${error.message}`)
          console.error('Query error:', error)
          return
        }

        setIsSuccess(true)
        setTestResult(`Connection successful! Sample results: ${data?.length || 0}`)
      } catch (err) {
        setIsSuccess(false)
        setTestResult(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        console.error('Test error:', err)
      }
    }

    testConnection()
  }, [])

  const Icon = isSuccess ? Wifi : WifiOff
  const borderClass = isSuccess === null ? 'border-yellow-500/30' : isSuccess ? 'border-emerald-400/40' : 'border-red-400/40'
  const glowClass = isSuccess === null ? 'from-yellow-500/20' : isSuccess ? 'from-emerald-400/30' : 'from-red-400/30'

  return (
    <div className={`relative overflow-hidden rounded-xl border ${borderClass} bg-black/70 p-6`}> 
      <div className={`absolute inset-0 bg-gradient-to-br ${glowClass} via-transparent to-purple-500/20 opacity-40`} />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
            <Icon className="h-6 w-6 text-yellow-300" />
          </span>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide text-white">
              Supabase Connectivity
            </h3>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Real-time diagnostics
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-200">{testResult}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Check the console for detailed logs.
        </p>
      </div>
    </div>
  )
}
