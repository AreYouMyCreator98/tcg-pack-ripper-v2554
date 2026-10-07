import unittest,tempfile,pathlib,sys,contextlib,io,json,shutil,os
from unittest.mock import patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
import pipeline
class PipelineTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name)
  src=pipeline.ROOT/'public/assets/specials/sp_eevee.webp';dst=self.root/'public/assets/specials/sp_eevee.webp';dst.parent.mkdir(parents=True);shutil.copyfile(src,dst)
  self.card={'id':'sp_eevee','set':'specials','source':'assets/specials/sp_eevee.webp','custom':True}
 def tearDown(self):self.tmp.cleanup()
 def run_cli(self,args):
  with patch.object(pipeline,'ROOT',self.root),patch.object(pipeline,'catalog',return_value=([],[self.card])),patch.object(sys,'argv',['pipeline',*args]),contextlib.redirect_stdout(io.StringIO()) as out:pipeline.main()
  return out.getvalue()
 def test_resume_and_corruption_repair(self):
  self.run_cli(['sync','--local-only']);d=self.root/'.temp/card-mirror/specials/sp_eevee';before=(d/'source.image').stat().st_mtime_ns;thumb=(d/'thumb.webp').stat().st_mtime_ns
  self.run_cli(['sync','--local-only']);self.assertEqual((d/'thumb.webp').stat().st_mtime_ns,thumb)
  (d/'thumb.webp').write_bytes(b'corrupted');self.run_cli(['sync','--local-only']);self.assertEqual((d/'source.image').stat().st_mtime_ns,before);self.assertEqual(pipeline.dimensions(d/'thumb.webp')[0],200)
  report=json.loads(self.run_cli(['audit']));self.assertEqual(report['localValid'],1);self.assertEqual(report['mirrored'],0)
 def test_dry_run_no_files(self):
  self.run_cli(['sync','--dry-run']);self.assertFalse((self.root/'.temp').exists());self.assertFalse((self.root/'public/card-assets.json').exists())
 def test_reject_html_empty_and_wrong_aspect(self):
  p=self.root/'bad';p.write_text('<html>error</html>')
  with self.assertRaises(Exception):pipeline.dimensions(p)
  p.write_bytes(b'')
  with self.assertRaises(Exception):pipeline.dimensions(p)
 def test_upload_requires_credentials(self):
  with patch.dict(os.environ,{'CARD_ASSET_SUPABASE_URL':'','SUPABASE_SERVICE_ROLE_KEY':''}),contextlib.redirect_stderr(io.StringIO()):
   with self.assertRaises(SystemExit):self.run_cli(['sync'])
  self.assertFalse((self.root/'.temp').exists())
 def test_upload_and_resume_without_local_library(self):
  objects={};posts=[]
  def network(url,method='GET',data=None,headers=None):
   if '/bucket/' in url:return 200,{},b'{"public":true}'
   if '/object/public/' in url:
    if url not in objects:raise pipeline.urllib.error.HTTPError(url,404,'missing',{},None)
    body=objects[url];return 200,{'Content-Length':str(len(body))},b'' if method=='HEAD' else body
   if method=='POST':
    public=url.replace('/object/','/object/public/');objects[public]=data;posts.append(url);return 200,{},b'{}'
   raise AssertionError(url)
  config={'CARD_ASSET_SUPABASE_URL':'https://test.supabase.co','SUPABASE_SERVICE_ROLE_KEY':'test-only-never-real'}
  with patch.dict(os.environ,config),patch.object(pipeline,'request',side_effect=network):
   self.run_cli(['sync']);self.assertEqual(len(posts),3)
   manifest=json.loads((self.root/'public/card-assets.json').read_text());entry=manifest['cards']['sp_eevee']
   self.assertTrue(entry['thumb'].endswith('/thumb.webp'));self.assertNotIn('test-only-never-real',json.dumps(manifest))
   shutil.rmtree(self.root/'.temp/card-mirror/specials');self.run_cli(['sync']);self.assertEqual(len(posts),3)
 def test_missing_webp_uses_same_card_png(self):
  body=(self.root/'public/assets/specials/sp_eevee.webp').read_bytes();calls=[]
  self.card={'id':'sv03.5-163','set':'sv03.5','source':'https://assets.tcgdex.net/en/sv/sv03.5/163/high.webp','custom':False}
  def network(url,**kwargs):
   calls.append(url)
   if url.endswith('.webp'):raise pipeline.urllib.error.HTTPError(url,404,'missing',{},None)
   return 200,{'Content-Type':'image/webp'},body
  with patch.object(pipeline,'request',side_effect=network):self.run_cli(['sync','--local-only'])
  self.assertEqual(calls,[self.card['source'],self.card['source'][:-4]+'png'])
  self.assertEqual(json.loads(self.run_cli(['audit']))['localValid'],1)
 def test_failed_upload_does_not_publish_partial_card(self):
  def network(url,method='GET',data=None,headers=None):
   if '/bucket/' in url:return 200,{},b'{"public":true}'
   raise pipeline.urllib.error.HTTPError(url,403,'denied',{},None)
  config={'CARD_ASSET_SUPABASE_URL':'https://test.supabase.co','SUPABASE_SERVICE_ROLE_KEY':'test-only-never-real'}
  with patch.dict(os.environ,config),patch.object(pipeline,'request',side_effect=network):
   with self.assertRaises(SystemExit):self.run_cli(['sync'])
  self.assertFalse((self.root/'public/card-assets.json').exists())
  self.assertIn('sp_eevee',json.loads((self.root/'.temp/card-mirror/state.json').read_text())['failures'])
if __name__=='__main__':unittest.main()
