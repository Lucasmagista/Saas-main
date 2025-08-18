import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      welcome: 'Bem-vindo',
      dashboard: 'Painel',
      settings: 'Configurações',
      team: 'Equipe',
      customers: 'Clientes',
      features: 'Funcionalidades',
      documentation: 'Documentação',
      communication: 'Comunicação',
      multiSessions: 'Multi-Sessões',
      automation: 'Automação',
      reports: 'Relatórios',
      integrations: 'Integrações',
      projects: 'Projetos',
      analytics: 'Análises',
      hr: 'RH',
      user: 'Usuário',
      admin: 'Administrador',
      manager: 'Gerente',
      login: 'Entrar',
      register: 'Registrar',
      forgotPassword: 'Esqueci a senha',
      loading: 'Carregando...'
    }
  },
  en: {
    translation: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      settings: 'Settings',
      team: 'Team',
      customers: 'Customers',
      features: 'Features',
      documentation: 'Documentation',
      communication: 'Communication',
      multiSessions: 'Multi-Sessions',
      automation: 'Automation',
      reports: 'Reports',
      integrations: 'Integrations',
      projects: 'Projects',
      analytics: 'Analytics',
      hr: 'HR',
      user: 'User',
      admin: 'Admin',
      manager: 'Manager',
      login: 'Login',
      register: 'Register',
      forgotPassword: 'Forgot Password',
      loading: 'Loading...'
    }
  },
  es: {
    translation: {
      welcome: 'Bienvenido',
      dashboard: 'Panel',
      settings: 'Configuraciones',
      team: 'Equipo',
      customers: 'Clientes',
      features: 'Funcionalidades',
      documentation: 'Documentación',
      communication: 'Comunicación',
      multiSessions: 'Multi-Sesiones',
      automation: 'Automatización',
      reports: 'Informes',
      integrations: 'Integraciones',
      projects: 'Proyectos',
      analytics: 'Analíticas',
      hr: 'RRHH',
      user: 'Usuario',
      admin: 'Administrador',
      manager: 'Gerente',
      login: 'Iniciar sesión',
      register: 'Registrar',
      forgotPassword: 'Olvidé mi contraseña',
      loading: 'Cargando...'
    }
  },
  fr: {
    translation: {
      welcome: 'Bienvenue',
      dashboard: 'Tableau de bord',
      settings: 'Paramètres',
      team: 'Équipe',
      customers: 'Clients',
      features: 'Fonctionnalités',
      documentation: 'Documentation',
      communication: 'Communication',
      multiSessions: 'Multi-Sessions',
      automation: 'Automatisation',
      reports: 'Rapports',
      integrations: 'Intégrations',
      projects: 'Projets',
      analytics: 'Analytique',
      hr: 'RH',
      user: 'Utilisateur',
      admin: 'Administrateur',
      manager: 'Manager',
      login: 'Connexion',
      register: 'Inscription',
      forgotPassword: 'Mot de passe oublié',
      loading: 'Chargement...'
    }
  },
  de: {
    translation: {
      welcome: 'Willkommen',
      dashboard: 'Dashboard',
      settings: 'Einstellungen',
      team: 'Team',
      customers: 'Kunden',
      features: 'Funktionen',
      documentation: 'Dokumentation',
      communication: 'Kommunikation',
      multiSessions: 'Multi-Sitzungen',
      automation: 'Automatisierung',
      reports: 'Berichte',
      integrations: 'Integrationen',
      projects: 'Projekte',
      analytics: 'Analytik',
      hr: 'Personal',
      user: 'Benutzer',
      admin: 'Administrator',
      manager: 'Manager',
      login: 'Anmelden',
      register: 'Registrieren',
      forgotPassword: 'Passwort vergessen',
      loading: 'Lädt...'
    }
  },
  it: {
    translation: {
      welcome: 'Benvenuto',
      dashboard: 'Cruscotto',
      settings: 'Impostazioni',
      team: 'Squadra',
      customers: 'Clienti',
      features: 'Funzionalità',
      documentation: 'Documentazione',
      communication: 'Comunicazione',
      multiSessions: 'Multi-sessioni',
      automation: 'Automazione',
      reports: 'Report',
      integrations: 'Integrazioni',
      projects: 'Progetti',
      analytics: 'Analisi',
      hr: 'Risorse Umane',
      user: 'Utente',
      admin: 'Amministratore',
      manager: 'Manager',
      login: 'Accedi',
      register: 'Registrati',
      forgotPassword: 'Password dimenticata',
      loading: 'Caricamento...'
    }
  },
  zh: {
    translation: {
      welcome: '欢迎',
      dashboard: '仪表盘',
      settings: '设置',
      team: '团队',
      customers: '客户',
      features: '功能',
      documentation: '文档',
      communication: '沟通',
      multiSessions: '多会话',
      automation: '自动化',
      reports: '报告',
      integrations: '集成',
      projects: '项目',
      analytics: '分析',
      hr: '人力资源',
      user: '用户',
      admin: '管理员',
      manager: '经理',
      login: '登录',
      register: '注册',
      forgotPassword: '忘记密码',
      loading: '加载中...'
    }
  },
  ja: {
    translation: {
      welcome: 'ようこそ',
      dashboard: 'ダッシュボード',
      settings: '設定',
      team: 'チーム',
      customers: '顧客',
      features: '機能',
      documentation: 'ドキュメント',
      communication: 'コミュニケーション',
      multiSessions: 'マルチセッション',
      automation: '自動化',
      reports: 'レポート',
      integrations: '統合',
      projects: 'プロジェクト',
      analytics: '分析',
      hr: '人事',
      user: 'ユーザー',
      admin: '管理者',
      manager: 'マネージャー',
      login: 'ログイン',
      register: '登録',
      forgotPassword: 'パスワードを忘れた',
      loading: '読み込み中...'
    }
  },
  ru: {
    translation: {
      welcome: 'Добро пожаловать',
      dashboard: 'Панель',
      settings: 'Настройки',
      team: 'Команда',
      customers: 'Клиенты',
      features: 'Функции',
      documentation: 'Документация',
      communication: 'Связь',
      multiSessions: 'Мультисессии',
      automation: 'Автоматизация',
      reports: 'Отчеты',
      integrations: 'Интеграции',
      projects: 'Проекты',
      analytics: 'Аналитика',
      hr: 'Кадры',
      user: 'Пользователь',
      admin: 'Администратор',
      manager: 'Менеджер',
      login: 'Войти',
      register: 'Регистрация',
      forgotPassword: 'Забыли пароль',
      loading: 'Загрузка...'
    }
  },
  ar: {
    translation: {
      welcome: 'مرحبا',
      dashboard: 'لوحة التحكم',
      settings: 'الإعدادات',
      team: 'فريق',
      customers: 'عملاء',
      features: 'ميزات',
      documentation: 'توثيق',
      communication: 'اتصال',
      multiSessions: 'جلسات متعددة',
      automation: 'أتمتة',
      reports: 'تقارير',
      integrations: 'تكاملات',
      projects: 'مشاريع',
      analytics: 'تحليلات',
      hr: 'الموارد البشرية',
      user: 'مستخدم',
      admin: 'مدير',
      manager: 'مدير',
      login: 'تسجيل الدخول',
      register: 'تسجيل',
      forgotPassword: 'نسيت كلمة المرور',
      loading: 'جار التحميل...'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
