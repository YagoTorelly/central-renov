import { useEffect, useState } from "react";
import { api } from "../api";
import { useProprietarioAtual } from "../hooks/useProprietarioAtual";
import { formatarDataBR } from "../utils/formatarData";

const ROTULO_TIPO = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  email: "E-mail",
  lembrete: "Lembrete adiado",
};

export default function Atividades() {
  const [atividades, setAtividades] = useState([]);
  const [erro, setErro] = useState(null);
  const { proprietarioId } = useProprietarioAtual();

  useEffect(() => {
    api.atividades(proprietarioId).then(setAtividades).catch((e) => setErro(e.message));
  }, [proprietarioId]);

  if (erro) return <p className="erro">{erro}</p>;

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1>Atividades</h1>
          <p>Histórico de contatos registrados a partir da tela de Leads Parados.</p>
        </div>
      </div>

      {atividades.length === 0 ? (
        <div className="estado-vazio">
          <span className="icone">📞</span>
          Nenhum contato registrado ainda. Registre pela tela de Leads Parados.
        </div>
      ) : (
        <div className="lista-atividades">
          {atividades.map((a) => (
            <div className="atividade-linha" key={a.id}>
              <span className="atividade-data">{formatarDataBR(a.data)}</span>
              <span>{a.cliente}</span>
              <span className="atividade-tipo">{ROTULO_TIPO[a.tipo] || a.tipo}</span>
              <span>{a.resultado || "-"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
