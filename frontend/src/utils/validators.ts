/**
 * Validadores para formulários
 * Inclui validações de documentos brasileiros, telefone, CEP, etc.
 */

// ========== VALIDAÇÃO DE CNPJ ==========

/**
 * Remove caracteres não numéricos
 */
export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida CNPJ brasileiro
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = removeNonNumeric(cnpj);

  // CNPJ deve ter 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // Rejeita CNPJs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  let multiplier = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleanCNPJ.charAt(12)) !== digit) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  multiplier = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleanCNPJ.charAt(13)) !== digit) return false;

  return true;
};

// ========== VALIDAÇÃO DE CPF ==========

/**
 * Valida CPF brasileiro
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = removeNonNumeric(cpf);

  // CPF deve ter 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleanCPF.charAt(9)) !== digit) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleanCPF.charAt(10)) !== digit) return false;

  return true;
};

/**
 * Valida CPF ou CNPJ automaticamente
 */
export const validateCPForCNPJ = (value: string): boolean => {
  const clean = removeNonNumeric(value);
  if (clean.length === 11) return validateCPF(value);
  if (clean.length === 14) return validateCNPJ(value);
  return false;
};

// ========== VALIDAÇÃO DE TELEFONE ==========

/**
 * Valida telefone brasileiro (celular ou fixo)
 * Formatos aceitos:
 * - (11) 98765-4321 (celular com DDD)
 * - (11) 3456-7890 (fixo com DDD)
 * - 11987654321 (celular sem formatação)
 * - 1134567890 (fixo sem formatação)
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = removeNonNumeric(phone);

  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // DDD deve ser válido (11-99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  // Se for celular (11 dígitos), o terceiro dígito deve ser 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;

  return true;
};

/**
 * Valida se é um celular brasileiro
 */
export const validateCellphone = (phone: string): boolean => {
  const cleanPhone = removeNonNumeric(phone);
  return cleanPhone.length === 11 && cleanPhone.charAt(2) === '9' && validatePhone(phone);
};

// ========== VALIDAÇÃO DE CEP ==========

/**
 * Valida CEP brasileiro
 * Formato: 12345-678 ou 12345678
 */
export const validateCEP = (cep: string): boolean => {
  const cleanCEP = removeNonNumeric(cep);
  return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
};

// ========== VALIDAÇÃO DE EMAIL ==========

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida email com regras mais rigorosas
 */
export const validateEmailStrict = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// ========== VALIDAÇÃO DE URL ==========

/**
 * Valida URL
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ========== VALIDAÇÃO DE SENHA ==========

/**
 * Valida senha forte
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export const validateStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
};

/**
 * Retorna feedback sobre a força da senha
 */
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Use pelo menos 8 caracteres');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Adicione pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Adicione pelo menos uma letra minúscula');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Adicione pelo menos um número');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Adicione pelo menos um caractere especial');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 5) strength = 'very-strong';
  else if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { strength, score, feedback };
};

// ========== VALIDAÇÃO DE DATA ==========

/**
 * Valida se a data é válida
 */
export const validateDate = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

/**
 * Valida se a data é futura
 */
