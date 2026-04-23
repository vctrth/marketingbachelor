import { useEffect } from 'react'
import plantIcon from '../../assets/8d75e753870d5d6108adfc829bb72987b196736f.svg'
import './Toast.css'

export default function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  return (
    <div className={`toast ${visible ? 'toast--visible' : ''}`}>
      <img className="toast__icon" src={plantIcon} alt="Plant icoon" />
      <span className="toast__message">{message}</span>
    </div>
  )
}
