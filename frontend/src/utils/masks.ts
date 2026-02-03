/**
 * Máscaras para inputs de formulários
 * Formata valores enquanto o usuário digita
 */

import { removeNonNumeric } from './validators';

// ========== MÁSCARA DE CPF ==========

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export const maskCPF = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// ========== MÁSCARA DE CNPJ ==========

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export const maskCNPJ = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

// ========== MÁSCARA DE CPF OU CNPJ ==========

/**
 * Aplica máscara de CPF ou CNPJ automaticamente baseado no tamanho
 */
export const maskCPForCNPJ = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 11) {
    return maskCPF(value);
  }
  return maskCNPJ(value);
};

// ========== MÁSCARA DE TELEFONE ==========

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const maskPhone = (value: string): string => {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers
      .slice(0, 10)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  
  // Celular: (00) 00000-0000
  return numbers
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

// ========== MÁSCARA DE CEP ==========

/**
 * Aplica máscara de CEP: 00000-000
 */
export const maskCEP = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

// ========== MÁSCARA DE VALOR MONETÁRIO ==========

/**
 * Aplica máscara de valor monetário: R$ 1.234,56
 */
export const maskCurrency = (value: string | number): string => {
  const numbers = removeNonNumeric(value.toString());
  
  if (!numbers) return 'R$ 0,00';
  
  const numValue = parseInt(numbers) / 100;
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Remove máscara de valor monetário e retorna número
 */
export const unmaskCurrency = (value: string): number => {
  const numbers = removeNonNumeric(value);
  if (!numbers) return 0;
  return parseInt(numbers) / 100;
};

// ========== MÁSCARA DE PORCENTAGEM ==========

/**
 * Aplica máscara de porcentagem: 00,00%
 */
export const maskPercentage = (value: string | number): string => {
  const numbers = removeNonNumeric(value.toString());
  
  if (!numbers) return '0,00%';
  
  const numValue = parseInt(numbers) / 100;
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '%';
};

/**
 * Remove máscara de porcentagem e retorna número
 */
export const unmaskPercentage = (value: string): number => {
  const numbers = removeNonNumeric(value);
  if (!numbers) return 0;
  return parseInt(numbers) / 100;
};

// ========== MÁSCARA DE CARTÃO DE CRÉDITO ==========

/**
 * Aplica máscara de cartão de crédito: 0000 0000 0000 0000
 */
export const maskCreditCard = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
};

/**
 * Detecta bandeira do cartão
 */
export const detectCardBrand = (value: string): string | null => {
  const numbers = removeNonNumeric(value);
  
  if (/^4/.test(numbers)) return 'Visa';
  if (/^5[1-5]/.test(numbers)) return 'Mastercard';
  if (/^3[47]/.test(numbers)) return 'American Express';
  if (/^6(?:011|5)/.test(numbers)) return 'Discover';
  if (/^(?:2131|1800|35)/.test(numbers)) return 'JCB';
  if (/^(?:50|60|62|63|64|65|66|67)/.test(numbers)) return 'Elo';
  
  return null;
};

// ========== MÁSCARA DE CÓDIGO DE SEGURANÇA (CVV) ==========

/**
 * Aplica máscara de CVV: 000 ou 0000 (Amex)
 */
export const maskCVV = (value: string, isAmex: boolean = false): string => {
  const numbers = removeNonNumeric(value);
  const maxLength = isAmex ? 4 : 3;
  return numbers.slice(0, maxLength);
};

// ========== MÁSCARA DE DATA ==========

/**
 * Aplica máscara de data: DD/MM/YYYY
 */
export const maskDate = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
};

/**
 * Aplica máscara de data curta: DD/MM/YY
 */
export const maskDateShort = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 6)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
};

// ========== MÁSCARA DE HORA ==========

/**
 * Aplica máscara de hora: HH:MM
 */
export const maskTime = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 4)
    .replace(/(\d{2})(\d{1,2})/, '$1:$2');
};

/**
 * Aplica máscara de hora com segundos: HH:MM:SS
 */
export const maskTimeWithSeconds = (value: string): string => {
  const numbers = removeNonNumeric(value);
  return numbers
    .slice(0, 6)
    .replace(/(\d{2})(\d)/, '$1:$2')
    .replace(/(\d{2})(\d)/, '$1:$2');
};

// ========== MÁSCARA DE PLACA DE VEÍCULO ==========

/**
 * Aplica máscara de placa de veículo (Mercosul): ABC1D23
 */
export const maskLicensePlate = (value: string): string => {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7)
    .replace(/^([A-Z]{3})([0-9][A-Z0-9][0-9]{2})$/, '$1-$2');
};

// ========== MÁSCARA DE APENAS NÚMEROS ==========

/**
 * Remove tudo exceto números
 */
export const maskOnlyNumbers = (value: string): string => {
  return removeNonNumeric(value);
};

// ========== MÁSCARA DE APENAS LETRAS ==========

