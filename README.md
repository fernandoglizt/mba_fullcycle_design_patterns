# Fechamento de faturamento

Use Node.js, Yarn e PostgreSQL local. O adapter usa o banco `app`, na porta 5432, com o usuário `postgres` e a senha local `123456`.

```sh
yarn install --frozen-lockfile
psql -v ON_ERROR_STOP=1 -U postgres -d app -f create.sql
TZ=America/Sao_Paulo yarn ts-node src/main.ts
```

O script `create.sql` recria o schema `branas` e aplica os dados de exemplo. Use um banco de desenvolvimento com permissão para instalar a extensão `uuid-ossp`.

Com a API rodando, execute os testes em outro terminal.

```sh
TZ=America/Sao_Paulo yarn jest --runInBand
```

- `POST /generate_invoices` simula as faturas.
- `POST /close_invoicing` substitui o lote do mês, ano e regime em uma única transação. O resumo sai no evento `InvoicesClosed`.
- `GET /invoices?month=1&year=2022&type=accrual` lista as faturas do lote persistido por data.

As três rotas aceitam `format=csv` no corpo ou na query, conforme a rota. Sem o campo, a resposta é JSON. Cada linha do CSV contém a data e o valor, separados por ponto e vírgula. O callback de `HttpServer.on` recebe parâmetros de rota, corpo, cabeçalhos e query, nessa ordem.
