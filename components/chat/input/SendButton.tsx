import React, { memo } from 'react'
import { SendIcon, Loader } from '@/components/ui/icons'

interface SendButtonProps {
  disabled?: boolean
  isTyping?: boolean
}

export const SendButton = memo(function SendButton({ 
  disabled, 
  isTyping 
}: SendButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="send-button"
      data-testid="send-button"
    >
      {isTyping ? <Loader /> : <SendIcon />}
    </button>
  )
}) 