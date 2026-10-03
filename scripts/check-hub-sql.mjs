import {database,USERS} from '../tests/hub-database.mjs';
const d=await database();
try {const s=await d.call(USERS[0],'snapshot');console.log('Migration installed and authenticated snapshot returned',s.version,s.inventory.length);} finally{await d.close();}
