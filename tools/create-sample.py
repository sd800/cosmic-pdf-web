"""Regenerate the independently authored two-page sample; not a site build step."""
from pathlib import Path
import subprocess,tempfile,zlib
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,NumberObject,DictionaryObject,EncodedStreamObject,DecodedStreamObject
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as tmp:
 source=Path(tmp)/'notes.pdf'
 c=canvas.Canvas(str(source),pagesize=(612,792),pageCompression=1,invariant=1)
 c.setTitle('Notes on learning');c.setAuthor('Songming.org')
 pages=[
  ('A little room to think.',[
   'Understanding begins when we connect a new idea with something we already know.',
   'Working memory holds a small amount of information while we use it. When it gets crowded, even a simple explanation can feel difficult.',
   'An everyday example gives an unfamiliar idea a place to land. Instead of remembering every detail at once, we can connect the idea to a familiar experience.',
   'A good question creates that connection. Ask what a term means, how it works, or where you might meet it in daily life.'
  ],'Native text sample'),
  ('Words worth keeping.',[
   'A useful question does not need to be complicated. Sometimes it begins with one unfamiliar word.',
   'Reading gives us the material. Curiosity gives us a direction. A clear explanation can help us see the connection between the two.',
   'Connect the unfamiliar to the familiar. Pause on a phrase. Ask for an example. Then return to the page with a little more understanding.'
  ],'Image-based sample - try text recognition')]
 for i,(title,paragraphs,label) in enumerate(pages,1):
  c.setFillColor(HexColor('#fbfaf7'));c.rect(0,0,612,792,fill=1,stroke=0)
  c.setStrokeColor(HexColor('#b8c6d8'));c.line(62,725,550,725)
  c.setFont('Helvetica',9);c.setFillColor(HexColor('#63768d'));c.drawString(62,743,'THE READING ROOM / NOTES ON LEARNING');c.drawRightString(550,743,f'0{i}')
  c.setFillColor(HexColor('#27374a'));c.setFont('Times-Roman',35);c.drawString(62,650,title)
  y=599
  for text in paragraphs:
   c.setFont('Helvetica',13);c.setFillColor(HexColor('#41536a'))
   lines=simpleSplit(text,'Helvetica',13,468)
   for line in lines:c.drawString(62,y,line);y-=22
   y-=20
  c.setFillColor(HexColor('#e5edf7'));c.roundRect(62,170,488,75,8,fill=1,stroke=0)
  c.setFillColor(HexColor('#386397'));c.setFont('Times-Italic',22);c.drawString(85,199,'Read. Connect. Understand.')
  c.setFont('Helvetica',9);c.setFillColor(HexColor('#63768d'));c.drawString(62,49,'COSMIC PDF / '+label);c.drawRightString(550,49,'songming.org')
  c.showPage()
 c.save()
 prefix=Path(tmp)/'scan'
 subprocess.run(['pdftoppm','-f','2','-l','2','-r','200','-singlefile','-png',str(source),str(prefix)],check=True,capture_output=True)
 reader=PdfReader(source);writer=PdfWriter();writer.add_page(reader.pages[0]);p=writer.add_blank_page(width=612,height=792)
 with Image.open(prefix.with_suffix('.png')) as im:
  rgb=im.convert('RGB');image=EncodedStreamObject();image._data=zlib.compress(rgb.tobytes(),9)
  image.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Image'),NameObject('/Width'):NumberObject(rgb.width),NameObject('/Height'):NumberObject(rgb.height),NameObject('/ColorSpace'):NameObject('/DeviceRGB'),NameObject('/BitsPerComponent'):NumberObject(8),NameObject('/Filter'):NameObject('/FlateDecode')})
  p[NameObject('/Resources')]=DictionaryObject({NameObject('/XObject'):DictionaryObject({NameObject('/PageImage'):writer._add_object(image)})})
  content=DecodedStreamObject();content.set_data(b'q 612 0 0 792 0 0 cm /PageImage Do Q')
  p[NameObject('/Contents')]=writer._add_object(content)
 writer.add_metadata({'/Title':'Notes on learning','/Author':'Songming.org'})
 target=ROOT/'assets/reading-notes.pdf'
 with target.open('wb') as f:writer.write(f)
 result=PdfReader(target)
 assert len(result.pages)==2 and 'Working memory' in result.pages[0].extract_text()
 assert not result.pages[1].extract_text().strip() and '/Font' not in result.pages[1]['/Resources']
 print('Sample verified:',target,target.stat().st_size,'bytes')
