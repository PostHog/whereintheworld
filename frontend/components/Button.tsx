import clsx from 'clsx'
import React from 'react'

interface ButtonProps
    extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    size?: 'sm' | 'md'
    styling?: 'default' | 'inverse'
}

export function Button({ className, children, size, styling, ...props }: ButtonProps): JSX.Element {
    return (
        <button className={clsx('btn', className, styling, size)} {...props}>
            {children}
        </button>
    )
}
