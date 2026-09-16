import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import {
  VirtualKeyboard,
  type VirtualKeyboardMode,
} from './VirtualKeyboard'

export type LeadData = {
  nome: string
  whatsapp: string
  data_casamento: string
  local_casamento: string
  num_convidados: string
}

type FieldErrors = Partial<Record<keyof LeadData, string>>

type LeadFormProps = {
  onSuccess: (data: LeadData) => void
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function formatWhatsapp(value: string) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : ''
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatDataCasamento(value: string) {
  const digits = onlyDigits(value).slice(0, 6)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function formatNumConvidados(value: string) {
  return onlyDigits(value).slice(0, 4)
}

function parseDataCasamento(value: string): Date | null {
  const digits = onlyDigits(value)
  if (digits.length !== 6) return null

  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = 2000 + Number(digits.slice(4, 6))

  if (month < 1 || month > 12 || day < 1) return null

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function validate(data: LeadData): FieldErrors {
  const errors: FieldErrors = {}

  if (data.nome.trim().length < 2) {
    errors.nome = 'Informe seu nome completo.'
  }

  const digits = onlyDigits(data.whatsapp)
  if (digits.length === 0) {
    errors.whatsapp = 'Informe seu WhatsApp.'
  } else if (digits.length !== 11 || digits[2] !== '9') {
    errors.whatsapp = 'Informe um WhatsApp válido com DDD.'
  }

  const weddingDigits = onlyDigits(data.data_casamento)
  if (weddingDigits.length > 0) {
    const weddingDate = parseDataCasamento(data.data_casamento)
    if (!weddingDate) {
      errors.data_casamento = 'Informe a data do casamento (DD/MM/AA).'
    } else {
      const currentYear = new Date().getFullYear()
      const year = weddingDate.getFullYear()
      if (year < currentYear || year > currentYear + 5) {
        errors.data_casamento = 'Informe um ano de casamento válido.'
      }
    }
  }

  const guests = onlyDigits(data.num_convidados)
  if (guests.length > 0) {
    const count = Number(guests)
    if (!Number.isInteger(count) || count < 1) {
      errors.num_convidados = 'Informe um número válido de convidados.'
    }
  }

  return errors
}

function keyboardModeFor(field: keyof LeadData): VirtualKeyboardMode {
  return field === 'whatsapp' ||
    field === 'data_casamento' ||
    field === 'num_convidados'
    ? 'numeric'
    : 'text'
}

export function LeadForm({ onSuccess }: LeadFormProps) {
  const [form, setForm] = useState<LeadData>({
    nome: '',
    whatsapp: '',
    data_casamento: '',
    local_casamento: '',
    num_convidados: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeField, setActiveField] = useState<keyof LeadData | null>(null)

  useEffect(() => {
    document.body.classList.toggle('keyboard-open', Boolean(activeField))
    return () => document.body.classList.remove('keyboard-open')
  }, [activeField])

  useEffect(() => {
    if (!activeField) return

    const timer = window.setTimeout(() => {
      document.getElementById(activeField)?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
    }, 280)

    return () => window.clearTimeout(timer)
  }, [activeField])

  function clearFieldFeedback(key: keyof LeadData) {
    setSubmitError(null)
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function formatFieldValue(field: keyof LeadData, nextRaw: string) {
    if (field === 'whatsapp') return formatWhatsapp(nextRaw)
    if (field === 'data_casamento') return formatDataCasamento(nextRaw)
    if (field === 'num_convidados') return formatNumConvidados(nextRaw)
    return nextRaw
  }

  function handleKeyboardInput(char: string) {
    if (!activeField) return
    const field = activeField

    setForm((current) => ({
      ...current,
      [field]: formatFieldValue(field, current[field] + char),
    }))
    clearFieldFeedback(field)
  }

  function handleKeyboardBackspace() {
    if (!activeField) return
    const field = activeField

    setForm((current) => {
      if (field === 'whatsapp') {
        const digits = onlyDigits(current.whatsapp).slice(0, -1)
        return { ...current, whatsapp: formatWhatsapp(digits) }
      }

      if (field === 'data_casamento') {
        const digits = onlyDigits(current.data_casamento).slice(0, -1)
        return { ...current, data_casamento: formatDataCasamento(digits) }
      }

      if (field === 'num_convidados') {
        const digits = onlyDigits(current.num_convidados).slice(0, -1)
        return { ...current, num_convidados: formatNumConvidados(digits) }
      }

      return {
        ...current,
        [field]: formatFieldValue(field, current[field].slice(0, -1)),
      }
    })
    clearFieldFeedback(field)
  }

  function openKeyboard(field: keyof LeadData) {
    setActiveField(field)
    window.requestAnimationFrame(() => {
      document.getElementById(field)?.focus({ preventScroll: true })
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActiveField(null)

    const nextErrors = validate(form)
    setErrors(nextErrors)
    setSubmitError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const weddingDate = parseDataCasamento(form.data_casamento)
    const guestsDigits = onlyDigits(form.num_convidados)

    const displayData: LeadData = {
      nome: form.nome.trim(),
      whatsapp: onlyDigits(form.whatsapp),
      data_casamento: weddingDate
        ? formatDataCasamento(form.data_casamento)
        : '',
      local_casamento: form.local_casamento.trim(),
      num_convidados: guestsDigits,
    }

    const insertPayload = {
      nome: displayData.nome,
      whatsapp: displayData.whatsapp,
      data_casamento: weddingDate ? toIsoDate(weddingDate) : null,
      local_casamento: displayData.local_casamento || null,
      num_convidados: guestsDigits ? Number(guestsDigits) : null,
    }

    setSubmitting(true)

    const { error } = await supabase
      .from('leads-feiras-noivas')
      .insert(insertPayload)

    setSubmitting(false)

    if (error) {
      setSubmitError('Não foi possível enviar seus dados. Tente novamente.')
      return
    }

    onSuccess(displayData)
  }

  return (
    <>
      <form className="lead-form" onSubmit={handleSubmit} noValidate>
        <div
          className={
            activeField === 'nome' ? 'field field--active' : 'field'
          }
          onPointerDown={() => openKeyboard('nome')}
        >
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            name="nome"
            type="text"
            placeholder="Seu nome"
            value={form.nome}
            readOnly
            inputMode="none"
            tabIndex={0}
            aria-invalid={Boolean(errors.nome)}
            aria-describedby={errors.nome ? 'nome-error' : undefined}
          />
          {errors.nome ? (
            <p id="nome-error" className="field__error" role="alert">
              {errors.nome}
            </p>
          ) : null}
        </div>

        <div className="field-row">
          <div
            className={
              activeField === 'whatsapp' ? 'field field--active' : 'field'
            }
            onPointerDown={() => openKeyboard('whatsapp')}
          >
            <label htmlFor="whatsapp">WhatsApp</label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="none"
              placeholder="(11) 99999-9999"
              value={form.whatsapp}
              readOnly
              tabIndex={0}
              aria-invalid={Boolean(errors.whatsapp)}
              aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
            />
            {errors.whatsapp ? (
              <p id="whatsapp-error" className="field__error" role="alert">
                {errors.whatsapp}
              </p>
            ) : null}
          </div>

          <div
            className={
              activeField === 'data_casamento'
                ? 'field field--active'
                : 'field'
            }
            onPointerDown={() => openKeyboard('data_casamento')}
          >
            <label htmlFor="data_casamento">Data do casamento</label>
            <input
              id="data_casamento"
              name="data_casamento"
              type="text"
              inputMode="none"
              placeholder="DD/MM/AA"
              value={form.data_casamento}
              readOnly
              tabIndex={0}
              aria-invalid={Boolean(errors.data_casamento)}
              aria-describedby={
                errors.data_casamento ? 'data-casamento-error' : undefined
              }
            />
            {errors.data_casamento ? (
              <p
                id="data-casamento-error"
                className="field__error"
                role="alert"
              >
                {errors.data_casamento}
              </p>
            ) : null}
          </div>
        </div>

        <div className="field-row">
          <div
            className={
              activeField === 'local_casamento'
                ? 'field field--active'
                : 'field'
            }
            onPointerDown={() => openKeyboard('local_casamento')}
          >
            <label htmlFor="local_casamento">Local do casamento</label>
            <input
              id="local_casamento"
              name="local_casamento"
              type="text"
              inputMode="none"
              placeholder="Cidade ou espaço"
              value={form.local_casamento}
              readOnly
              tabIndex={0}
              aria-invalid={Boolean(errors.local_casamento)}
              aria-describedby={
                errors.local_casamento ? 'local-casamento-error' : undefined
              }
            />
            {errors.local_casamento ? (
              <p
                id="local-casamento-error"
                className="field__error"
                role="alert"
              >
                {errors.local_casamento}
              </p>
            ) : null}
          </div>

          <div
            className={
              activeField === 'num_convidados'
                ? 'field field--active'
                : 'field'
            }
            onPointerDown={() => openKeyboard('num_convidados')}
          >
            <label htmlFor="num_convidados">Nº convidados</label>
            <input
              id="num_convidados"
              name="num_convidados"
              type="text"
              inputMode="none"
              placeholder="Ex.: 150"
              value={form.num_convidados}
              readOnly
              tabIndex={0}
              aria-invalid={Boolean(errors.num_convidados)}
              aria-describedby={
                errors.num_convidados ? 'num-convidados-error' : undefined
              }
            />
            {errors.num_convidados ? (
              <p
                id="num-convidados-error"
                className="field__error"
                role="alert"
              >
                {errors.num_convidados}
              </p>
            ) : null}
          </div>
        </div>

        {submitError ? (
          <p className="field__error" role="alert">
            {submitError}
          </p>
        ) : null}

        <button className="submit-btn" type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
      </form>

      <VirtualKeyboard
        open={Boolean(activeField)}
        mode={activeField ? keyboardModeFor(activeField) : 'text'}
        onInput={handleKeyboardInput}
        onBackspace={handleKeyboardBackspace}
        onClose={() => setActiveField(null)}
      />
    </>
  )
}
