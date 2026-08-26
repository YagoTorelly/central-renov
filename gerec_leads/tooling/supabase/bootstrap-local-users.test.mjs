import test from "node:test";
import assert from "node:assert/strict";

import { LOCAL_USERS, generatePassword } from "./bootstrap-local-users.mjs";

test("define um administrador e quatro vendedores na ordem da fila", () => {
  assert.equal(LOCAL_USERS.filter((user) => user.role === "admin").length, 1);
  assert.deepEqual(
    LOCAL_USERS.filter((user) => user.role === "seller").map((user) => user.fullName),
    ["Renato", "Sandra", "Jessica", "Nelma"],
  );
  assert.deepEqual(
    LOCAL_USERS.filter((user) => user.role === "seller").map((user) => user.position),
    [1, 2, 3, 4],
  );
});

test("senha local aleatória atende o contrato mínimo", () => {
  const password = generatePassword();
  assert.equal(password.length, 20);
  assert.match(password, /[a-z]/);
  assert.match(password, /[A-Z]/);
  assert.match(password, /\d/);
  assert.match(password, /[^A-Za-z\d]/);
});
