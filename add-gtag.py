# -*- coding: utf-8 -*-
# Instala o GA4 (G-NEVWFBZ3N4) em todas as paginas .html do shipsealed.
import os, io
ID = "G-NEVWFBZ3N4"
GTAG = ('<!-- Google tag (gtag.js) -->\n'
        '<script async src="https://www.googletagmanager.com/gtag/js?id=%s"></script>\n'
        '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}'
        "gtag('js',new Date());gtag('config','%s');</script>" % (ID, ID))
n = 0; skip = 0
for root, dirs, files in os.walk('.'):
    if '.git' in root.split(os.sep):
        continue
    for f in files:
        if f.endswith('.html'):
            p = os.path.join(root, f)
            h = io.open(p, encoding='utf-8').read()
            if ID in h:
                skip += 1; continue
            if '<head>' in h:
                io.open(p, 'w', encoding='utf-8').write(h.replace('<head>', '<head>\n' + GTAG, 1))
                n += 1
            else:
                skip += 1
print("GA4 instalado em %d arquivos (%d pulados)" % (n, skip))
