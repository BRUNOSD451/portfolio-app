# Portfolio Studio

Aplicativo React Native + Expo + TypeScript para gerenciar o portfólio. Abas Perfil, Tecnologias, Projetos e Conhecimento, com navegação Expo Router.

O app exige login administrativo. Crie a conta com `npm run admin:setup` dentro de `portfolioBackEnd`, depois entre com seu e-mail e senha. A sessão dura até oito horas e pode ser encerrada por **Sair da conta**. No celular, fica no SecureStore; na web, recarregar a página pede novo login. Não há cadastro público. [Configuração e limites](../portfolioBackEnd/SEGURANCA.md).

## Executar no celular

1. Inicie o backend na pasta `../portfolioBackEnd` com `npm run dev`.
2. Nesta pasta, execute `npm install` se necessário.
3. Copie `.env.example` para `.env` e troque o endereço pelo IP local do computador que roda a API, mantendo a porta 3000. Celular e computador devem estar na mesma rede. Não use localhost no celular. Sem variável, o app usa o hostname do navegador na web e tenta usar o host do Expo no celular.
4. Execute `npm start` e abra pelo Expo Go compatível com o SDK instalado. Para emulador Android, `npm run android`. Builds iOS locais exigem macOS; Expo Go pode ser usado pelo QR code.
5. Após mudar o endereço da API, reinicie o Expo.

## Funcionalidades

- Perfil do usuário 1: nome, descrição, e-mail, telefone, idade, link do currículo e foto (5 MB).
- Tecnologias: listar, criar, editar e excluir; imagem de até 5 MB.
- Conhecimento: consultar e substituir a base TXT da IA pela API Python.
- Projetos: buscar, criar, editar, excluir e selecionar tecnologias existentes. Após salvar, adicionar imagens/vídeos de até 50 MB, com ordem; visualizar e excluir cada mídia.
- Estados de carregamento, lista vazia, mensagens de erro, confirmação de exclusão e bloqueio de envios simultâneos.
- Se um upload falhar, a seleção é mantida para tentar novamente; o projeto já criado é reutilizado.

## Estrutura

- `src/main/App.tsx`: composição inicial do aplicativo.
- `src/app/`: entradas do Expo Router que encaminham para as telas e layouts.
- `src/resources/`: componentes, tema, rotas, transporte HTTP, tipos, hooks e utilitários compartilhados.
- `src/screens/screenProfile/`, `screenTechnologies/`, `screenProjects/`, `screenProject/` e `screenKnowledge/`: módulos organizados em `screen`, `services` e `styles`, com tipos específicos quando necessário.

Para alterar uma funcionalidade, comece pelo módulo correspondente em `src/screens/`. Use `src/resources/` para código compartilhado e mantenha `src/app/` como entradas de navegação.

A API de detalhes não fornece descrição nem IDs das tecnologias: o app combina a listagem de projetos com os detalhes e encontra IDs pelos nomes únicos das tecnologias. Não foi necessário alterar o backend.

## Verificação

`npm run typecheck`, `npm run lint` e `npx expo export --platform all`.

Depois de exportar, confira os fluxos de perfil, tecnologias, projetos e conhecimento no dispositivo. O TypeScript também verifica imports e parâmetros sem uso. A exportação não substitui a validação em um celular real.

## Limites da API atual

As APIs exigem sessão nas alterações e na gestão do conhecimento. Excluir registros não apaga os arquivos do Cloudinary. A API não oferece edição da ordem de uma mídia já salva; a ordem é informada ao adicionar o arquivo. `curriculo` é um link, não upload de PDF. Os uploads aceitam JPEG, PNG, WebP e GIF; vídeos MP4/MOV/WebM têm limite de 120 segundos e 50 MB. Respostas 429 indicam limite de frequência, cota ou operações simultâneas.

O alvo principal é Android/iOS. Para acessar pelo navegador, use `npm run web`. O backend permite por padrão, em desenvolvimento, localhost e 127.0.0.1 nas portas 8081, 8082 e 19006. Para IP da rede ou outra origem, configure `CORS_ORIGINS` no `.env` do backend (separadas por vírgula) e reinicie-o. Nunca coloque credenciais do banco ou Cloudinary no `.env` deste aplicativo: variáveis EXPO_PUBLIC são públicas.

Referências: https://docs.expo.dev/versions/v57.0.0/ e https://docs.expo.dev/router/introduction/.
