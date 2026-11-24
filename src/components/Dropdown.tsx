import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { normalize } from '../filters'

export interface DropdownOption<T> {
  value: T
  label: string
  icon?: ReactNode
  hint?: string
}

interface Props<T> {
  label: string
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  align?: 'start' | 'end'
}

const TYPE_AHEAD_RESET_MS = 700
const PAGE = 10

export function Dropdown<T extends string | number | undefined>({ label, value, options, onChange, align = 'start' }: Props<T>) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const scrollPending = useRef(false)
  const typed = useRef({ text: '', at: 0 })
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value))
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    list.current?.focus()
    const onPointer = (event: PointerEvent) => {
      if (!list.current?.parentElement?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  useLayoutEffect(() => {
    if (!open || !scrollPending.current) return
    scrollPending.current = false
    list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const moveTo = (index: number) => {
    scrollPending.current = true
    setActive(Math.min(options.length - 1, Math.max(0, index)))
  }

  const show = (index = selectedIndex) => {
    moveTo(index)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    button.current?.focus()
  }

  const choose = (index: number) => {
    onChange(options[index].value)
    close()
  }

  const findTyped = (key: string, from: number) => {
    const now = Date.now()
    const text = now - typed.current.at < TYPE_AHEAD_RESET_MS ? typed.current.text + key : key
    typed.current = { text, at: now }
    const cycling = [...text].every((char) => char === text[0])
    const query = normalize(cycling ? text[0] : text)
    const start = cycling ? from + 1 : from
    for (let offset = 0; offset < options.length; offset++) {
      const index = (start + offset) % options.length
      if (normalize(options[index].label).startsWith(query)) return index
    }
    return -1
  }

  const isTypeAhead = (event: KeyboardEvent) =>
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    (event.key !== ' ' || Date.now() - typed.current.at < TYPE_AHEAD_RESET_MS)

  const onButtonKey = (event: KeyboardEvent) => {
    if (isTypeAhead(event)) {
      event.preventDefault()
      const match = findTyped(event.key, selectedIndex)
      show(match === -1 ? selectedIndex : match)
    } else if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      show()
    }
  }

  const onListKey = (event: KeyboardEvent) => {
    if (isTypeAhead(event)) {
      event.preventDefault()
      const match = findTyped(event.key, active)
      if (match !== -1) moveTo(match)
      return
    }
    const moves: Record<string, () => void> = {
      ArrowDown: () => moveTo(active + 1),
      ArrowUp: () => moveTo(active - 1),
      PageDown: () => moveTo(active + PAGE),
      PageUp: () => moveTo(active - PAGE),
      Home: () => moveTo(0),
      End: () => moveTo(options.length - 1),
      Enter: () => choose(active),
      ' ': () => choose(active),
      Escape: close,
      Tab: () => setOpen(false),
    }
    const move = moves[event.key]
    if (!move) return
    if (event.key !== 'Tab') event.preventDefault()
    move()
  }

  return (
    <div className={`dropdown dropdown--${align}`}>
      <button
        ref={button}
        type="button"
        className="dropdown__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selected?.label ?? ''}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onButtonKey}
      >
        {selected?.icon}
        <span className="dropdown__label">{selected?.label}</span>
        <span className="dropdown__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul
          ref={list}
          className="dropdown__list"
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onListKey}
        >
          {options.map((option, index) => (
            <li
              key={String(option.value)}
              id={`${id}-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={index === active ? 'is-active' : undefined}
              onPointerMove={() => index !== active && setActive(index)}
              onClick={() => choose(index)}
            >
              {option.icon}
              <span className="dropdown__label">{option.label}</span>
              {option.hint && <span className="dropdown__hint">{option.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
