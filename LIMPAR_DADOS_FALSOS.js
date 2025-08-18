console.log('🧹 LIMPANDO TODOS OS DADOS FALSOS DO LOCALSTORAGE...');

// Remove TODOS os dados relacionados à autenticação
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken'); 
localStorage.removeItem('user');
localStorage.removeItem('jwt');

// Remove qualquer coisa com "dev_" ou "Auto-Fix"
Object.keys(localStorage).forEach(key => {
  const value = localStorage.getItem(key);
  if (value && (value.includes('dev_') || value.includes('Auto-Fix') || value.includes('lucas.magista1@gmail.com'))) {
    console.log('Removendo item suspeito:', key, value);
    localStorage.removeItem(key);
  }
});

// Limpa tudo mesmo
sessionStorage.clear();

console.log('✅ LIMPEZA COMPLETA! DADOS FALSOS REMOVIDOS!');
console.log('Itens restantes no localStorage:', localStorage.length);

// Força reload da página
window.location.reload();
