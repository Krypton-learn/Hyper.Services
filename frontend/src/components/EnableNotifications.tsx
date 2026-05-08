import { useEffect, useRef } from 'react'

console.log('VITE_VAPID_PUBLIC_KEY:', import.meta.env.VITE_VAPID_PUBLIC_KEY)
console.log('VITE_VAPID_PUBLIC_KEY length:', import.meta.env.VITE_VAPID_PUBLIC_KEY?.length)

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
      console.log('Push not supported')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.log('No accessToken yet')
      return
    }

    hasTried.current = true

    console.log('Location protocol:', location.protocol)
    console.log('Location host:', location.host)

    try {
      console.log('Notification permission:', Notification.permission)
      
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission()
        console.log('Requested permission:', perm)
        if (perm !== 'granted') {
          console.log('Permission denied')
          return
        }
      } else if (Notification.permission !== 'granted') {
        console.log('Permission not granted:', Notification.permission)
        return
      }

      console.log('Registering service worker...')
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered, scope:', registration.scope)
      console.log('SW state:', registration.active?.state)

      console.log('Getting existing subscription...')
      const existing = await registration.pushManager.getSubscription()
      if (existing) {
        console.log('Already subscribed:', existing.endpoint)
        hasSubscribed.current = true
      } else {
        console.log('Creating new push subscription...')
        console.log('VAPID key (first 20 chars):', VAPID_PUBLIC_KEY.substring(0, 20) + '...')
        
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
        console.log('Push subscribed!', sub.endpoint)

        const res = await fetch('/api/notification/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(sub),
        })
        console.log('Backend response:', res.status, await res.json())
        hasSubscribed.current = true
      }
    } catch (err) {
      console.error('Error:', err.name, err.message)
      if (err.name === 'AbortError') {
        console.error('Push service unreachable - check network/VPN')
      }
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