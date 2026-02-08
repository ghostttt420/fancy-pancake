import { useEffect, useState } from 'react'
import { setAnnounceFn } from '../lib/announcer'

export function ScreenReaderAnnouncer() {
  const [announcement, setAnnouncement] = useState('')
  const [priority, setPriority] = useState('polite')
  
  useEffect(() => {
    setAnnounceFn((message, prio) => {
      setPriority(prio)
      setAnnouncement(message)
      // Clear after announcement is read
      setTimeout(() => setAnnouncement(''), 1000)
    })
  }, [])
  
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {announcement}
    </div>
  )
}
