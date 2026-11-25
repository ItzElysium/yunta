# Genera yunta-demo.html: un solo archivo en modo demo (sin Supabase), para compartir o publicar.
import re, pathlib
R = pathlib.Path(__file__).parent
html = (R/'index.html').read_text()
body = re.search(r'<!--HEADER-->(.*)<!--/HEADER-->', html, re.S).group(1)
js = '\n'.join((R/f).read_text().replace('</script', '<\\/script') for f in ['config.js','avatars.js','bio.js','api-demo.js','app.js'])
out = f'''<title>Yunta</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700;800&display=swap">
<style>
{(R/'styles.css').read_text()}
</style>
{body}
<script>
{js}
</script>
'''
(R/'yunta-demo.html').write_text(out)
print('ok', len(out))
