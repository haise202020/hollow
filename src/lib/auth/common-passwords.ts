/**
 * Lista de senhas comuns/fracas que devem ser bloqueadas no registro.
 * Baseada em listas públicas de senhas mais usadas (Have I Been Pwned, SecLists).
 * Esta é uma lista mínima; para produção considere integração com API HIBP.
 */
const COMMON_PASSWORDS = new Set([
  // Top passwords globally
  "12345678", "123456789", "1234567890", "password", "password1",
  "qwerty123", "abc12345", "iloveyou", "admin123", "letmein1",
  "welcome1", "monkey12", "dragon12", "master12", "login123",
  "princess", "football", "shadow12", "sunshine", "trustno1",
  "passw0rd", "p@ssword", "p@ssw0rd", "1q2w3e4r", "qwertyui",
  "asdfghjk", "zxcvbnm1", "1qaz2wsx", "qweasdzxc", "1234qwer",
  "abcd1234", "senha123", "senha1234", "teste123", "teste1234",
  "brasil12", "brasil123", "hollow12", "hollow123", "roblox12",
  "roblox123", "admin1234", "root1234", "user1234", "guest123",
]);

/**
 * Verifica se uma senha está na lista de senhas comuns/fracas.
 * Comparação case-insensitive.
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Valida requisitos mínimos de complexidade da senha.
 * Retorna null se válida, ou mensagem de erro se inválida.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }
  if (password.length > 72) {
    return "A senha não pode exceder 72 caracteres.";
  }
  if (isCommonPassword(password)) {
    return "Essa senha é muito comum. Escolha uma senha mais forte.";
  }
  // Mínimo de complexidade: pelo menos 2 das 3 categorias
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const categories = [hasLower, hasUpper, hasDigit].filter(Boolean).length;
  if (categories < 2) {
    return "A senha deve conter letras maiúsculas, minúsculas e números (pelo menos 2 tipos).";
  }
  return null;
}