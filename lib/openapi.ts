import {parseDocument} from 'yaml';
const methods=['get','post','put','patch','delete','head','options','trace'];
const object=(value:any)=>value&&typeof value==='object'&&!Array.isArray(value);
const cell=(value:any)=>String(value??'').replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ');
export async function openApiMarkdown(input:string){
 if(input.length>2_000_000)throw Error('The specification must be smaller than 2 MB.');
 const document=parseDocument(input,{uniqueKeys:true});if(document.errors.length)throw Error('Invalid JSON/YAML: '+document.errors[0].message);
 const spec=document.toJS({maxAliasCount:50});if(!object(spec)||!object(spec.paths))throw Error('Provide an OpenAPI object with a paths object.');
 if(spec.swagger||spec.openapi&&!/^3\.[01](?:\.|$)/.test(String(spec.openapi)))throw Error('This converter supports OpenAPI 3.0/3.1; Swagger 2 and other versions are not supported.');
 const warnings=new Set<string>();let budget=0;
 function resolve(value:any,seen=new Set<string>()):any{
  if(!object(value)||typeof value.$ref!=='string')return value;
  const ref=value.$ref;if(!ref.startsWith('#/')){warnings.add('External reference not fetched: '+ref);return {description:'Unresolved external reference: '+ref}}
  if(seen.has(ref)){warnings.add('Circular reference: '+ref);return {description:'Circular reference: '+ref}}
  if(seen.size>=16){warnings.add('Reference depth limit: '+ref);return {description:'Reference depth limit: '+ref}}
  let target:any=spec;try{for(const key of decodeURIComponent(ref.slice(2)).split('/').map(part=>part.replace(/~1/g,'/').replace(/~0/g,'~'))){if(!object(target)&&!Array.isArray(target)||!Object.prototype.hasOwnProperty.call(target,key))throw Error();target=target[key]}}catch{warnings.add('Missing reference: '+ref);return {description:'Missing reference: '+ref}}
  return resolve(target,new Set([...seen,ref]));
 }
 function type(value:any,depth=0,seen=new Set<any>()):string{
  if(++budget>50000)throw Error('Specification is too complex to render.');
  const schema=resolve(value);if(schema===true)return 'any';if(schema===false)return 'never';if(!object(schema))return 'any';
  if(depth>=8||seen.has(schema))return 'recursive';const next=new Set([...seen,schema]);
  for(const key of ['oneOf','anyOf','allOf'])if(Array.isArray(schema[key]))return schema[key].map((part:any)=>type(part,depth+1,next)).join(key==='allOf'?' & ':' | ');
  const base=Array.isArray(schema.type)?schema.type.join(' | '):schema.type||(schema.properties?'object':schema.items?'array':'any');
  return (base==='array'?'array<'+type(schema.items,depth+1,next)+'>':base)+(schema.format?' ('+schema.format+')':'')+(schema.nullable?' | null':'')+(Array.isArray(schema.enum)?' enum '+schema.enum.map((v:any)=>JSON.stringify(v)).join(', '):'')+(schema.description?.startsWith('Missing reference:')||schema.description?.startsWith('Circular reference:')||schema.description?.startsWith('Unresolved external reference:')?' — '+schema.description:'');
 }
 const lines=['# '+cell(spec.info?.title||'API')];if(spec.info?.version)lines.push('','Version: '+cell(spec.info.version));if(spec.info?.description)lines.push('',String(spec.info.description));
 function schemas(value:any){const schema=resolve(value);lines.push('','Schema: '+cell(type(value)));if(object(schema?.properties)){lines.push('','| Property | Type | Required | Description |','| --- | --- | --- | --- |');for(const [name,raw] of Object.entries(schema.properties)){const property=resolve(raw);lines.push('| '+[name,type(raw),Array.isArray(schema.required)&&schema.required.includes(name)?'yes':'no',property?.description].map(cell).join(' | ')+' |')}}}
 function example(value:any){if(value===undefined)return;const text=JSON.stringify(value,null,2);const fence='`'.repeat(Math.max(3,...[...text.matchAll(/`+/g)].map(match=>match[0].length+1)));lines.push('',fence+'json',text,fence)}
 function content(value:any){if(!object(value))return;for(const [media,raw] of Object.entries(value)){const entry=resolve(raw);lines.push('','Content type: '+cell(media));if(entry?.schema!==undefined)schemas(entry.schema);example(entry?.example);if(object(entry?.examples))for(const [name,item] of Object.entries(entry.examples)){const ex=resolve(item);lines.push('','Example: '+cell(name));example(ex?.value)}}}
 if(Array.isArray(spec.servers)){lines.push('','## Servers');for(const server of spec.servers)lines.push('','- '+cell(server.url)+(server.description?' — '+cell(server.description):''))}
 let count=0;
 for(const [path,raw] of Object.entries(spec.paths)){if(!path.startsWith('/'))continue;const item=resolve(raw);if(!object(item))continue;
  for(const method of methods){const operation=resolve(item[method]);if(!object(operation))continue;if(++count>500)throw Error('At most 500 operations can be rendered.');lines.push('','## '+method.toUpperCase()+' '+cell(path));if(operation.summary)lines.push('',cell(operation.summary));if(operation.description)lines.push('',String(operation.description));if(operation.operationId)lines.push('','Operation ID: '+cell(operation.operationId));if(operation.deprecated)lines.push('','**Deprecated**');if(Array.isArray(operation.tags))lines.push('','Tags: '+operation.tags.map(cell).join(', '));
   const parameters=new Map<string,any>();for(const rawParameter of [...(Array.isArray(item.parameters)?item.parameters:[]),...(Array.isArray(operation.parameters)?operation.parameters:[])]){const parameter=resolve(rawParameter);if(parameter?.name&&parameter?.in)parameters.set(parameter.in+'\0'+parameter.name,parameter);else if(parameter?.description)lines.push('','Parameter: '+cell(parameter.description))}
   if(parameters.size){lines.push('','### Parameters','','| Name | In | Required | Type | Description |','| --- | --- | --- | --- | --- |');for(const p of parameters.values())lines.push('| '+[p.name,p.in,p.in==='path'||p.required?'yes':'no',type(p.schema),p.description].map(cell).join(' | ')+' |')}
   if(operation.requestBody){const body=resolve(operation.requestBody);lines.push('','### Request body','','Required: '+(body?.required?'yes':'no'));if(body?.description)lines.push('',String(body.description));content(body?.content)}
   if(object(operation.responses)){lines.push('','### Responses');for(const [status,rawResponse] of Object.entries(operation.responses)){const response=resolve(rawResponse);lines.push('','#### '+cell(status),'',String(response?.description||'No description.'));content(response?.content)}}
   const security=operation.security??spec.security;if(Array.isArray(security))lines.push('','### Security','',security.length?security.map((entry:any)=>Object.entries(entry).map(([name,scopes])=>cell(name)+(Array.isArray(scopes)&&scopes.length?' ('+scopes.map(cell).join(', ')+')':'')).join(' + ')||'Anonymous').join(' OR '):'None required.');
  }
 }
 if(!count)throw Error('No supported paths or operations were found.');
 if(object(spec.components?.schemas)){lines.push('','## Schemas');for(const [name,schema] of Object.entries(spec.components.schemas)){lines.push('','### '+cell(name));schemas(schema)}}
 if(warnings.size)lines.push('','## Conversion notes','',...[...warnings].map(note=>'- '+cell(note)));
 return lines.join('\n')+'\n';
}
