import { useEffect, useState } from "react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { ROTULO_ALERTA_RENOVACAO } from "../data/rotulos";
import { formatarDataBR } from "../utils/formatarData";
import Badge from "../components/ui/Badge";

export default function MeusClientes() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState(null);
  const { proprietarioId } = useProprietarioAtual();

  useEffect(() => {
    api.meusClientes(proprietarioId).then(setClientes).catch((e) => setErro(e.message));
  }, [proprietarioId]);

  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div>
      <h1>Meus Clientes</h1>
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Produto</th>
            <th>Inicio</th>
            <th>Renovacao</th>
            <th>Alerta</th>
            <th>Contato</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.negocioId}>
              <td>{c.nome}</td>
              <td>{c.tipo}</td>
              <td>{c.produto}</td>
              <td>{formatarDataBR(c.dataInicio)}</td>
              <td>{formatarDataBR(c.dataRenovacao)}</td>
              <td>
                {c.alerta ? (
                  <Badge tipo={c.alerta}>{ROTULO_ALERTA_RENOVACAO[c.alerta]}</Badge>
                ) : (
                  "-"
                )}
              </td>
              <td>{c.telefone ? "WhatsApp" : c.email ? "E-mail" : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
