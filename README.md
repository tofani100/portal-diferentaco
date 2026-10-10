# Portal Diferentaço - Victor & Franco 🎵

> Portal oficial da dupla sertaneja **Victor & Franco**. Agenda de shows, discografia, clipes, fotos promocionais, fotos de fãs, depoimentos, enquetes e formulário para contratações.

Projeto 100% migrado e independente da plataforma Base44, com persistência local de dados, assets de mídia estáticos próprios e preparado para deploy no **Firebase Hosting**, **Google Cloud Run** e **GitHub**.

---

## 🚀 Tecnologias

- **Frontend:** React 18 + Vite 5 + Tailwind CSS
- **Ícones & UI:** Lucide React + Radix UI (shadcn/ui)
- **Roteamento:** React Router DOM (com suporte a todas as 17 rotas públicas e administrativas)
- **Gerenciamento de Estado/Queries:** TanStack React Query v5
- **Motor de Dados Standalone:** `src/api/base44Client.js` (compatível com os schemas do projeto original, persistência no localStorage e dados pré-carregados das entidades)
- **Containerização:** Dockerfile multi-stage com Nginx Alpine para Cloud Run
- **Hospedagem:** Firebase Hosting (`.web.app`) e suporte a domínio personalizado na Hostinger (`victorefranco.com.br`)

---

## 📁 Estrutura do Projeto

```text
cool-carson/ (portal-diferentaco)
├── Dockerfile                   # Build de produção e servidor Nginx (porta 8080)
├── nginx.conf                   # Configuração Nginx para SPA e cache
├── firebase.json                # Configuração do Firebase Hosting
├── package.json                 # Dependências e scripts
├── vite.config.js               # Configuração do Vite com aliases
├── tailwind.config.js           # Paleta de cores oficial (Dourado #8B6F47, Vermelho #F4231E, Escuro #0A0A0A)
├── public/
│   ├── favicon.png              # Favicon oficial
│   ├── logo.png                 # Logo oficial Victor & Franco
│   └── assets/media/            # 37 fotos, vídeos, capas e logos originais salvos localmente
└── src/
    ├── api/
    │   ├── base44Client.js      # Cliente de banco de dados e autenticação 100% autônomo
    │   └── data/                # Cópia 100% original dos dados de todas as 14 entidades
    │       ├── Event.json
    │       ├── Photo.json
    │       ├── FanPhoto.json
    │       ├── Partner.json
    │       ├── Video.json
    │       ├── SiteConfig.json
    │       ├── FeaturedTrack.json
    │       ├── NewsletterSubscriber.json
    │       ├── Testimonial.json
    │       ├── Poll.json
    │       └── User.json
    ├── components/
    │   ├── Layout.jsx           # Cabeçalho, navegação, rodapé e painel do administrador
    │   ├── home/                # Componentes exclusivos da página inicial
    │   └── ui/                  # Componentes reutilizáveis (Card, Button, Dialog, Select, etc.)
    └── pages/                   # Todas as 17 páginas (Início, Agenda, Música, Vídeos, Galeria, etc.)
```

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### Instalação e Execução
```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Gerar build de produção
npm run build
```

---

## 🔐 Painel Administrativo

O portal conta com um painel de administração acessível diretamente pelo rodapé do site:
1. Clique no ícone de engrenagem/painel no rodapé (ao lado de Victor & Franco).
2. Clique em **Fazer Login como Admin**.
3. Insira o e-mail: `tofani100@gmail.com` e sua senha.
4. Uma vez logado, você pode ativar o **Modo Edição** diretamente nas páginas públicas ou acessar as telas de gerenciamento:
   - `/admin/eventos`: Cadastrar e gerenciar shows.
   - `/admin/videos`: Adicionar novos clipes e shorts do YouTube.
   - `/admin/fotos`: Adicionar e organizar fotos da galeria (Imprensa e Na Estrada).
   - `/admin/fotos-fas`: Aprovar ou recusar fotos enviadas pelo público.
   - `/admin/depoimentos`: Moderar depoimentos de fãs e contratantes.
   - `/admin/enquetes`: Criar e ativar enquetes para os fãs.
   - `/admin/newsletter`: Consultar os contatos cadastrados para novidades.

---

## 🌐 Deploy no Firebase Hosting (`.web.app`)

1. Fazer login no Firebase (se necessário):
   ```bash
   npx firebase login
   ```
2. Vincular o projeto:
   ```bash
   npx firebase use <PROJECT_ID>
   ```
3. Fazer deploy:
   ```bash
   npm run build
   npx firebase deploy --only hosting
   ```

---

## ☁️ Deploy no Google Cloud Run

Para rodar via container no Cloud Run:
```bash
gcloud run deploy portal-diferentaco \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated
```

---

## 🔗 Configuração de Domínio Personalizado na Hostinger (`victorefranco.com.br`)

Assim que o projeto estiver publicado no Firebase Hosting:
1. No [Console do Firebase](https://console.firebase.google.com/), acesse **Hosting** -> **Adicionar domínio personalizado**.
2. Digite `victorefranco.com.br` e `www.victorefranco.com.br`.
3. O Firebase fornecerá os registros DNS:
   - **Registro A**: Apontando para os IPs do Firebase (ex: `199.36.158.100`).
   - **Registro TXT**: Para verificação do domínio.
4. No painel da **Hostinger** (Zona DNS de `victorefranco.com.br`):
   - Adicione os registros informados pelo Firebase.
   - O certificado SSL é emitido automaticamente pelo Firebase Hosting após a propagação do DNS!
