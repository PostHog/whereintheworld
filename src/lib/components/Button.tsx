import clsx from 'clsx'
import React from 'react'

interface ButtonProps
    extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    size?: 'sm' | 'md' | 'lg'
    styling?: 'default' | 'inverse' | 'link'
}

export function Button({ className, children, size, styling, disabled, ...props }: ButtonProps): JSX.Element {
    return (
        <button
            className={clsx('btn', className, styling, size, disabled && 'disabled')}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}
