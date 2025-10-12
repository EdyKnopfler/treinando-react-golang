# Treinando React e Golang

Buscando me manter afiado, apenas. Simulando situações do dia-a-dia e resolvendo os problemas com o código mais limpo possível.

## Diário de bordo

### Dia 1: 

- Estilos desacoplados com _LESS modules_
  - Gosto do LESS e similares para codar seletores complexos
  - O uso dos módulos cria automaticamente classes contextuais onde são aplicados, evitando a famigerada interferência de estilos
- Informação de autenticação no front-end e proteção das rotas e componentes
  - Estou acostumado a pensar em JavaScript ao mexer com React, tipar tudo (TypeScript) era mais coisa de Angular...
  
### Dia 2:

- Uma simples backend de autenticação em Go, com access token e refresh token
  - Refresh token é trafegado somente via cookie HttpOnly, Secure e SameSite
  - Variáveis de ambiente configuram o domínio e os segredos.
  - Contêiner Docker auxilia a replicar um ambiente de desenvolvimento Go.
- Conectar as duas partes fica para o próximo final de semana!