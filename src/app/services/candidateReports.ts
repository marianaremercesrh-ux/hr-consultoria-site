import type { EtapaProcesso } from "../types/candidates";
import { etapaLabel } from "../types/candidates";

export type CandidateReportKind = "resumido" | "completo";
export type CandidateReportRow = { nome:string; vaga:string; status:string; cadastro:string; analise:string; telefone?:string; email?:string; linkedin?:string };
const safeFileDate = () => new Date().toISOString().slice(0,19).replace(/[T:]/g,"-");

function downloadBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url)}
function cleanDisplayText(value:string){return value.replace(/movéis/giu,"móveis").replace(/vou encaminhar o currículo dele para você avaliar[.!]?/giu,"").replace(/\s{2,}/g," ").trim()}
function shortText(value:string){const clean=cleanDisplayText(value);return clean.length>240?`${clean.slice(0,237).trimEnd()}…`:clean}
async function assetDataUrl(path:string){const response=await fetch(path);if(!response.ok)throw new Error(`Não foi possível carregar o recurso ${path}.`);const blob=await response.blob();return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}

async function svgDataUrlToPng(svgDataUrl:string){return await new Promise<string>((resolve,reject)=>{const image=new Image();image.onload=()=>{const canvas=document.createElement("canvas");canvas.width=1448;canvas.height=1086;const context=canvas.getContext("2d");if(!context){reject(new Error("Não foi possível preparar a logo do relatório."));return}context.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/png"))};image.onerror=()=>reject(new Error("Não foi possível renderizar a logo do relatório."));image.src=svgDataUrl})}

export async function downloadCandidatesPdf(rows:CandidateReportRow[],filters:string[],kind:CandidateReportKind,includeContact:boolean){
  const [{jsPDF},logoSvg,fontData]=await Promise.all([import("jspdf"),assetDataUrl("/assets/hr-consultoria-logo-relatorio.svg"),assetDataUrl("/fonts/NotoSans-Variable.ttf")]);
  const logo=await svgDataUrlToPng(logoSvg);
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true,putOnlyUsedFonts:true});
  doc.addFileToVFS("NotoSans.ttf",fontData.split(",")[1]);doc.addFont("NotoSans.ttf","NotoSans","normal");doc.setFont("NotoSans","normal");
  const width=210,height=297,left=14,right=14,bottom=17,contentWidth=width-left-right;
  const emittedAt=new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"medium"}).format(new Date());
  const filterText=filters.length?filters.join(" • "):"Nenhum filtro aplicado";
  let y=0;
  function header(first:boolean){doc.setFillColor(5,38,86);doc.rect(0,0,width,28,"F");doc.addImage(logo,"PNG",left,4,24,18,undefined,"FAST");doc.setTextColor(255);doc.setFontSize(13);doc.text("Relatório de candidatos",43,15);y=35;if(first){doc.setTextColor(70);doc.setFontSize(8.5);doc.text(`Tipo: Relatório ${kind}`,left,y);y+=5;doc.text(`Emitido em: ${emittedAt}`,left,y);y+=5;const filterLines=doc.splitTextToSize(`Filtros: ${filterText}`,contentWidth);doc.text(filterLines,left,y);y+=filterLines.length*4.2;doc.text(`Total de candidatos: ${rows.length}`,left,y);y+=8}}
  function newPage(){doc.addPage();header(false)}
  header(true);
  rows.forEach((row,index)=>{
    const analysis=kind==="resumido"?shortText(row.analise):cleanDisplayText(row.analise);
    const analysisLines:string[]=doc.splitTextToSize(analysis||"Nenhuma análise registrada.",contentWidth-12);
    const contactLines=includeContact?[row.telefone&&`Telefone: ${row.telefone}`,row.email&&`E-mail: ${row.email}`,row.linkedin&&`LinkedIn: ${row.linkedin}`].filter(Boolean) as string[]:[];
    if(y+38>height-bottom)newPage();
    let remaining=[...analysisLines],first=true;
    while(remaining.length){
      const fixed=first?29:15;let capacity=Math.max(1,Math.floor((height-bottom-y-fixed)/4.2));if(capacity<3&&remaining.length>capacity){newPage();capacity=Math.max(1,Math.floor((height-bottom-y-fixed)/4.2))}
      const lines=remaining.splice(0,capacity);const blockHeight=fixed+lines.length*4.2;
      doc.setDrawColor(210);doc.setFillColor(index%2===0?248:255,249,250);doc.roundedRect(left,y,contentWidth,blockHeight-3,2,2,"FD");doc.setFillColor(212,166,42);doc.rect(left,y,2.2,blockHeight-3,"F");doc.setTextColor(5,38,86);doc.setFontSize(first?11.5:9.5);doc.text(first?row.nome:`${row.nome} — continuação`,left+6,y+7);
      let textY=y+12;if(first){doc.setTextColor(55);doc.setFontSize(8.5);doc.text(`Vaga: ${row.vaga}`,left+6,textY,{maxWidth:112});doc.text(`Status: ${row.status}`,left+122,textY,{maxWidth:58});textY+=5;doc.text(`Cadastro: ${row.cadastro}`,left+6,textY);textY+=6;doc.setTextColor(5,38,86);doc.text(kind==="resumido"?"Resumo":"Resumo da entrevista/análise",left+6,textY);textY+=4.5}else{textY+=1}
      doc.setTextColor(55);doc.setFontSize(8.5);doc.text(lines,left+6,textY);y+=blockHeight;first=false;if(remaining.length)newPage();
    }
    if(contactLines.length){const contactHeight=12+contactLines.length*4.5;if(y+contactHeight>height-bottom)newPage();doc.setDrawColor(210);doc.roundedRect(left,y,contentWidth,contactHeight-2,2,2,"S");doc.setTextColor(5,38,86);doc.setFontSize(8.5);doc.text("Dados de contato",left+6,y+6);let contactY=y+10.5;doc.setTextColor(55);contactLines.forEach(line=>{doc.text(line,left+6,contactY,{maxWidth:contentWidth-12});contactY+=4.5});y+=contactHeight}
    y+=3;
  });
  const pages=doc.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setDrawColor(212,166,42);doc.line(left,height-12,width-right,height-12);doc.setTextColor(80);doc.setFont("NotoSans","normal");doc.setFontSize(8);doc.text(`Página ${page} de ${pages}`,width-right,height-7,{align:"right"})}
  doc.save(`relatorio-candidatos-${kind}-${safeFileDate()}.pdf`)
}

