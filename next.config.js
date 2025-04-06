/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Isso ajuda a evitar erros de hidratação em desenvolvimento
  swcMinify: true,
  // Suprimir warnings de hidratação em desenvolvimento
  onDemandEntries: {
    // Período em ms em que a página será mantida em memória
    maxInactiveAge: 25 * 1000,
    // Número de páginas que serão mantidas em memória
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig 