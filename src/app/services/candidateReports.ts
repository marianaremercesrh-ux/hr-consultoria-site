import type { EtapaProcesso } from "../types/candidates";
import { etapaLabel } from "../types/candidates";

export type CandidateReportRow = {
  nome: string;
  telefone: string;
  cidade: string;
  linkedin: string;
  processo: string;
  status: string;
  cadastro: string;
  observacoes: string;
};

const HEADERS = ["Nome", "Telefone", "Cidade", "LinkedIn", "Vaga ou processo", "Status atual", "Data de cadastro", "Observações ou análise"];
const safeFileDate = () => new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

async function logoDataUrl() {
  const response = await fetch("/assets/hr-consultoria-logo.png");
  if (!response.ok) throw new Error("Não foi possível carregar a logo do relatório.");
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
}

export async function downloadCandidatesPdf(rows: CandidateReportRow[], filters: string[]) {
  const [{ jsPDF }, autoTableModule, logo] = await Promise.all([import("jspdf"), import("jspdf-autotable"), logoDataUrl()]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const emittedAt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date());
  const filterText = filters.length ? filters.join(" • ") : "Nenhum filtro aplicado";
  doc.addImage(logo, "PNG", 14, 9, 34, 15, undefined, "FAST");
  doc.setTextColor(5, 38, 86); doc.setFontSize(15); doc.setFont("helvetica", "bold"); doc.text("HR Consultoria de RH", 53, 15);
  doc.setFontSize(20); doc.text("Relatório de candidatos", 14, 34);
  doc.setTextColor(70); doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(`Emitido em: ${emittedAt}`, 14, 41); doc.text(`Filtros: ${filterText}`, 14, 47, { maxWidth: 268 }); doc.text(`Total de candidatos encontrados: ${rows.length}`, 14, 53);
  autoTable(doc, {
    startY: 58, head: [HEADERS], body: rows.map((row) => [row.nome,row.telefone,row.cidade,row.linkedin,row.processo,row.status,row.cadastro,row.observacoes]),
    theme: "grid", styles: { font: "helvetica", fontSize: 7.2, cellPadding: 2, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: [5,38,86], textColor: [255,255,255], fontStyle: "bold" }, alternateRowStyles: { fillColor: [245,247,250] },
    columnStyles: { 0:{cellWidth:30},1:{cellWidth:23},2:{cellWidth:22},3:{cellWidth:34},4:{cellWidth:35},5:{cellWidth:29},6:{cellWidth:23},7:{cellWidth:69} },
    margin: { left: 10, right: 10, bottom: 13 },
    didDrawPage: ({ pageNumber }) => { const pages = doc.getNumberOfPages(); doc.setFontSize(8); doc.setTextColor(90); doc.text(`Página ${pageNumber} de ${pages}`, 287, 202, { align: "right" }); },
  });
  const totalPages = doc.getNumberOfPages();
  for (let page=1;page<=totalPages;page++){doc.setPage(page);doc.setFillColor(212,166,42);doc.rect(10,205,277,1,"F");doc.setFontSize(8);doc.setTextColor(90);doc.text(`Página ${page} de ${totalPages}`,287,202,{align:"right"});}
  doc.save(`relatorio-candidatos-${safeFileDate()}.pdf`);
}

export async function downloadCandidatesExcel(rows: CandidateReportRow[]) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook(); workbook.creator = "HR Consultoria de RH"; workbook.created = new Date();
  const sheet = workbook.addWorksheet("Candidatos", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [
    {header:"Nome",key:"nome",width:28},{header:"Telefone",key:"telefone",width:18},{header:"Cidade",key:"cidade",width:20},{header:"LinkedIn",key:"linkedin",width:35},
    {header:"Vaga ou processo seletivo relacionado",key:"processo",width:38},{header:"Status atual",key:"status",width:28},{header:"Data de cadastro",key:"cadastro",width:18},{header:"Observações ou análise",key:"observacoes",width:55},
  ];
  rows.forEach((row) => sheet.addRow(row));
  sheet.autoFilter = { from: "A1", to: `H${rows.length + 1}` };
  const header = sheet.getRow(1); header.font = { bold:true, color:{argb:"FFFFFFFF"} }; header.fill = { type:"pattern", pattern:"solid", fgColor:{argb:"FF052656"} }; header.alignment = { vertical:"middle" }; header.height = 24;
  sheet.eachRow((row, index) => { row.alignment = { vertical:"top", wrapText:true }; if(index>1&&index%2===1) row.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFF5F7FA"}}; });
  const output = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([output as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `relatorio-candidatos-${safeFileDate()}.xlsx`);
}

export function reportStatus(stage?: EtapaProcesso) { return stage ? etapaLabel(stage) : "Sem processo"; }