export async function downloadCandidatesExcel(rows:CandidateReportRow[],kind:CandidateReportKind,includeContact:boolean){
  const ExcelJS=await import("exceljs");const workbook=new ExcelJS.Workbook();workbook.creator="HR Consultoria de RH";workbook.created=new Date();const sheet=workbook.addWorksheet("Candidatos",{views:[{state:"frozen",ySplit:1}]});
  const columns:Array<{header:string;key:keyof CandidateReportRow;width:number}>=[{header:"Nome",key:"nome",width:28},{header:"Vaga",key:"vaga",width:38},{header:"Status atual",key:"status",width:28},{header:"Data de cadastro",key:"cadastro",width:18},{header:kind==="resumido"?"Resumo curto":"Resumo da entrevista/análise",key:"analise",width:65}];
  if(includeContact)columns.push({header:"Telefone",key:"telefone",width:20},{header:"LinkedIn",key:"linkedin",width:38});sheet.columns=columns;rows.forEach(row=>sheet.addRow({...row,analise:kind==="resumido"?shortText(row.analise):cleanDisplayText(row.analise)}));sheet.autoFilter={from:"A1",to:`${String.fromCharCode(64+columns.length)}${rows.length+1}`};const header=sheet.getRow(1);header.font={bold:true,color:{argb:"FFFFFFFF"}};header.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF052656"}};header.height=24;sheet.eachRow((row,index)=>{row.alignment={vertical:"top",wrapText:true};if(index>1&&index%2===1)row.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFF5F7FA"}}});const output=await workbook.xlsx.writeBuffer();downloadBlob(new Blob([output as ArrayBuffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),`relatorio-candidatos-${kind}-${safeFileDate()}.xlsx`)
}
export function reportStatus(stage?:EtapaProcesso){return stage?etapaLabel(stage):"Sem processo"}
