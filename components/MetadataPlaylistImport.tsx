"use client";
import {useState} from "react";
import type {DemoTrack} from "../lib/demoTracks";
import type {PortablePlaylist} from "./PlaylistTransfer";

/** A local, metadata-only CSV importer. It never accesses third-party APIs or audio. */
function parseCsv(text:string):string[][] {
 const rows:string[][]=[];let row:string[]=[];let cell="";let quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){
   if(quoted&&text[i+1]==='"'){cell+='"';i++;}
   else if(!quoted&&cell.trim()==="")quoted=true;
   else if(quoted)quoted=false;
   else throw new Error("CSV 따옴표 형식이 올바르지 않아요.");
  }else if(c===","&&!quoted){row.push(cell.trim());cell="";}
  else if((c==="\n"||c==="\r")&&!quoted){
   if(c==="\r"&&text[i+1]==="\n")i++;
   row.push(cell.trim());cell="";
   if(row.some(v=>v!==""))rows.push(row);
   row=[];
   if(rows.length>501)throw new Error("한 번에 500곡까지만 가져올 수 있어요.");
  }else cell+=c;
 }
 if(quoted)throw new Error("CSV에서 닫히지 않은 따옴표가 있어요.");
 row.push(cell.trim());
 if(row.some(v=>v!==""))rows.push(row);
 return rows;
}
type Props={tracks:DemoTrack[];onImport:(items:PortablePlaylist[])=>void};
export default function MetadataPlaylistImport({tracks,onImport}:Props){
 const [csv,setCsv]=useState("");
 const [name,setName]=useState("가져온 음악 목록");
 const [message,setMessage]=useState("");
 const [missing,setMissing]=useState<string[]>([]);
 const importCsv=()=>{
  try{
   if(csv.length>200_000)throw new Error("입력은 200KB 이하여야 해요.");
   const rows=parseCsv(csv.replace(/^\uFEFF/,""));
   if(rows.length<2)throw new Error("첫 줄에 title,artist 헤더를 포함한 CSV가 필요해요.");
   const header=rows[0].map(s=>s.toLowerCase().replace(/\s/g,""));
   const titleIndex=header.findIndex(s=>["title","track","song","곡명","제목"].includes(s));
   const artistIndex=header.findIndex(s=>["artist","아티스트","가수"].includes(s));
   if(titleIndex<0||artistIndex<0)throw new Error("CSV에 title,artist 열이 모두 필요해요.");
   const playable=new Set<string>(),unavailable:string[]=[];
   for(const row of rows.slice(1)){
    const title=(row[titleIndex]||"").trim(),artist=(row[artistIndex]||"").trim();
    if(!title||!artist)continue;
    const track=tracks.find(t=>t.title.toLocaleLowerCase()===title.toLocaleLowerCase()&&t.artist.toLocaleLowerCase()===artist.toLocaleLowerCase());
    if(track)playable.add(track.id);
    else unavailable.push(title+" · "+artist);
   }
   setMissing(unavailable.slice(0,10));
   if(!playable.size){setMessage(`재생 가능한 드뮤직 데모곡이 없어요. 일치하지 않는 곡 ${unavailable.length}개는 가져오지 않았어요.`);return;}
   onImport([{name:name.trim().slice(0,50)||"가져온 음악 목록",trackIds:[...playable]}]);
   setMessage(`드뮤직 데모곡 ${playable.size}곡을 재생목록으로 추가했어요. 일치하지 않는 곡 ${unavailable.length}개는 추가하지 않았어요.`);
  }catch(error){setMessage(error instanceof Error?error.message:"CSV를 읽지 못했어요.");setMissing([]);}
 };
 return <details className="dm-metadata-import">
  <summary>CSV 목록 가져오기 (메타데이터만)</summary>
  <p className="dm-feedback">본인이 내보낸 CSV의 <code>title,artist</code> 열을 붙여넣으세요. 일치하는 드뮤직 오리지널 데모곡만 재생목록에 추가해요. 다른 서비스의 음원을 다운로드하거나 재생 권한을 가져오지는 않아요.</p>
  <label>새 재생목록 이름<input className="dm-filter-input" value={name} maxLength={50} onChange={e=>setName(e.target.value)}/></label>
  <label>CSV 텍스트<textarea className="dm-filter-input" rows={5} maxLength={200000} value={csv} onChange={e=>setCsv(e.target.value)} placeholder={'title,artist\nAfterglow,Drawing Studio'}/></label>
  <button type="button" onClick={importCsv} disabled={!csv.trim()}>일치하는 데모곡만 추가</button>
  {message&&<p role="status" className="dm-feedback">{message}</p>}
  {missing.length>0&&<div className="dm-feedback"><strong>재생할 수 없는 외부 목록 예시</strong><ul>{missing.map((item,i)=><li key={i}>{item}</li>)}</ul></div>}
 </details>;
}
