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
      <div className="cabecalho-pagina">
        <div>
          <h1>Administração — Possíveis duplicidades</h1>
          <p>Cadastros com o mesmo CPF/CNPJ em proprietários diferentes (match exato, ver IDEIA.md).</p>
        </div>
      </div>

      {duplicidades.length === 0 ? (
        <div className="estado-vazio">
          <span className="icone">✅</span>
          Nenhuma duplicidade encontrada nos dados atuais.
        </div>
      ) : (
        duplicidades.map((d) => (
          <div className="duplicidade-cartao" key={d.documento}>
            <strong>Documento {d.documento}</strong> — confiança {d.confianca}%
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Proprietários envolvidos</th>
                </tr>
              </thead>
              <tbody>
                {d.cadastros.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nome}</td>
                    <td>{c.telefone || "-"}</td>
                    <td>{c.proprietariosEnvolvidos.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