export const validateFutureDate = (date: string): boolean => {
  if (!validateDate(date)) return false;
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

/**
 * Valida se a data é passada
 */
export const validatePastDate = (date: string): boolean => {
  if (!validateDate(date)) return false;
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

/**
 * Valida se a data está entre duas datas
 */
export const validateDateBetween = (date: string, start: string, end: string): boolean => {
  if (!validateDate(date) || !validateDate(start) || !validateDate(end)) return false;
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
};

/**
 * Valida idade mínima
 */
export const validateMinAge = (birthdate: string, minAge: number): boolean => {
  if (!validateDate(birthdate)) return false;
  const today = new Date();
  const birth = new Date(birthdate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  return age >= minAge;
};

// ========== VALIDAÇÃO DE VALOR MONETÁRIO ==========

/**
 * Valida valor monetário positivo
 */
export const validatePositiveAmount = (amount: string | number): boolean => {
  const value = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;
  return !isNaN(value) && value > 0;
};

/**
 * Valida valor monetário não negativo
 */
export const validateNonNegativeAmount = (amount: string | number): boolean => {
  const value = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;
  return !isNaN(value) && value >= 0;
};

// ========== VALIDAÇÃO DE HORÁRIO COMERCIAL ==========

/**
 * Valida se o horário está em formato válido (HH:MM)
 */
export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Valida se o horário de término é após o horário de início
 */
export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) return false;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return startHour * 60 + startMinute < endHour * 60 + endMinute;
};

// ========== VALIDAÇÃO DE NOME ==========

/**
 * Valida nome completo (pelo menos nome e sobrenome)
 */
export const validateFullName = (name: string): boolean => {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  return parts.length >= 2 && parts.every(part => part.length >= 2);
};

// ========== VALIDAÇÃO DE COMPRIMENTO ==========

/**
 * Valida comprimento mínimo
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Valida comprimento máximo
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Valida comprimento entre min e max
 */
export const validateLengthBetween = (value: string, minLength: number, maxLength: number): boolean => {
  const length = value.trim().length;
  return length >= minLength && length <= maxLength;
};

// ========== MENSAGENS DE ERRO ==========

export const ERROR_MESSAGES = {
  required: 'Este campo é obrigatório',
  invalidCPF: 'CPF inválido',
  invalidCNPJ: 'CNPJ inválido',
  invalidCPForCNPJ: 'CPF ou CNPJ inválido',
  invalidPhone: 'Telefone inválido',
  invalidCellphone: 'Celular inválido',
  invalidCEP: 'CEP inválido',
  invalidEmail: 'Email inválido',
  invalidURL: 'URL inválida',
  weakPassword: 'Senha fraca. Use pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais',
  invalidDate: 'Data inválida',
  invalidFutureDate: 'A data deve ser futura',
  invalidPastDate: 'A data deve ser passada',
  invalidMinAge: (age: number) => `Idade mínima: ${age} anos`,
  invalidPositiveAmount: 'O valor deve ser maior que zero',
  invalidNonNegativeAmount: 'O valor não pode ser negativo',
  invalidTimeFormat: 'Horário inválido. Use o formato HH:MM',
  invalidTimeRange: 'O horário de término deve ser após o horário de início',
  invalidFullName: 'Digite o nome completo (nome e sobrenome)',
  invalidMinLength: (min: number) => `Mínimo de ${min} caracteres`,
  invalidMaxLength: (max: number) => `Máximo de ${max} caracteres`,
  invalidLengthBetween: (min: number, max: number) => `Entre ${min} e ${max} caracteres`,
};

// ========== VALIDADOR GENÉRICO ==========

export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export const validate = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
};

// ========== HELPER: CRIAR REGRAS DE VALIDAÇÃO ==========

export const createValidationRules = {
  required: (): ValidationRule => ({
    validator: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
    message: ERROR_MESSAGES.required,
  }),
  
  cpf: (): ValidationRule => ({
    validator: validateCPF,
    message: ERROR_MESSAGES.invalidCPF,
  }),
  
  cnpj: (): ValidationRule => ({
    validator: validateCNPJ,
    message: ERROR_MESSAGES.invalidCNPJ,
  }),
  
  cpfOrCnpj: (): ValidationRule => ({
    validator: validateCPForCNPJ,
    message: ERROR_MESSAGES.invalidCPForCNPJ,
  }),
  
  phone: (): ValidationRule => ({
    validator: validatePhone,
    message: ERROR_MESSAGES.invalidPhone,
  }),
  
  cellphone: (): ValidationRule => ({
    validator: validateCellphone,
    message: ERROR_MESSAGES.invalidCellphone,
  }),
  
  cep: (): ValidationRule => ({
    validator: validateCEP,
    message: ERROR_MESSAGES.invalidCEP,
  }),
  
  email: (): ValidationRule => ({
    validator: validateEmail,
    message: ERROR_MESSAGES.invalidEmail,
  }),
  
  strongPassword: (): ValidationRule => ({
    validator: validateStrongPassword,
    message: ERROR_MESSAGES.weakPassword,
  }),
  
  minAge: (age: number): ValidationRule => ({
    validator: (value) => validateMinAge(value, age),
    message: ERROR_MESSAGES.invalidMinAge(age),
  }),
  
  positiveAmount: (): ValidationRule => ({
    validator: validatePositiveAmount,
    message: ERROR_MESSAGES.invalidPositiveAmount,
  }),
  
  fullName: (): ValidationRule => ({
    validator: validateFullName,
    message: ERROR_MESSAGES.invalidFullName,
  }),
  
  minLength: (min: number): ValidationRule => ({
    validator: (value) => validateMinLength(value, min),
    message: ERROR_MESSAGES.invalidMinLength(min),
  }),
  
  maxLength: (max: number): ValidationRule => ({
    validator: (value) => validateMaxLength(value, max),
    message: ERROR_MESSAGES.invalidMaxLength(max),
  }),
};

