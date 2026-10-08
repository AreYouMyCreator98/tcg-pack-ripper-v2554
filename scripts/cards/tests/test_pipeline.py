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
   if '/bucket/' in url:
    self.assertIn('apikey',headers);self.assertNotIn('Authorization',headers)
    return 200,{},b'{"public":true}'
   if '/object/public/' in url:
    url=url.split('?')[0]
    if url not in objects:raise pipeline.urllib.error.HTTPError(url,404,'missing',{},None)
    body=objects[url];return 200,{'Content-Length':str(len(body))},b'' if method=='HEAD' else body
   if method=='POST':
    public=url.replace('/object/','/object/public/')
    if public in objects:raise pipeline.urllib.error.HTTPError(url,400,'duplicate',{},io.BytesIO(b'{"code":"KeyAlreadyExists"}'))
    objects[public]=data;posts.append(url);return 200,{},b'{}'
   raise AssertionError(url)
  config={'CARD_ASSET_SUPABASE_URL':'https://test.supabase.co','SUPABASE_SERVICE_ROLE_KEY':'test-only-never-real'}
  with patch.dict(os.environ,config),patch.object(pipeline,'request',side_effect=network):
   self.run_cli(['sync']);self.assertEqual(len(posts),3)
   manifest=json.loads((self.root/'public/card-assets.json').read_text());entry=manifest['cards']['sp_eevee']
   self.assertTrue(entry['thumb'].endswith('/thumb.webp'));self.assertNotIn('test-only-never-real',json.dumps(manifest))
   shutil.rmtree(self.root/'.temp/card-mirror/specials')
   plan=json.loads(self.run_cli(['sync','--dry-run']));self.assertEqual(plan['wouldConvert'],0);self.assertEqual(plan['wouldUpload'],0);self.assertEqual(plan['wouldSkip'],1)
   self.run_cli(['sync']);self.assertEqual(len(posts),3)
   with patch.object(pipeline,'request',side_effect=lambda url,**kw:(200,{},b'{"public":true}') if '/bucket/' in url else (_ for _ in ()).throw(AssertionError('Verified resume must skip object requests'))):self.run_cli(['sync','--resume-verified'])
   # Lost manifest / interrupted publication: existing objects must not overwrite.
   (self.root/'public/card-assets.json').unlink();self.run_cli(['sync']);self.assertEqual(len(posts),3)
   self.assertEqual(json.loads((self.root/'public/card-assets.json').read_text())['cards']['sp_eevee']['thumb'],entry['thumb'])
 def test_error_details_survive_retry_classification(self):
  body=b'{"code":"KeyAlreadyExists"}'
  error=pipeline.urllib.error.HTTPError('https://test/art',400,'duplicate',{},io.BytesIO(body))
  with patch.object(pipeline.urllib.request,'urlopen',side_effect=error):
   with self.assertRaises(pipeline.urllib.error.HTTPError) as caught:pipeline.request('https://test/art')
  self.assertEqual(caught.exception.read(),body)
 def test_transient_gateway_jws_error_retries_same_api_key(self):
  error=pipeline.urllib.error.HTTPError('https://test/art',400,'gateway',{},io.BytesIO(b'{"message":"Invalid Compact JWS"}'))
  response=unittest.mock.MagicMock();response.status=200;response.headers={};response.read.return_value=b'ok';response.__enter__.return_value=response
  with patch.object(pipeline.urllib.request,'urlopen',side_effect=[error,response]) as call,patch.object(pipeline.time,'sleep'):
   self.assertEqual(pipeline.request('https://test/art',headers={'apikey':'test-key'})[2],b'ok');self.assertEqual(call.call_count,2)
 def test_gateway_missing_auth_context_retries_valid_api_key(self):
  error=pipeline.urllib.error.HTTPError('https://test/art',400,'gateway',{},io.BytesIO(b"headers must have required property 'authorization'"))
  response=unittest.mock.MagicMock();response.status=200;response.headers={};response.read.return_value=b'ok';response.__enter__.return_value=response
  with patch.object(pipeline.urllib.request,'urlopen',side_effect=[error,response]),patch.object(pipeline.time,'sleep'):
   self.assertEqual(pipeline.request('https://test/art',headers={'apikey':'test-key'})[2],b'ok')
 def test_gateway_header_negotiation_is_bounded_and_preserves_key(self):
  missing=pipeline.urllib.error.HTTPError('https://test/art',400,'gateway',{},io.BytesIO(b"headers must have required property 'authorization'"))
  invalid=pipeline.urllib.error.HTTPError('https://test/art',400,'gateway',{},io.BytesIO(b'Invalid Compact JWS'))
  response=unittest.mock.MagicMock();response.status=200;response.headers={};response.read.return_value=b'ok';response.__enter__.return_value=response
  with patch.object(pipeline.urllib.request,'urlopen',side_effect=[missing,invalid,response]) as calls,patch.object(pipeline.time,'sleep'):
   self.assertEqual(pipeline.request('https://test/art',headers={'apikey':'test-key'})[2],b'ok')
   requests=[c.args[0] for c in calls.call_args_list]
   self.assertIsNone(requests[0].get_header('Authorization'));self.assertEqual(requests[1].get_header('Authorization'),'Bearer test-key');self.assertIsNone(requests[2].get_header('Authorization'))
   self.assertTrue(all(r.get_header('Apikey')=='test-key' for r in requests))
 def test_public_verification_retries_missing_object_response(self):
  error=pipeline.urllib.error.HTTPError('https://test/art',400,'not yet visible',{},None)
  with patch.object(pipeline,'request',side_effect=[error,(200,{},b'verified')]) as request,patch.object(pipeline.time,'sleep'):
   self.assertEqual(pipeline.public_bytes('https://test/art','hash'),b'verified')
   self.assertEqual(request.call_count,2)
   self.assertEqual(request.call_args.args[0],'https://test/art?verify=hash')
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
   if '/bucket/' in url:
    self.assertIn('apikey',headers);self.assertNotIn('Authorization',headers)
    return 200,{},b'{"public":true}'
   raise pipeline.urllib.error.HTTPError(url,403,'denied',{},None)
  config={'CARD_ASSET_SUPABASE_URL':'https://test.supabase.co','SUPABASE_SERVICE_ROLE_KEY':'test-only-never-real'}
  with patch.dict(os.environ,config),patch.object(pipeline,'request',side_effect=network):
   with self.assertRaises(SystemExit):self.run_cli(['sync'])
  self.assertFalse((self.root/'public/card-assets.json').exists())
  self.assertIn('sp_eevee',json.loads((self.root/'.temp/card-mirror/state.json').read_text())['failures'])
if __name__=='__main__':unittest.main()
