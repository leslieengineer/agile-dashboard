import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
export type SessionKind = 'web' | 'mobile'
export interface Session { hash:string; csrf:string; username:string; kind:SessionKind; created:number; lastSeen:number }
export class SessionStore { private sessions=new Map<string,Session>(); private file:string; constructor(private dir:string,private ttlMs:number,private idleMs:number,private maxPerUserAndKind=5){this.file=join(dir,'sessions.json')}
 async load(){await mkdir(this.dir,{recursive:true});try{const rows=JSON.parse(await readFile(this.file,'utf8')) as Array<Session & {kind?:SessionKind}>;for(const row of rows){const s:Session={...row,kind:row.kind??'web'};this.sessions.set(s.hash,s)}}catch{}}
 private digest(v:string){return createHash('sha256').update(v).digest('hex')}
<<<<<<< HEAD
 async create(username:string){const sid=randomBytes(32).toString('base64url');const now=Date.now();const s={hash:this.digest(sid),csrf:randomBytes(32).toString('base64url'),username,created:now,lastSeen:now};this.sessions.set(s.hash,s);await this.save();return{sid,session:s}}
 get(sid:string|undefined){if(!sid)return;const s=this.sessions.get(this.digest(sid));if(!s)return;const now=Date.now();if(now-s.created>this.ttlMs||now-s.lastSeen>this.idleMs){this.sessions.delete(s.hash);void this.save();return}s.lastSeen=now;return s}
=======
 async create(username:string,kind:SessionKind='web'){const same=[...this.sessions.values()].filter(s=>s.username===username&&s.kind===kind).sort((a,b)=>a.created-b.created);for(const s of same.slice(0,Math.max(0,same.length-this.maxPerUserAndKind+1)))this.sessions.delete(s.hash);const sid=randomBytes(32).toString('base64url');const now=Date.now();const s:Session={hash:this.digest(sid),csrf:randomBytes(32).toString('base64url'),username,kind,created:now,lastSeen:now};this.sessions.set(s.hash,s);await this.save();return{sid,session:s}}
 get(sid:string|undefined,kind?:SessionKind){if(!sid)return;const s=this.sessions.get(this.digest(sid));if(!s||kind&&s.kind!==kind)return;const now=Date.now();if(now-s.created>this.ttlMs||now-s.lastSeen>this.idleMs){this.sessions.delete(s.hash);void this.save();return}s.lastSeen=now;return s}
>>>>>>> 0b4bb7ca36fba1a222802515ec3128bac1cb9bf4
 hasHash(hash:string){const s=this.sessions.get(hash);return !!s&&Date.now()-s.created<=this.ttlMs&&Date.now()-s.lastSeen<=this.idleMs}
 async revoke(sid:string|undefined){if(sid)this.sessions.delete(this.digest(sid));await this.save()}
 csrfValid(s:Session,token:string|undefined){if(!token||s.kind!=='web')return false;const a=Buffer.from(s.csrf),b=Buffer.from(token);return a.length===b.length&&timingSafeEqual(a,b)}
 expiresAt(s:Session){return new Date(Math.min(s.created+this.ttlMs,s.lastSeen+this.idleMs)).toISOString()}
 private async save(){const tmp=`${this.file}.tmp`;await writeFile(tmp,JSON.stringify([...this.sessions.values()]),{mode:0o600});await rename(tmp,this.file)} }
