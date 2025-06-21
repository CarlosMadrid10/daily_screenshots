# 🖼️ Daily Screenshots Automation

Este projeto realiza **capturas automáticas de tela** de um site diariamente às 23:50 ou sob demanda. Ele simula uma janela do navegador Chrome com aparência do GNOME/Ubuntu e é ideal para comprovação de **veiculação de publicidades** e monitoramento visual de sites.

---

## ✨ Funcionalidades

- Captura screenshots em resolução personalizada (ex.: 1080x1920).
- Interface visual simulando navegador Chrome com barra do Ubuntu.
- Oculta elementos como modais, banners e popups automaticamente.
- Organiza os prints por ano e mês: `screenshots/2025/06/2025-06-21 1750490319199.png`.
- Arquivo `specs.json` define as configurações de forma flexível.

---

## 📁 Estrutura do Projeto

```
/
├── index.js            # Script principal
├── specs.json          # Configuração de URL, tamanho, etc.
├── icons/              # Ícones SVG da interface GNOME simulada
│   ├── apps.svg
│   ├── wifi.svg
│   ├── brand.svg
│   └── power.svg
└── screenshots/
    └── [ano]/
        └── [mês]/
            └── [data timestamp].png
```

---

## ⚙️ Como Usar

### 1. Instalar dependências:

```bash
npm install
```

### 2. Configurar o arquivo `specs.json`:

```json
{
  "url": "https://exemplo.com",
  "width": 1180,
  "height": 2360,
  "headless": false,
  "fullPage": false,
  "hideSelectors": [
    ".iubenda-cs-container",
    ".iubenda-cs-overlay",
    ".toast-whatsapp"
  ]
}
```

### 3. Executar manualmente:

```bash
node index.js
```

### 4. Agendar via `cron` (Linux/macOS):

Abra o agendador com:

```bash
crontab -e
```

Adicione esta linha para rodar às 23:50:

```cron
50 23 * * * /usr/bin/node /caminho/para/o/index.js
```

---

## 📖 Explicação do `specs.json`

| Campo           | Tipo     | Descrição                                                                 |
|----------------|----------|---------------------------------------------------------------------------|
| `url`          | string   | URL do site a ser capturado. Ex: `"https://exemplo.com"`                  |
| `width`        | number   | Largura da tela em pixels. Ex: `1180`                                     |
| `height`       | number   | Altura da tela em pixels. Ex: `2360`                                      |
| `headless`     | boolean  | Se `true`, roda em modo invisível (sem janela). `false` mostra a janela.  |
| `fullPage`     | boolean  | Se `true`, tira screenshot da página inteira (scroll). `false` usa altura.|
| `hideSelectors`| string[] | Lista de seletores CSS que serão ocultos antes do print.                  |

---

## 💡 Casos de uso

- Documentar publicações ou anúncios.
- Garantir que conteúdo foi exibido em determinada data.
- Arquivar visualmente páginas de terceiros.

---

## 🛡️ Licença

Este projeto está licenciado sob a licença MIT.
