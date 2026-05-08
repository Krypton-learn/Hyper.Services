import { useEffect, useRef } from 'react'

const VAPID_PUBLIC_KEY = 'BAVx4ElHSpo5Y8jiPggoJMlxlBk05zcnYXcfV92gJPx0osr2BKQ8fDDMT0ZvocA7X0mVfT5Dh8lzjJHDO-KAQ_g'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function EnableNotifications() {
  const hasTried = useRef(false)
  const hasSubscribed = useRef(false)

  const trySubscribe = async () => {
    if (hasSubscribed.current || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      return
    }

    hasTried.current = true

    try {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') {
          return
        }
      } else if (Notification.permission !== 'granted') {
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')

      const existing = await registration.pushManager.getSubscription()
      if (existing) {
        hasSubscribed.current = true
      } else {
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        })

        await fetch('/api/notification/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(sub),
        })
        hasSubscribed.current = true
      }
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    setTimeout(trySubscribe, 1500)

    const checkToken = setInterval(() => {
      if (localStorage.getItem('accessToken') && !hasTried.current) {
        trySubscribe()
      }
    }, 500)

    return () => clearInterval(checkToken)
  }, [])

  return null
}
