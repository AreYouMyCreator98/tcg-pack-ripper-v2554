import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/runtime/core.js',import.meta.url),'utf8');
const body=source.slice(source.indexOf('async function auditRequirementHit'),source.indexOf('async function auditAllProgressionTargets'));
test('required hits in a subset count as reachable from their parent pack',async()=>{const ctx=vm.createContext({requirementAuditCache:{},SETS:[{id:'swsh4.5'}],window:{SUBSET_CONFIG_V187:{'swsh4.5':[{ids:['swsh4.5sv']}]}},fetchWithTimeout:async url=>({ok:true,json:async()=>({cards:url.endsWith('sv')?[{name:'Charizard VMAX'}]:[]})})});vm.runInContext(body,ctx);assert.equal(await ctx.auditRequirementHit({setId:'swsh4.5',card:'Charizard VMAX'}),true);});
test('network failures remain unknown and can recover on retry',async()=>{const ctx=vm.createContext({requirementAuditCache:{},SETS:[{id:'test'}],window:{},fetchWithTimeout:async()=>({ok:false})});vm.runInContext(body,ctx);assert.equal(await ctx.auditRequirementHit({setId:'test',card:'A'}),null);ctx.fetchWithTimeout=async()=>({ok:true,json:async()=>({cards:[{name:'A'}]})});assert.equal(await ctx.auditRequirementHit({setId:'test',card:'A'}),true);});
