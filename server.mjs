import http from 'node:http';
import {createReadStream,existsSync,statSync} from 'node:fs';
import {resolve,sep,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'dist');
const port=5182,url=`http://127.0.0.1:${port}/`;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let path;try{path=resolve(root,'.'+decodeURIComponent(new URL(req.url,url).pathname));}catch{res.writeHead(400);res.end();return;}
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
 if(path===root)path=resolve(root,'index.html');
 if(!existsSync(path)||!statSync(path).isFile()){res.writeHead(404);res.end('Arquivo nao encontrado');return;}
 res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});
 if(req.method==='HEAD'){res.end();return;}createReadStream(path).on('error',()=>res.destroy()).pipe(res);
});
server.on('error',error=>{console.error('Nao foi possivel iniciar o Poneko Studio:',error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',async()=>{
 console.log(`Poneko Studio: ${url}\nMantenha esta janela aberta enquanto usa o aplicativo.\nPara encerrar, pressione Ctrl+C.`);
 if(process.argv.includes('--check')){try{const r=await fetch(url);const html=await r.text();if(!r.ok||!html.includes('Poneko Studio'))throw Error('Pagina invalida');console.log('Verificacao local: OK');}catch(e){console.error(e);process.exitCode=1;}finally{server.close();}}
 if(process.argv.includes('--open'))execFile('rundll32.exe',['url.dll,FileProtocolHandler',url],error=>{if(error)console.log('Abra o endereco acima no navegador.');});
});