/**
 * Remove tudo exceto letras e espaços
 */
export const maskOnlyLetters = (value: string): string => {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
};

// ========== MÁSCARA DE RG ==========

/**
 * Aplica máscara de RG: 00.000.000-0
 */
export const maskRG = (value: string): string => {
  const cleaned = value.replace(/[^0-9Xx]/g, '');
  return cleaned
    .slice(0, 9)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2');
};

// ========== MÁSCARA DE NÚMERO DE CONTA BANCÁRIA ==========

/**
 * Aplica máscara de conta bancária: 00000-0
 */
export const maskBankAccount = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 1) return numbers;
  const account = numbers.slice(0, -1);
  const digit = numbers.slice(-1);
  return `${account}-${digit}`;
};

// ========== MÁSCARA DE AGÊNCIA BANCÁRIA ==========

/**
 * Aplica máscara de agência bancária: 0000 ou 0000-0
 */
export const maskBankBranch = (value: string): string => {
  const numbers = removeNonNumeric(value);
  if (numbers.length <= 4) return numbers;
  return numbers.slice(0, 4) + '-' + numbers.slice(4, 5);
};

// ========== MÁSCARA CUSTOMIZÁVEL ==========

/**
 * Aplica máscara customizada
 * Exemplo: maskCustom('12345678', '##.###.###-#') -> '12.345.678-9'
 * # = número, @ = letra, * = qualquer caractere
 */
export const maskCustom = (value: string, pattern: string): string => {
  let masked = '';
  let valueIndex = 0;
  
  for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
    const patternChar = pattern[i];
    const valueChar = value[valueIndex];
    
    if (patternChar === '#') {
      // Aceita apenas números
      if (/\d/.test(valueChar)) {
        masked += valueChar;
        valueIndex++;
      } else {
        valueIndex++;
        i--;
      }
    } else if (patternChar === '@') {
      // Aceita apenas letras
      if (/[a-zA-Z]/.test(valueChar)) {
        masked += valueChar;
        valueIndex++;
      } else {
        valueIndex++;
        i--;
      }
    } else if (patternChar === '*') {
      // Aceita qualquer caractere
      masked += valueChar;
      valueIndex++;
    } else {
      // Caractere fixo da máscara
      masked += patternChar;
      if (valueChar === patternChar) {
        valueIndex++;
      }
    }
  }
  
  return masked;
};

// ========== HELPER: APLICAR MÁSCARA GENÉRICA ==========

export type MaskType = 
  | 'cpf' 
  | 'cnpj' 
  | 'cpf-cnpj' 
  | 'phone' 
  | 'cep' 
  | 'currency' 
  | 'percentage'
  | 'credit-card'
  | 'cvv'
  | 'date'
  | 'date-short'
  | 'time'
  | 'time-seconds'
  | 'license-plate'
  | 'only-numbers'
  | 'only-letters'
  | 'rg'
  | 'bank-account'
  | 'bank-branch';

/**
 * Aplica máscara baseado no tipo
 */
export const applyMask = (value: string, type: MaskType): string => {
  switch (type) {
    case 'cpf':
      return maskCPF(value);
    case 'cnpj':
      return maskCNPJ(value);
    case 'cpf-cnpj':
      return maskCPForCNPJ(value);
    case 'phone':
      return maskPhone(value);
    case 'cep':
      return maskCEP(value);
    case 'currency':
      return maskCurrency(value);
    case 'percentage':
      return maskPercentage(value);
    case 'credit-card':
      return maskCreditCard(value);
    case 'cvv':
      return maskCVV(value);
    case 'date':
      return maskDate(value);
    case 'date-short':
      return maskDateShort(value);
    case 'time':
      return maskTime(value);
    case 'time-seconds':
      return maskTimeWithSeconds(value);
    case 'license-plate':
      return maskLicensePlate(value);
    case 'only-numbers':
      return maskOnlyNumbers(value);
    case 'only-letters':
      return maskOnlyLetters(value);
    case 'rg':
      return maskRG(value);
    case 'bank-account':
      return maskBankAccount(value);
    case 'bank-branch':
      return maskBankBranch(value);
    default:
      return value;
  }
};

// ========== EXPORT ALL ==========

export const masks = {
  cpf: maskCPF,
  cnpj: maskCNPJ,
  cpfOrCnpj: maskCPForCNPJ,
  phone: maskPhone,
  cep: maskCEP,
  currency: maskCurrency,
  percentage: maskPercentage,
  creditCard: maskCreditCard,
  cvv: maskCVV,
  date: maskDate,
  dateShort: maskDateShort,
  time: maskTime,
  timeWithSeconds: maskTimeWithSeconds,
  licensePlate: maskLicensePlate,
  onlyNumbers: maskOnlyNumbers,
  onlyLetters: maskOnlyLetters,
  rg: maskRG,
  bankAccount: maskBankAccount,
  bankBranch: maskBankBranch,
  custom: maskCustom,
  apply: applyMask,
};

