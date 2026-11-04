import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root=path.resolve(import.meta.dirname,'..');
const rows=[];
for(const filename of readdirSync(path.join(root,'app')).filter(f=>f.endsWith('.tsx'))){
 const source=readFileSync(path.join(root,'app',filename),'utf8');
 const file=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(n){
  if(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n)){
   const opening=ts.isJsxElement(n)?n.openingElement:n;
   const tag=opening.tagName.getText(file);
   const attrs=Object.fromEntries(opening.attributes.properties.filter(p=>p.name).map(p=>[p.name.getText(file),p.initializer?.getText(file)??'true']));
   if(['button','input','select','textarea','summary','a','form'].includes(tag)||attrs.role==='"separator"'){
    let parent=n.parent,conditions=[],dynamic=false;
    while(parent&&!ts.isFunctionDeclaration(parent)){
     if(ts.isConditionalExpression(parent)||ts.isBinaryExpression(parent)&&parent.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken)conditions.push(parent.getText(file).slice(0,180));
     if(ts.isCallExpression(parent)&&parent.expression.getText(file).endsWith('.map'))dynamic=true;
     parent=parent.parent;
    }
    const pos=file.getLineAndCharacterOfPosition(n.getStart(file));
    const content=ts.isJsxElement(n)?n.children.map(c=>c.getText(file)).join(' ').replace(/\s+/g,' ').trim():'';
    rows.push({id:`${filename}:${pos.line+1}:${pos.character+1}`,file:`app/${filename}`,line:pos.line+1,tag,label:attrs['aria-label']??content.slice(0,260),attributes:attrs,conditional:conditions.length>0,dynamic,verification:'not-yet-classified',expectedOutcome:'requires explicit coverage mapping'});
   }
  }
  ts.forEachChild(n,visit);
 }
 visit(file);
}
const result={generatedAt:new Date().toISOString(),meaning:'Source control sites, not a claim of rendered coverage. Dynamic rows represent families whose data variants need separate validation.',controls:rows};
if(process.argv[2]){writeFileSync(path.resolve(process.argv[2]),JSON.stringify(result,null,2)+'\n');console.log(`Inventoried ${rows.length} control sites; detailed ledger saved.`);}else console.log(JSON.stringify(rows.map(({id,tag,label,dynamic})=>({id,tag,label,dynamic})),null,2));
