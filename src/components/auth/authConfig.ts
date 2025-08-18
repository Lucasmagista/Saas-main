// Configurações e utilitários para os formulários de autenticação

export const authAnimations = {
  slideIn: "animate-in slide-in-from-top-2 duration-200",
  slideInSlow: "animate-in slide-in-from-top-1 duration-300",
  fadeIn: "animate-in fade-in duration-200",
};

export const authStyles = {
  input: {
    base: "transition-all duration-200 focus:ring-2 focus:ring-primary/20",
    withIcon: "pl-10",
    withToggle: "pr-10",
    error: "border-destructive focus:border-destructive",
    disabled: "opacity-60",
  },
  icon: {
    base: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
    normal: "text-muted-foreground group-focus-within:text-primary",
    error: "text-destructive",
  },
  button: {
    primary: "w-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/25",
    success: "bg-green-600 hover:bg-green-600",
    link: "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 py-0.5",
  },
  toggleButton: {
    base: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm p-0.5",
    disabled: "opacity-60 cursor-not-allowed",
  },
};

export const formMessages = {
  login: {
    success: "Login realizado com sucesso! Redirecionando...",
    defaultError: "Erro ao fazer login. Verifique suas credenciais.",
    internalError: "Erro interno. Tente novamente em alguns instantes.",
  },
  register: {
    success: "Conta criada com sucesso! Verifique seu email para ativar a conta.",
    defaultError: "Erro ao criar conta. Tente novamente.",
    internalError: "Erro interno. Tente novamente em alguns instantes.",
  },
  forgotPassword: {
    success: "Email de recuperação enviado! Verifique sua caixa de entrada e spam.",
    defaultError: "Erro ao enviar email de recuperação.",
    internalError: "Erro interno. Tente novamente em alguns instantes.",
  },
};

export const validationMessages = {
  name: {
    required: "Nome é obrigatório",
    minLength: "Nome deve ter pelo menos 2 caracteres",
    maxLength: "Nome muito longo",
    format: "Nome deve conter apenas letras e espaços",
  },
  email: {
    invalid: "Email inválido",
  },
  password: {
    minLength: "A senha deve ter no mínimo 8 caracteres",
    lowercase: "Deve conter pelo menos uma letra minúscula",
    uppercase: "Deve conter pelo menos uma letra maiúscula", 
    number: "Deve conter pelo menos um número",
    special: "Deve conter pelo menos um caractere especial",
  },
  confirmPassword: {
    minLength: "A confirmação deve ter no mínimo 8 caracteres",
    mismatch: "As senhas não coincidem",
  },
};
