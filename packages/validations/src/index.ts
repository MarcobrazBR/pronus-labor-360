export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (base: string, factor: number): number => {
    let total = 0;

    for (const digit of base) {
      total += Number(digit) * factor;
      factor -= 1;
    }

    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}

export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calculateDigit = (base: string, factors: number[]): number => {
    const total = base
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * Number(factors[index]), 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [
    6,
    5,
    4,
    3,
    2,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
  ]);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}
