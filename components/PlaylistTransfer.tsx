"use client";
import {useRef,useState} from "react";
import {Download,Upload} from "lucide-react";

export type PortablePlaylist={name:string;trackIds:string[]};
type Props={playlists:PortablePlaylist[];knownTrackIds:string[];onImport:(items:PortablePlaylist[])=>void};
const MAX_FILE_BYTES=1024*1024;
const MAX_PLAYLISTS=100;
const MAX_TRACKS=5000;
const signature=(p:PortablePlaylist)=>JSON.stringify([p.name.trim().toLocaleLowerCase(),[...new Set(p.trackIds)].sort()]);

export default function PlaylistTransfer({playlists,knownTrackIds,onImport}:Props){
 const input=useRef<HTMLInputElement>(null);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const exportPlaylists=()=>{
  const data={format:"drawing-music-playlists",version:1,exportedAt:new Date().toISOString(),playlists:playlists.map(p=>({name:p.name,trackIds:p.trackIds}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  const link=document.createElement("a");
  link.href=url;link.download="drawing-music-playlists.json";document.body.appendChild(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage(`${playlists.length}개 재생목록을 백업했어요.`);
 };
 const importPlaylists=async(file:File)=>{
  setBusy(true);setMessage("");
  try{
   if(file.size>MAX_FILE_BYTES)throw new Error("파일 크기는 1MB 이하여야 해요.");
   const parsed:unknown=JSON.parse(await file.text());
   if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("올바른 백업 파일이 아니에요.");
   const data=parsed as Record<string,unknown>;
   if(data.format!=="drawing-music-playlists"||data.version!==1||!Array.isArray(data.playlists))throw new Error("지원하지 않는 재생목록 형식이에요.");
   if(data.playlists.length>MAX_PLAYLISTS)throw new Error("한 번에 최대 100개까지 가져올 수 있어요.");
   const known=new Set(knownTrackIds);
   let unavailable=0;
   let repeatedIds=0;
   let duplicated=0;
   const imported:PortablePlaylist[]=data.playlists.map((item:unknown)=>{
    if(!item||typeof item!=="object"||Array.isArray(item))throw new Error("재생목록 데이터가 올바르지 않아요.");
    const p=item as Record<string,unknown>;
    if(typeof p.name!=="string"||!p.name.trim()||p.name.length>50||!Array.isArray(p.trackIds)||p.trackIds.length>MAX_TRACKS||!p.trackIds.every(id=>typeof id==="string"))throw new Error("재생목록 이름 또는 곡 목록이 올바르지 않아요.");
    const ids=[...new Set(p.trackIds as string[])];
    repeatedIds+=(p.trackIds as string[]).length-ids.length;
    unavailable+=ids.filter(id=>!known.has(id)).length;
    return {name:p.name.trim(),trackIds:ids.filter(id=>known.has(id))};
   });
   const knownSignatures=new Set(playlists.map(signature));
   const unique=imported.filter(p=>{
    const sig=signature(p);
    if(knownSignatures.has(sig)){duplicated++;return false;}
    knownSignatures.add(sig);return true;
   });
   if(unique.length)onImport(unique);
   setMessage(`${unique.length}개 재생목록을 추가했어요.${duplicated?` 중복 ${duplicated}개는 건너뛰었어요.`:""}${unavailable?` 라이브러리에 없는 ${unavailable}곡은 제외했어요.`:""}${repeatedIds?` 반복된 곡 ID ${repeatedIds}개를 정리했어요.`:""}`);
  }catch(error){setMessage(error instanceof Error?error.message:"파일을 읽지 못했어요.");}
  finally{setBusy(false);if(input.current)input.current.value="";}
 };
 return <div className="classic-playlist-transfer">
  <div className="classic-playlist-transfer-actions">
   <button type="button" onClick={exportPlaylists} disabled={!playlists.length}><Download size={16}/> JSON 백업</button>
   <button type="button" onClick={()=>input.current?.click()} disabled={busy}><Upload size={16}/> 백업 가져오기</button>
   <input ref={input} type="file" accept=".json,application/json" hidden aria-label="재생목록 백업 파일 선택" onChange={event=>{const file=event.target.files?.[0];if(file)void importPlaylists(file);}}/>
  </div>
  <p>드뮤직 백업 파일만 지원해요. 가져온 목록은 기존 목록에 추가됩니다.</p>
  {message&&<p role="status" aria-live="polite">{message}</p>}
 </div>;
}
