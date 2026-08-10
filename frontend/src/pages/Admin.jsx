import { useEffect, useState } from "react";
import { api } from "../api";

export default function Admin() {
  const [duplicidades, setDuplicidades] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.duplicidades().then(setDuplicidades).catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div>
      <h1>Administracao - Possiveis duplicidades</h1>
      <p>Match exato de CPF/CNPJ (escopo do MVP - ver IDEIA.md).</p>
      {duplicidades.length === 0 && <p>Nenhuma duplicidade encontrada nos dados atuais.</p>}
      {duplicidades.map((d) => (
        <div className="duplicidade-cartao" key={d.documento}>
          <strong>Documento {d.documento}</strong> - confianca {d.confianca}%
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Proprietarios envolvidos</th>
              </tr>
            </thead>
            <tbody>
              {d.cadastros.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.telefone}</td>
                  <td>{c.proprietariosEnvolvidos.join(", ") || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
