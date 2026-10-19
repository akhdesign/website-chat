/*!
 * ah design · Website-Chat Widget v1
 */
(function () {
  'use strict';
  if (window.__ahChatLoaded) return;
  window.__ahChatLoaded = true;

  var script = document.currentScript || document.querySelector('script[src*="ah-chat"]');
  var ds = (script && script.dataset) || {};
  var cfg = Object.assign({
    api: ds.api || '',
    calendly: ds.calendly || 'https://calendly.com/office-ahdesign/30min',
    mail: ds.mail || 'office@ahdesign.at',
    privacy: ds.privacy || '/datenschutz',
    accent: ds.accent || '',
    right: ds.right || '',
    bottom: ds.bottom || '',
    hideOn: (ds.hideOn || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    title: 'Flowy',
    subtitle: 'KI-Assistent von ah design',
  }, window.AHChatConfig || {});
  var DEMO = !cfg.api;
  var API = (cfg.api || '').trim().replace(/\/+$/, '');
  if (API && !/^https?:\/\//.test(API)) API = 'https://' + API;

  if (cfg.hideOn.indexOf(location.pathname.replace(/\/+$/, '') || '/') !== -1) return;

  var FLOWY_HEAD = 'data:image/webp;base64,UklGRhYfAABXRUJQVlA4WAoAAAAQAAAAswAAigAAQUxQSNsLAAABDIZt24aR/j+7td1hD0TEBPCt6gvjYPnMSiVpcg4MZN+xeOJKn2g94aIFYElry6wg/7WFbdshSdL3fr8iI7PcGtu2Z9a2bdu2bdu2u2dta2zb6O78Fd9BZumPyD6OiAmgJEluJEn6/4+nuswwC0EQBGPuETEB1FYsSqMYJSICANomBaC0MdYoZgAgLHfbhK1lGjWV4lGtjbHWWGOtMUYzlritABgivfudn/CCp9x5gSrnjKLla2s0MwDaRoQ2tOH5m65pRKQ5++nWEE/tevg9H/WMV7zlne9771te+6LH3OeYXQYgMpUzjNHJBwPzrAtFJPqhjyIvf+S7vvvva4ay9HD1377ymnvsqEhXVjHGTjaNdT8RGfqYUs45RBmbY/DDoR8bYhIRSRd9/Qn7g2zPMAPA5AKUXvdXGYa8eIrB+xhTSikvMcXgfRKRm773iAUyPcMMYFIBbNQ3ZQtWwdNwm0IQkdNesjdppxjARALAtbqr+FS7HH0QuebNO1NVKQYmDwC2BvQ28XlySsGLXPHyWdW3CqMThq0mfbfP3JDLj0ORP92DXMU8aWAMTT/hjyKScxPDco5Bmo9t4J5iABMDpC31n/RvkehTK3IOSU47hXqaJweUI9z3ryI+pJRb62Xzc1xlGaOTwCg64ociIeYlMy6HRj7Xc25CsKWFt2+WEPIyB3AkP/KtWeMYALpOKTr5LMkht5Aj9fK7Dari7jNk37RVfModOZQ/rTMVdxws7bpJcsydmYby+52NZaC7wJbuerkMU+7Sofxl3jkG0FWs6UlD8bljt8rXXN8wgE6CUvQOSSGvKCRwAdqSl49Xfc2dBChlviAh5iXDF+To5bnUV9xJmqtv//0XHFgAxROYkWPcfCdVK0b3aNX/ofzYvzkFKt4Mct6OlVUAOobZfU+GVjlxOZ+TvXxV1bproIz7tgzz3SZb6Mhenkx9BaBTLH1ehrlc2NgJPTFfvntluVNg6A3iU0FuerE5yDeqgeEOgaXHSUh5PAnceTEFeYIeaKArYOiwW1PMXR+ac3aYdgx0AsB6u7Mk5LE8AhNykPf0pzUAdIKhL8swL5Nx1qElpZhvOrJ2igGgbYChp8gwrwiDjktAllPy8pV6YBQDQKsAKOxxY47LSodBBkpxgSSnmOIptjZaMWNsWwgw+JH43IGVekaSs5ev27m6rqxRzNwmQ48Tn5fMOLIiCijmiPuUHj7V19BV3bOagbawWndpjivASytW6qm5ctNX3vbY43aqwK7SDKANsPRO8XkFR3UCSk+OMnr7+d9/6XE90j3DGC0LUDhkc0orMRLu0AP8/vz8/PC3iP/zC3YjVWkGgIIAwNBXJOS2buhZM9KE/e+v90nkig/uR6ZSXBgbHLI1paXBoBQOgAKgimJNMKUUg8gNb9uJ+poLc/QF8XnJAC0pvcbOAgriFsFq8iJn3Zl6GkBBmg+4Lacl8UCVxYbLaSj+pdwzAMqx9F7xeRmWKSybDqggoODAFJJ80NWqGIB53eVNWhX6UDgSQEAXvBkx0uTROJR3UY+BUgw9UUIuGIXklGUFF1Scm+JQnkEVAyhD8akfsyLg7BTydbsZU4qig7fKIDDlLAcWX0hD+TB6XIilV8iPk68ghQdTbK7Z1ehCDDbKn1H3QWVak0eDPJoslwCmfW5uGEXGAZTAyzSM9/JRdmUYeroEU6aQ5HQIvhLk+1Uhmr7eLMYDcgKIz3r5hikE9TkSVRxJqgIKkoGCAr7s5Y1UhqJDQy4bVwC1gsBrKaY7whRh6AnilwVXTgEVVxR8eSgbXaUK+cDymLYmz6ZFvGw5TjsFWn1o+pmEZVlmhpMjSSmlENOY0RRDkKsfbGqFEhj2dInLOY/oA9A7ET2klKOI5BjGJxH5xUFcKwawamBad7WkVfOGFhiSklJzxUf/cV2WReNlX3vofDXQDIBWn2nfzc2qHVNRKEyP6TFu/zs++vmvf/9H3vqSR5+wM1PtFANUoqLjmpRbzPJolHM3TFWaldbMStme04pRiKa7SSwJNmTHMSkHea5eNzc3Nzs7PdV3WitmAFTI/VYM+kABdlyLrubM7dbMTvXrymrFGKVSNT1KworRwGa7GRg9KcizBmumame1YoxSabABhaUXXFHA15OXf26/bq62RnF5DxtjYb1g8QNyis0jptb2rV6EgFIU3UfiCqD0fK2XH82uHxitGIuWc4LElKuJ8L+Qmy2nLMxYzcyLoJgjU1qagOr/Q5C3T887o8ZQQUy73SwxcYCTMsq/dpirxhEA0FDQwpUjsPBdbKCWUrjXoDaKURqqsyUkVGERPI03IkpAJpSyl49MTTvNjPGlENNflgTqUTxSR2FjPcoZu832tCpO0/fFJ1VAl7cjethxkpotJ033tWIuC4beLcNxfuINVI5ykGfV00arcVTQ48WPuRoxp51Mj7x8bjDbAk1HxjQCn7d6HOTP6+ecVsxlMWYvkrh4HBG711Hbkly633zPah6lcqCxSUKP33E1NVvvNN93RpVFsPQm8Y7nM3KUx89NOaOU0qokTfeQeCfi04K8ZnbGGaWtQUmMHa4VbkTYiA9z9r6pGWe1daCSYNRv5M+FiIgOdjRFtMByHOSzU3M9Z3pMZVl6k/xMAhXY0BIRMeh7Cwv9qmepbGg6If5CWzeAAnbZ2/WLHdZODSoURqx6p8swpeJUPI9YRgf59c7rZ6aYSoehh4vEkkATOTMixv1mpw3zmspjSw85w8eCctYWNWb9YsedayodALiiHc+R2CGjg3x3t3XUDt2f+V9ppH5gkC+sV6UBBADKrj27MB5qluPlgwNCaUQ0YjZcUJjgRwZ5bVXc2JH50yZVap5i2sJ25h+rEhFnnZnklnsztRJgV50qYRV8COBOlNP2R3vw1dXxSyJqQb61QGgFgR29ZQkRHa+SH5wGeVW/PZYeJXGRb0Qp3qC56eReewyO2Nqk7uD0LAp/5Dc79aitUGb9+RI7x8XGqL1hwbSHe+Z7ElYrIu4AqKCC4ADi5juupTbR88SvSoTeEkwAvWIhyLd2aJXlgzfntBrpre2CKeDdlB60odciqKr+s4RusHI9yK933J7aRc8t4HNjeuiG2Vax1jtd3aTJEuTHG3ZRLSKAK3qH+ImS0u0nb7eWWg0otcf1KZYT8UDEQZB3Dnap2sYVvU18OU+G9Sj/Wb9mHm2D0mvObmKXHaa0+Q7VXEVtByzdpwllRTzk5QVmtuYOYEcfEF/U3Gjw8mk7VztqP6D01GkSCoo5jUP5Vj3Td6oDCGzpsFubWM782Hk5dX56UFnqRLCjh6SYOmvv5XdregNrdUeAHT1LQlq5iFERTSnIpg292miNbiCAHb1JQrpHU4yIUb4yNz3QWjF1JcCOXiMxrNTy4WCZEbb6Rl6n+rVWzOgMIihHLxQJheTR1JuGcsvjaFBpxaAuBZSlh98kPhU0OCT5y5EYWKUY1K0AOzrs3xJi56Qg/t3zamAUgzoX4IpmPiLiuyV5kd+cjJ5TzKAuAoyih1wkKXRH8iKXP7+mWgOgbgagHG3/qUai74bkRW56105UOcUAdTbAjulOG0ViaF/0Ite9Zx9ipxWDOh2sLZl7nyqSfGpF04yJIYlc9u59CJViBnU9mK0j9ZDfRZEQUnmjMUQR+fNzdiZdGwZA3Q+wso7q4z98uYgEHwtLwScRuegjd6vJVIYB0EQEwMpVRNs/7rtXikgOIaYiUgw+ioic/6mH7MSqrjUzAJoYYFbWgWiHJ3zprCQiOfgQY1qplGIIPmQRkcs2vunO64hszxnFAGiCYpSVMUQ0d8JLvnvOFhmbUwje+7BEH0LMMn7reT9++4N3tkTGWa2YAdBkHRlV1mkiWjj8Ua/71r8uvjnJym659tw/feWVDz12e0fs6tppxniazADA2homIhqs3+fk+zzpxW/+8Oe+9aOf/mLjxp9840ufePdrnvOIOx++x5oeiHTVc1YzM8bT5MZY1tZVzigaz1oZYwzTeCjjnHNWK2aMJ9AkBxERAGallNbGWmetsWPdqLVGKx6LUdqmxAoylkmdDwBWUDggFBMAAHBSAJ0BKrQAiwA+PRyLRCIhoRL5NgggA8SgDRBj1dHrL+b/KP277j/ovxd0KJ4+1L9592PxB9YHmCfpn/oOrF/VP936i/1p/4X9x95n/I/qT7pf8n+IH9V+Qb+R/zbrD/QA/kn9U9NP9yfgs/ar/sf7P4BP45/T/9p+ffcAegB1o34QfpL8q+h35Iegvmm9++33Oiev/Dn7vjJ+TuoR6+/zHcd/03zudc/0voKe0n1D/W+Gh/Vel318/4HuBfqV/xPKT8ITx32BP5f/Uv+d/gvyA+mD+0/63l6+jf+t/oPgE/k/9C/2/9v/e7/O/OD7IP2R9j79aGhcp/FTOs5A397kLvNvy1ZiPOSp29904y55xo4uUWSXTCoXVUxGwSvoPGfo3JP4SKw421Q5jFFcDXW90X3cOyPxM59hjxcA1IMH98QCYaiRyMGANOdE3vDbUy88UABeiVNrFz65mKH+O/2lqmyd4jpPPVNaM1D7IcMT2RGWrhC+jULzaWYDCUmp+BzycrvV8O/uS0RLnXfGD8oe75scrVoHJM/venTc98+cXsxRZyJFjgses3JnvLsnl9FUIhs/ZXrisn5uZH/NJghkXuH1HTF2AJYjhQ6m0mW/zu+R9788J1bmytLDuMXp9wdyFRNWLZDRpSjYO0fkzy+F3hf3I22s8lo49r2wYkEvndFtiEcXZV7H9bYKDBA1yZSRGOKph7LhvNye7PriynmgdthRHdXO66gKWO26IarcwBXcOU4A5P31I4WKGLq9LLAnJKvhrThQLvZvD+TJDrjG4vhMBAwASH70pPDaPmnD01qzG0HCujBRUwG7Hdh6OxBHFI9aiC10BI9IrqMowlPTx+lVo40TnO6PUiYfumJvC0hRIO3X+PQvanJ4AP7/DWdX9cWv0QvWnMqc9zIXxJAoJNpx0YvbYgghJgHMU1dfxUIeb4C3236Mfj9J5ZvW30h5c8WRGKTix7jb8MfocYNyLmNPaaOmwgs9WY2DRMUzazUWDJaM6xIvfEK9AFb6STw+6IsTKj2mtrQqt6gc0oOx2QSzylQyGoEuZBS7Mq4iaiKHuGssDLJAr17s8HwundKVlQwJO/et1uvha6PVlbXkCnWbt9Ou5Nkzv46Av4tbch2gOYU9gam76t+Pwx2RrswfEQewJmbuUPC90UAtA30yU39rXo7rYowMOIf6iXu1kIRtB/I0MBNUL+MTx4x7xTPNazYuqRjrIfZBllR+4wirXR110MNZAUcggCQ16iB70a1oP9991iNiXlGUf6K/6/yTvoIIMQzJRReibSTMsO4+zX3juxIhih8r1SAMLwLkSNKAdYKsnr93kavwN+C3GRxxVebfi+Qr58bVw8Y/oAozRUYbsqGOCBKfwipOnBA6A+8kvj+9Il9UeNb9LU1OpjcfxPwV+gsWod5IpFfjyQJ6vax7FMn99SexlNCEPP6PaYi1w/gbUyX8kamE638X9ALlD3BT0SqHInxIxmdvDmt75RQqil3b/wnxXsoxO13YsH/liP//VQP/9V1///VQtt03eeC8KeIGdOuNNrEIABHfqzIw+rDmECLBtl/3kcZ/zj5cNuTb8yS4KPl9lar/mHf5xbR+6eGDAwyC5kW8vGRGxw5g4NW+8v05ot5qKS3bwO6Pwt/4hglhCNHOMCy5lNUq0+8bDT0D165JpyXeiAVLl6bbgK57Yc9nK3H0G6BRftYkp0B7HWiwUCeCbWas/IR76W1jrzst6szw/AZS5W13+Pl5vAuvpptMquNZ482MiwUSFKyo++vpMaBtdZ1dBIfXe9GdynvNtCSvYo69gE5qeP7SmEIn2H5NNLpJAvJkczDtcS1cvXYrC0nZoOPT4Hm6ZBBXEsL2b2448erTnE2MmMebStUmf9vvYA1kjTmXmXPozp88BiJ3IrjoOXc6UEvpqrirv/MKqlf9Pacg260x1jWzOLIMK5BWi+xZ+5l35DYga3/LCAfxNQXPDKB+BC0Dh2kYlw09vl/QL+oQxgyjEzs56o1p2zH1HrgooRcEABm/eoC81+O9EBDXFF0FbcWjC7OGOv+nhM/GiIhdwNnAEaqweZ4+xbm/X0obPvgA5/UhKesEEpnMKlCy15z+eNrLFC85j3DgldBf+K2bsfgOTsfZDtBMTY7wmm8D51BBa1p31Uzfht2uv8dMqI7gfbsbKcrt/IJjpd9XwMgV29l/6xJcBK1CM1h7bkRZjKOuRlS4Ruer9F/w1so/zSFGsA+5NtaLctiAn4JQUd0CqOcyrDj6jmC8mRX2Tf0qX4GBvXXQP4bfsQx4q3RseW5eT3wOFk0IR956h1gUOI0OQCAmSTAahsufaQfcCUxrhU6XpgtGYqhes8DUM/76AsqTrWvo/aFCImVzG+HtZfPRcQcHRUrI5jGAdlYdDtw+TFYWUHAVOkQLPb/oJG7b98MZEP7PNwOPmkA6u3gDC1bP0HQghyhcdXs4dZTQUB+vlgjveMekQdNJkq4MeJ2ANyucRMNeSD98DBO2CeSJW3Eb4v8/E3efJvYGqVjzFIBmgSH6uoIuuYf/hnZXpAdjvyTW6A6ptI4RbKq/KLI5hyHB2eplYs4ufuprM1ZQ+i3JACRNOd0m05Q3UjYDns6xcp+o1jqJ86df7N1WkgXi/NTy7y7rzaSK42LDDfTNkaGQcWBR1ok1vdlU+JZhnNwV8dMxnizcsm1yML+O4yhuOmyPU6v3ziIim9VFmQHT4mHpowp/EyUGIAyL7ZO/METYFqTCH+bNxBQWPChKG3OTmFhpJEJrcbz8bykEhsCKpngvGPM3tdvymfhr8RYB/k2VxMqdflIhCpOsnxusxfcSDnzqTITmjZwesj1DcGrtCiOG8E9Di3hvU9hHMG4D8bPAj17jOGIsb28kpbolO9V1Aoit3hwzbNRMnMQBtpUgnPxhZsKBtf8PDuv5HtI87FVs6N17rYkBp9W1s0p1Mdb/gsAP24JKaoHHoT7euIr9fxIrlV029hqvi9ivpbPOd6GUgVhBL9zptn7BVmwChjbUsBzsFY/nIUrhqD7DzqQB7rHUSopoVL+CwNnP8D7tmymhr5Yij67le6Q4y0cJt4PY7o7dACdLMVNvlFG/lk89boSE62/mJUHIiEGWk1vBUvunm/FC2+OqTCSY8xTlQSo7E+yUTtUqH7zciiJhuRAoqPMUw1sh6kKrl1cN32UAqqCff2gPKEMVI5lzx61dec3ry2zqybnWD5EF6lAnEXlOPMbyAhHLAo6wGaNFd2DPkjh+7rrwPSuyN6jG4ce9pC2R9KjXBgdVvpp6d3jiesEeYPi2VeKhQXuq6RCW+337IG6SEsyrgCPBUFV5XIajP5PeVfcxQnPw33Wpxhz1cm8KKl2sXMxhbQY0GwgYK+NX0Rg3r83cpoSCe1+mXdqW20oMN988zADP4CLrvEJS2cBgwxyyfHfP7Zq+s5XGofcjHWaCFB56p94Ug0OgaFSngDS5D8h/ykWPT09UipszIYflBs0lCV5uDylDYo1a0eHYPJj7vH3u1TuO3EWe/peV+YNz5uW/7PaPpJnexrinWC7egg2o1hQSRYFBn+WCgXWAgpRlke1Eag3nHVrGVuiN0kZawquFgFkcxFcBpUqUYp2okvqwo7iOZkUlzVPLXedqCgNfWTplN7RJiu8HSuNvm1ni37mWlSuOb4SgnmJe0Th2iUXjkQQfA+stYyZiFJay0UTlBKIF3T5tNfVwpBseVYgQFqz5+DUUAsfzYA4kVqMD2idKREBgxYsfmlIT+RlfCiL/YDZoxoKOopeVLPkIIIysSNPnKQNx6nALg1IsVwbV7h0M61bMv650Kzu+dyhlBUV25E5KY0KJ+widy00Mb0LRImpA4/pxDKDO+Rj+NPWJS+mdeCWgqA+WJcvklOURr8oLSY3kJ6zRXR2cPRKm2NH8xLGv9wv1acu6Iiw00WJyWFQhhtzgj9e/SSGKx/tLZP8uT4MDu065MTHwL/1t9TqB+VPDJ2YgexcVQPr42buHiTag+7zOlI8a2if0K1dQOFyrLpivq/b4LSgW4M6CRGeCy7YeHCwp++OycW2J0Tms8A/Sm9mhxN24Ko3m3xFvGTeDeRTr1OCQrLxg4Xv8KGVatufZSk4PG2iPwpwdA3KHeKSmevL4NuZEr/yScUk5BPRIacCWxRH+YE881Bhnn5lgDnlGhr+VxsPcJEJV6MuH26AOgPKNPvgKPoAgLlKZji2pojfC6gyADf9SZbviH6v/Rk///VQP/9Uc///U6RG2rFFAaCFAQFI8kdtC10u10wYYFTAU4LvxqO9sWLN+cfn72R1v5z8ww2CWKfXX59nObP6xZeUvyQ8u/mcRz0z8YTx9TTlXvhdMZJm8Kpw5UjTqb8oLKWhd9Q9+8KsYMH+BGFSl/gsx0mFGu9ITaeUQEn8kilF+OsTopjoNLVB81/VSbW9hF1twXmNRjpePFU+wr4MrW8IHTFvHY4N0c8fs92s88QtBh63zXXuy0xV0mTK4dvX0nmx562Rt4/HP5D5dg52e/dxfK4SbQ1jK+V/pyytx1ghmg+MBfen2nNBQhx351/rKr9kYqsXMCsjesGMEjEECPjLwKNYOWWYg4poEXzfE83iHy3yBDxRe519gSo8HhxVyneIPJPVjIOgqXexM/3jL2+z2L+8hwAe8KuoyQpfstePPpuZeuZ19hf7MlxyAJ1t9t/kwQ+zCc63dwTcT/eoGqz554oqjH2DBpX+Zv7aNaFNbGgpfn+AwSr8XQgXIvO2EB0NM1ylAM4TdfYxOsDH57qXdAOxCRRSxcaD0u6qhNULxnvZvQC9gIS5q1mv2vsjibgoZ6lf3VpIEvgPIMoGZxSzfCgN3aqH/4lE+XS/kWPkLD8VPBaby1OHjDxloXsvLA684z+3YCXIqeQL2IAAOGsJ/YtIn3iR30W8qhF7l37N8LlacN24ec/xlV+DXQAp8NERNV8GH+K8LXtUVo2K0ADqm/OpU65N2d4q4lvwzjj/iOSKHKESa4mkLn+9OqlgGSfal3cQdWhIEahU7aFhwbMtvELbcACqCCalXBHOihVRp0e75hDF8zumxJ45era9l7j92led67aBJHb8qOPAWiDI3i/z47TK/4sv/u1lQRlGwJgdQu24Dj7dBJhBC1mMTgkN/nFYmhtAjwnib8M26VFEsUs1YGiEqK4obMjJp+/P5pgAWjwE2tscNYfOuRFIVVeFupXzsMvjy7G9toiECAvIeNyrLGPtY1wJM4PhVAvCJolZjZki7oGRq7J0s3l45ztikFhxtTOiff7sMVNYnGnSzzO7o/oanm0Q+7akj1lU/honup5pOKE3gScr/94bsIABUQJ5dLT64p48JCaJ/wA07sk50+3gM4VLpZhwyU5x2j+u1K5P7ZjldPPVJavDe6P7DLDxJVTMtn7fz6Q/x11cfWy6xBdxxgx9QnxGWMNivSskXg+vlUNVCZkM3aS0eQypIpy2T/riLyYDjJoCa/RTDuDnPZ8osrpAtf+DTzxlhYLRvyoFqITbJf5cPYfFxhXPcT0eVK9gC2k7kXLjN4Gb+RGao40WS36uP0eW00fXPswCOIMfrFjode78v/35fP4Sn5/H2laV5W3TP4VtiZNWxWYmWVwEmGJsBY/wZSyohifGRooalPf+uryIms7ZBQObObGJLzB/yCEAesVvbC1XCgMnU8XqPOrwl31+ofjpC9V1rrnUXufGNnaq8TXPcNTF3GIf21DwMKeFyen2cF2I8lODSK3Dn3HhiPnV08fikXYQLBntVZbGgHwhGSr5RdcuMmKlpS2Mw5wbyFXujaAIqAcm4JY5PBRm77JJhXIfzsiWD3D3zGM92rHlmydMUlslVeTv+75U+ov0EfmxawboaRaBTLV4mgYtpFb+cpQOzXggty8ej/wj4jKhiVAAA/mDP3lB9VAD1cYLR5WEC3+L4xeJMYLO3y0z/2GCGXlEi4MPkGnrBXV22dCi71wQzMLzUaHA7kIchvKx2FBsOYiqI/4WhVQnO0e+Fec49u36TAXGGLhXGoFlLmpeHpOgf7Zy5DzqwqqpTZASYVaXmhSm5db3eY9i08sMsPsEQr7Umk9jXC4bpCzMwPV7D81FnQPFTsqyUd++a9E4AwiNrh3xuBP5RTAAvFrBKwwlHMELu23Y/9t7I6pO1Rgs79hw+5oRkf+g+LGRoEDixEv92cmfWSHaEfG7A0tI2G8NC7yNTZs0pDiQi0E97QwhIdGlNbPnoEwow5kt5Ma6ZPx0vDTP9NM5h9xtYBHQGFo46C/PTYdfDwxbYSffEKEGAlao6CaL/GPP8JoArZqL+b6iBlRLb1bVsGwy2pvj3wIywn1nOOA1LghdlUqRjOQ1Rds54z3UhFA/4KjLvZzNGYYR3321h8Zb8DJC1bWt8Dw6x4z9k3HD65cQGCNNMkP4gbh9urD5Z+Wkm5zf8RzkF8yFXH83/Pmt+tO4uW9Sn4F9K4qXrdBT2qoXNC16xHEgurYsr9j/cp/puDyFzG3Y19J//XQMAAAAAAA==';
  var FLOWY_HAND = 'data:image/webp;base64,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';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORE_KEY = 'ahchat:v1';
  var MAX_TURNS = 20;

  var SUGGESTIONS = [
    'Was kostet eine Website?',
    'Wie lange dauert ein Projekt?',
    'Gibt es Förderungen?',
    'Kann ich die Website selbst pflegen?',
  ];
  var GREETING = 'Hallo, ich bin **Flowy**, der KI-Assistent von ah design. Fragen Sie mich zu Leistungen, Preisen oder zum Ablauf.\n\nFür alles Persönliche verbinde ich Sie direkt mit **Andreas**.';

  // ───────────── Zustand ─────────────
  var state = load() || { messages: [], open: false, nudged: false };
  var busy = false;

  function load() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)); } catch (e) { return null; }
  }
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* privat-modus */ }
  }

  // ───────────── Styles ─────────────
  var css = '\
.ahc,.ahc *{box-sizing:border-box}\
.ahc a,.ahc button,.ahc input,.ahc textarea,.ahc label,.ahc span,.ahc div{letter-spacing:normal;text-transform:none}\
.ahc button,.ahc input,.ahc textarea{margin:0;font-family:inherit}\
.ahc-x,.ahc-send,.ahc-launch{padding:0!important;line-height:1}\
.ahc{--ahc-accent:#c6f432;--ahc-accent-ink:#0b0b0b;--ahc-bg:#0d0d0d;--ahc-panel:#141414;--ahc-bot:#1f1f1f;--ahc-text:#f2f2f2;--ahc-muted:#8d8d8d;--ahc-line:rgba(255,255,255,.08);--ahc-read:#53bdeb;--ahc-radius:18px;--ahc-x:24px;--ahc-y:24px;\
font-family:inherit;font-size:15px;line-height:1.45;color:var(--ahc-text);-webkit-font-smoothing:antialiased}\
.ahc-launch{position:fixed;right:var(--ahc-x);bottom:var(--ahc-y);z-index:2147483000;width:62px;height:62px;padding:0;margin:0;border:1px solid rgba(255,255,255,.16);border-radius:50%;background:rgba(14,15,13,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 6px 20px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.06);cursor:pointer;color:#fff;display:grid;place-items:center;isolation:isolate;-webkit-tap-highlight-color:transparent;transition:border-color .35s ease}\
.ahc-launch:hover,.ahc.is-open .ahc-launch{border-color:color-mix(in srgb,var(--ahc-accent) 45%,rgba(255,255,255,.16))}\
.ahc-disc{position:absolute;inset:0;border-radius:50%;z-index:-2;background:radial-gradient(circle at 50% 45%,#1d1f1a 0%,#121311 70%,#0d0e0c 100%);box-shadow:0 10px 28px rgba(0,0,0,.45);opacity:0;transform:scale(.82);transition:opacity .35s ease,transform .45s cubic-bezier(.22,1,.36,1)}\
.ahc-orb{position:absolute;inset:0;border-radius:50%;z-index:-1;pointer-events:none;opacity:0;transition:opacity .45s ease;\
box-shadow:inset 5px 4px 12px -5px rgba(198,244,50,.6),inset 5px 4px 12px -5px color-mix(in srgb,var(--ahc-accent) 60%,transparent),inset 1px 1px 2px rgba(255,255,255,.14);animation:ahc-spin 3.6s linear infinite}\
.ahc-launch:hover .ahc-disc,.ahc-launch:focus-visible .ahc-disc,.ahc.is-open .ahc-disc{opacity:1;transform:none}\
.ahc-launch:hover .ahc-orb,.ahc-launch:focus-visible .ahc-orb,.ahc.is-open .ahc-orb{opacity:.9}\
@media (hover:none){.ahc-disc{opacity:1;transform:none}.ahc-orb{opacity:.75}}\
.ahc-launch:focus{outline:none}\
.ahc-launch:focus-visible{outline:2px solid rgba(255,255,255,.55);outline-offset:3px}\
.ahc-launch svg{position:absolute;transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .2s}\
.ahc-launch .ahc-i-chat{width:34px;height:34px;filter:drop-shadow(0 0 8px rgba(198,244,50,.25))}\
.ahc-launch:hover .ahc-i-chat{transform:scale(.88)}\
.ahc-launch .ahc-i-close{width:24px;height:24px;opacity:0;transform:rotate(-90deg) scale(.6)}\
.ahc.is-open .ahc-launch .ahc-i-chat{opacity:0;transform:rotate(90deg) scale(.5)}\
.ahc.is-open .ahc-launch .ahc-i-close{opacity:1;transform:none}\
.ahc-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#ff3b30;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;transform:scale(0);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}\
.ahc.has-unread .ahc-badge{transform:scale(1)}\
.ahc-nudge{position:fixed;right:calc(var(--ahc-x) + 76px);bottom:calc(var(--ahc-y) + 10px);z-index:2147483000;max-width:240px;padding:10px 14px;border-radius:14px 14px 4px 14px;background:var(--ahc-panel);color:var(--ahc-text);border:1px solid var(--ahc-line);box-shadow:0 10px 30px rgba(0,0,0,.3);font-size:14px;cursor:pointer;opacity:0;transform:translateY(8px) scale(.96);transform-origin:bottom right;transition:opacity .3s,transform .4s cubic-bezier(.22,1,.36,1);pointer-events:none}\
.ahc-nudge.is-on{opacity:1;transform:none;pointer-events:auto}\
.ahc-panel{position:fixed;right:var(--ahc-x);bottom:calc(var(--ahc-y) + 76px);z-index:2147483001;width:380px;height:min(640px,calc(100vh - var(--ahc-y) - 100px));display:flex;flex-direction:column;background:var(--ahc-bg);border:1px solid var(--ahc-line);border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.45);\
opacity:0;transform:translateY(16px) scale(.97);transform-origin:bottom right;pointer-events:none;visibility:hidden;transition:opacity .25s,transform .4s cubic-bezier(.22,1,.36,1),visibility 0s .4s}\
.ahc.is-open .ahc-panel{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .25s,transform .4s cubic-bezier(.22,1,.36,1),visibility 0s}\
.ahc-head{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;background:var(--ahc-panel);border-bottom:1px solid var(--ahc-line)}\
.ahc-avatar{position:relative;flex:none;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#23251f,#141513 75%);border:1px solid color-mix(in srgb,var(--ahc-accent) 35%,transparent)}\
.ahc-avatar:after{content:"";position:absolute;left:0;bottom:-1px;width:11px;height:11px;border-radius:50%;background:#25d366;border:2px solid var(--ahc-panel);z-index:2}\
.ahc-flowy{position:absolute;left:-3px;top:2px;width:56px;aspect-ratio:1145/890;animation:ahc-float 3.4s ease-in-out infinite;will-change:transform}\
.ahc-flowy img{position:absolute;inset:0;width:100%;height:100%;display:block;max-width:none;margin:0;pointer-events:none;-webkit-user-drag:none}\
.ahc-flowy .ahc-hand{transform-origin:74.7% 93.3%;animation:ahc-wave 4.2s ease-in-out infinite}\
.ahc-row .ahc-flowy{position:relative}\
.ahc-who{flex:1;min-width:0}\
.ahc-name{font-weight:700;font-size:16px;line-height:1.2}\
.ahc-status{font-size:12.5px;color:var(--ahc-muted);height:18px;overflow:hidden}\
.ahc-status span{display:block;transition:transform .3s cubic-bezier(.22,1,.36,1)}\
.ahc.is-typing .ahc-status span{transform:translateY(-18px)}\
.ahc-status .ahc-st-typing{color:var(--ahc-accent)}\
.ahc-x{flex:none;width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--ahc-muted);cursor:pointer;display:grid;place-items:center}\
.ahc-x:hover{background:var(--ahc-line);color:var(--ahc-text)}\
.ahc-log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px 8px;display:flex;flex-direction:column;gap:4px;scroll-behavior:smooth;\
background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px);background-size:18px 18px}\
.ahc-day{align-self:center;margin:0 0 10px;padding:4px 10px;border-radius:8px;background:var(--ahc-panel);color:var(--ahc-muted);font-size:12px}\
.ahc-row{display:flex;flex-direction:column;max-width:84%}\
.ahc-row.is-user{align-self:flex-end;align-items:flex-end}\
.ahc-row.is-bot{align-self:flex-start;align-items:flex-start}\
.ahc-row.is-bot+.ahc-row.is-user,.ahc-row.is-user+.ahc-row.is-bot,.ahc-chips+.ahc-row{margin-top:8px}\
.ahc-bubble{position:relative;padding:8px 12px 6px;border-radius:var(--ahc-radius);word-wrap:break-word;overflow-wrap:anywhere;animation:ahc-pop .32s cubic-bezier(.34,1.4,.64,1) both}\
.is-bot .ahc-bubble{background:var(--ahc-bot);border-top-left-radius:6px}\
.is-user .ahc-bubble{background:var(--ahc-accent);color:var(--ahc-accent-ink);border-top-right-radius:6px;transform-origin:bottom right}\
.is-bot .ahc-bubble{transform-origin:top left}\
.ahc-bubble,.ahc-bubble p,.ahc-bubble strong,.ahc-bubble a{font-family:inherit;font-size:15px;line-height:22px;letter-spacing:normal;text-transform:none}\
.ahc-bubble p{margin:0;padding:0;max-width:none}\
.ahc-bubble p+p{margin-top:0}\
.ahc-bubble strong{font-weight:700}\
.ahc-bubble a{color:var(--ahc-accent);text-decoration:underline;text-underline-offset:2px}\
.is-user .ahc-bubble a{color:inherit}\
.ahc-meta{display:inline-flex;align-items:center;gap:3px;float:right;margin:6px 0 -2px 10px;font-size:11px;line-height:1;opacity:.6;white-space:nowrap}\
.is-user .ahc-meta{opacity:.7}\
.ahc-ticks{width:16px;height:11px}\
.ahc-ticks path{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:stroke .25s}\
.ahc-ticks .t2{opacity:0;transition:opacity .2s}\
.is-delivered .ahc-ticks .t2,.is-read .ahc-ticks .t2{opacity:1}\
.is-read .ahc-ticks path{stroke:#0a7cbf}\
.is-read .ahc-meta{opacity:1}\
.ahc-typing{display:inline-flex;gap:4px;align-items:center;padding:13px 14px;background:var(--ahc-bot);border-radius:var(--ahc-radius);border-top-left-radius:6px;animation:ahc-pop .28s cubic-bezier(.34,1.4,.64,1) both}\
.ahc-typing i{width:7px;height:7px;border-radius:50%;background:var(--ahc-muted);animation:ahc-dot 1.2s infinite ease-in-out}\
.ahc-typing i:nth-child(2){animation-delay:.15s}\
.ahc-typing i:nth-child(3){animation-delay:.3s}\
.ahc-typing.is-out{animation:ahc-out .18s ease forwards}\
.ahc-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0 4px;animation:ahc-fade .4s .1s both}\
.ahc-chip{-webkit-appearance:none;appearance:none;box-sizing:border-box;height:38px;margin:0;padding:0 14px;border:1px solid var(--ahc-line);background:var(--ahc-panel);color:var(--ahc-text);border-radius:999px;font-family:inherit;font-size:14px;font-weight:500;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;vertical-align:middle;transition:border-color .2s,background .2s,transform .2s}\
.ahc-chip:hover{border-color:var(--ahc-accent);transform:translateY(-1px)}\
.ahc-chip.is-main{background:var(--ahc-accent);color:var(--ahc-accent-ink);border-color:var(--ahc-accent);font-weight:600}\
.ahc-chip svg{width:16px;height:16px;flex:none;display:block}\
.ahc-chip-t{display:block;line-height:1;text-box:trim-both cap alphabetic}\
.ahc-chips[data-actions]{flex-wrap:nowrap}\
.ahc-chips[data-actions] .ahc-chip{flex:1 1 0;min-width:0}\
.ahc-card{width:100%;max-width:300px;margin-top:4px;padding:12px;border-radius:var(--ahc-radius);border-top-left-radius:6px;background:var(--ahc-bot);display:flex;flex-direction:column;gap:8px;animation:ahc-pop .32s cubic-bezier(.34,1.4,.64,1) both}\
.ahc-card label,.ahc-card label a,.ahc-card span{font-size:12px;line-height:1.35}\
.ahc-card label{color:var(--ahc-muted);display:flex;flex-direction:column;gap:4px}\
.ahc-card input,.ahc-card textarea{font:inherit;font-size:14px;color:var(--ahc-text);background:var(--ahc-bg);border:1px solid var(--ahc-line);border-radius:10px;padding:8px 10px;width:100%}\
.ahc-card textarea{min-height:70px;resize:vertical}\
.ahc-card input:focus,.ahc-card textarea:focus{outline:none;border-color:var(--ahc-accent)}\
.ahc-card .ahc-consent{flex-direction:row;align-items:flex-start;gap:8px;line-height:1.35}\
.ahc-card .ahc-consent input{width:16px;height:16px;flex:none;margin-top:1px;accent-color:var(--ahc-accent)}\
.ahc-card .ahc-consent a{color:var(--ahc-text)}\
.ahc-card .ahc-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}\
.ahc-card button{font:inherit;font-size:14px;line-height:1.2;font-weight:600;border:0;border-radius:10px;padding:10px;background:var(--ahc-accent);color:var(--ahc-accent-ink);cursor:pointer}\
.ahc-card button[disabled]{opacity:.5;cursor:default}\
.ahc-err,.ahc-err a{font-size:12.5px;line-height:1.35}\
.ahc-err{color:#ff8a80;min-height:0}\
.ahc-foot{padding:10px 12px 8px;background:var(--ahc-panel);border-top:1px solid var(--ahc-line)}\
.ahc-form{display:flex;align-items:flex-end;gap:8px}\
.ahc-input{flex:1;font:inherit;font-size:15px;color:var(--ahc-text);background:var(--ahc-bg);border:1px solid var(--ahc-line);border-radius:22px;padding:10px 16px;resize:none;max-height:120px;line-height:1.35}\
.ahc-input:focus{outline:none;border-color:rgba(198,244,50,.5)}\
.ahc-input::placeholder{color:var(--ahc-muted)}\
.ahc-send{flex:none;width:42px;height:42px;border-radius:50%;border:0;background:var(--ahc-accent);color:var(--ahc-accent-ink);display:grid;place-items:center;cursor:pointer;transition:transform .2s,opacity .2s}\
.ahc-send:disabled{opacity:.35;cursor:default;transform:scale(.92)}\
.ahc-send svg{width:20px;height:20px}\
.ahc-legal,.ahc-legal a{font-size:11px;line-height:1.4;font-weight:400}\
.ahc-legal{margin-top:6px;color:var(--ahc-muted);text-align:center}\
.ahc-legal a{color:inherit}\
.ahc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\
@keyframes ahc-spin{to{transform:rotate(360deg)}}\
@keyframes ahc-breathe{0%,100%{opacity:.55;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}\
@keyframes ahc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}\
@keyframes ahc-wave{0%,55%,100%{transform:rotate(0)}62%{transform:rotate(10deg)}69%{transform:rotate(-3deg)}76%{transform:rotate(8deg)}84%{transform:rotate(0)}}\
@keyframes ahc-pop{from{opacity:0;transform:scale(.6) translateY(6px)}to{opacity:1;transform:none}}\
@keyframes ahc-out{to{opacity:0;transform:scale(.7)}}\
@keyframes ahc-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\
@keyframes ahc-dot{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-5px);opacity:1}}\
@media (max-width:520px){\
.ahc-panel{right:0;bottom:0;width:100%;height:100%;height:100dvh;border-radius:0;border:0}\
.ahc.is-open .ahc-launch{opacity:0;pointer-events:none}\
.ahc{--ahc-x:16px;--ahc-y:16px}\
.ahc-input{font-size:16px}}\
@media (prefers-reduced-motion:reduce){.ahc *:not(.ahc-orb){animation:none!important;transition:none!important}.ahc-orb{animation:ahc-spin 8s linear infinite!important}}';

  // ───────────── Icons ─────────────
  var I = {
    chat: '<svg class="ahc-i-chat" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="ahc-g" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f1ffb8"/><stop offset=".45" style="stop-color:var(--ahc-accent,#c6f432)"/><stop offset="1" stop-color="#6fa80f"/></linearGradient></defs><path fill="url(#ahc-g)" d="M12 2c.55 5.3 4.7 9.45 10 10-5.3.55-9.45 4.7-10 10-.55-5.3-4.7-9.45-10-10 5.3-.55 9.45-4.7 10-10z"/></svg>',
    close: '<svg class="ahc-i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.4-7.5a1 1 0 0 0 0-1.8L3.4 3.6a1 1 0 0 0-1.4 1.1L4 11l9 1-9 1-2 6.3a1 1 0 0 0 1.4 1.1z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
    ticks: '<svg class="ahc-ticks" viewBox="0 0 16 11" aria-hidden="true"><path class="t1" d="M1 6l3 3 6-7"/><path class="t2" d="M8.5 9L15 2"/></svg>',
  };

  // ───────────── DOM ─────────────
  var root, launch, nudge, panel, log, input, sendBtn, statusLive;

  function build() {
    var style = document.createElement('style');
    style.id = 'ahc-style';
    style.textContent = css;
    document.head.appendChild(style);

    root = el('div', 'ahc');
    if (cfg.accent) root.style.setProperty('--ahc-accent', cfg.accent);
    if (cfg.right) root.style.setProperty('--ahc-x', px(cfg.right));
    if (cfg.bottom) root.style.setProperty('--ahc-y', px(cfg.bottom));

    launch = el('button', 'ahc-launch');
    launch.type = 'button';
    launch.setAttribute('aria-label', 'Chat öffnen');
    launch.setAttribute('aria-expanded', 'false');
    launch.setAttribute('aria-controls', 'ahc-panel');
    launch.innerHTML = '<span class="ahc-disc" aria-hidden="true"></span><span class="ahc-orb" aria-hidden="true"></span>' + I.chat + I.close + '<span class="ahc-badge" aria-hidden="true">1</span>';

    nudge = el('div', 'ahc-nudge');
    nudge.textContent = 'Hallo, ich bin Flowy. Fragen zu Website, Preis oder Ablauf? Ich antworte sofort.';

    panel = el('section', 'ahc-panel');
    panel.id = 'ahc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('data-lenis-prevent', '');
    panel.setAttribute('aria-label', 'Chat mit Flowy, dem KI-Assistenten von ah design');
    panel.innerHTML =
      '<header class="ahc-head">' +
        '<div class="ahc-avatar" aria-hidden="true"><div class="ahc-flowy"><img src="' + FLOWY_HEAD + '" alt=""><img class="ahc-hand" src="' + FLOWY_HAND + '" alt=""></div></div>' +
        '<div class="ahc-who"><div class="ahc-name">' + esc(cfg.title) + '</div>' +
        '<div class="ahc-status"><span>' + esc(cfg.subtitle) + '</span><span class="ahc-st-typing">schreibt …</span></div></div>' +
        '<button type="button" class="ahc-x" aria-label="Chat schließen">' + I.x + '</button>' +
      '</header>' +
      '<div class="ahc-log" data-lenis-prevent role="log" aria-live="polite" aria-relevant="additions"><div class="ahc-day">Heute</div></div>' +
      '<div class="ahc-foot">' +
        '<form class="ahc-form" autocomplete="off">' +
          '<label class="ahc-sr" for="ahc-input">Ihre Nachricht</label>' +
          '<textarea id="ahc-input" class="ahc-input" rows="1" maxlength="1000" placeholder="Nachricht schreiben …"></textarea>' +
          '<button type="submit" class="ahc-send" aria-label="Senden" disabled>' + I.send + '</button>' +
        '</form>' +
        '<div class="ahc-legal">KI-Assistent, kann sich irren. Bitte keine sensiblen Daten. <a href="' + esc(cfg.privacy) + '" target="_blank" rel="noopener">Datenschutz</a></div>' +
      '</div>';

    root.appendChild(nudge);
    root.appendChild(panel);
    root.appendChild(launch);
    document.body.appendChild(root);

    log = panel.querySelector('.ahc-log');
    input = panel.querySelector('.ahc-input');
    sendBtn = panel.querySelector('.ahc-send');
    statusLive = el('div', 'ahc-sr');
    statusLive.setAttribute('aria-live', 'polite');
    root.appendChild(statusLive);

    launch.addEventListener('click', function () { toggle(); });
    nudge.addEventListener('click', function () { toggle(true); });
    panel.querySelector('.ahc-x').addEventListener('click', function () { toggle(false); launch.focus(); });
    panel.querySelector('.ahc-form').addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    input.addEventListener('input', function () { autosize(); sendBtn.disabled = !input.value.trim() || busy; });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) { toggle(false); launch.focus(); } });

    // Externe Trigger: <a data-ahchat-open="Was kostet ein Logo?">…</a>
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-ahchat-open]');
      if (!t) return;
      e.preventDefault();
      toggle(true);
      var q = t.getAttribute('data-ahchat-open');
      if (q) setTimeout(function () { ask(q); }, 450);
    });

    restore();
    if (state.open) toggle(true, true);
    else scheduleNudge();
  }

  function toggle(force, silent) {
    var open = typeof force === 'boolean' ? force : !root.classList.contains('is-open');
    root.classList.toggle('is-open', open);
    root.classList.remove('has-unread');
    launch.setAttribute('aria-expanded', String(open));
    launch.setAttribute('aria-label', open ? 'Chat schließen' : 'Chat öffnen');
    nudge.classList.remove('is-on');
    state.open = open;
    if (open) {
      state.nudged = true;
      if (!state.messages.length && !log.querySelector('.ahc-row')) greet();
      if (!silent && window.matchMedia('(min-width:521px)').matches) setTimeout(function () { input.focus(); }, 300);
      scrollDown(true);
    }
    save();
  }

  function scheduleNudge() {
    if (state.nudged) return;
    setTimeout(function () {
      if (root.classList.contains('is-open') || state.nudged) return;
      nudge.classList.add('is-on');
      root.classList.add('has-unread');
      state.nudged = true;
      save();
      setTimeout(function () { nudge.classList.remove('is-on'); }, 9000);
    }, 6000);
  }

  // ───────────── Verlauf ─────────────
  function restore() {
    if (state.messages.length) addBotParts(GREETING, state.greetT || '', true);
    state.messages.forEach(function (m) {
      if (m.role === 'user') addUser(m.content, m.t, true);
      else addBotParts(m.content, m.t, true);
    });
    if (state.messages.length) {
      var last = state.messages[state.messages.length - 1];
      if (last.role === 'assistant' && last.action) addActions(last.action, true);
    }
  }

  function greet() {
    busy = true;
    var dots = showTyping();
    wait(REDUCED ? 0 : 700).then(function () {
      hideTyping(dots);
      state.greetT = now();
      return revealParts(splitParts(GREETING), null);
    }).then(function () {
      var chips = el('div', 'ahc-chips');
      SUGGESTIONS.forEach(function (q) {
        var b = el('button', 'ahc-chip');
        b.type = 'button';
        b.innerHTML = '<span class="ahc-chip-t">' + esc(q) + '</span>';
        b.addEventListener('click', function () { chips.remove(); ask(q); });
        chips.appendChild(b);
      });
      chips.setAttribute('data-suggest', '');
      log.appendChild(chips);
      busy = false;
      sendBtn.disabled = !input.value.trim();
      scrollDown();
    });
  }

  function submit() {
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = '';
    autosize();
    ask(text);
  }

  function ask(text) {
    if (busy) return;
    busy = true;
    sendBtn.disabled = true;
    removeTransient();

    var t = now();
    var row = addUser(text, t);
    state.messages.push({ role: 'user', content: text, t: t });
    save();

    // WhatsApp-Gefühl: ✓ gesendet → ✓✓ zugestellt → blau gelesen → „schreibt …"
    setTimeout(function () { row.classList.add('is-delivered'); }, 250);
    var start = Date.now();

    var userTurns = state.messages.filter(function (m) { return m.role === 'user'; }).length;
    var request = userTurns > MAX_TURNS
      ? Promise.resolve({ reply: 'Wir haben schon viel besprochen. Für alles Weitere ist ein kurzes Gespräch mit Andreas am schnellsten.', action: 'kontakt' })
      : (DEMO ? demoReply(text) : callApi('/chat', { messages: history(), page: location.pathname }));

    var dots;
    wait(REDUCED ? 0 : 550).then(function () {
      row.classList.add('is-read');
      dots = showTyping();
      return request;
    }).then(function (res) {
      if (!res || !res.reply) throw new Error('leer');
      return res;
    }).catch(function (e) {
      console.warn('[ah-chat] Anfrage fehlgeschlagen:', e && e.message, '· data-api =', API);
      return { reply: 'Da hakt gerade etwas. Andreas beantwortet Ihre Frage aber gern persönlich.', action: 'kontakt' };
    }).then(function (res) {
      var parts = splitParts(res.reply);
      // Tipp-Dauer an Textlänge koppeln, damit es natürlich wirkt (aber nie künstlich lang)
      var minTyping = REDUCED ? 0 : Math.min(2200, 650 + parts[0].length * 14);
      var elapsed = Date.now() - start;
      return wait(Math.max(0, minTyping - elapsed)).then(function () {
        return revealParts(parts, dots);
      }).then(function () {
        var tb = now();
        state.messages.push({ role: 'assistant', content: res.reply, t: tb, action: res.action || 'keine' });
        save();
        addActions(res.action);
        if (!root.classList.contains('is-open')) root.classList.add('has-unread');
      });
    }).then(function () {
      busy = false;
      sendBtn.disabled = !input.value.trim();
    });
  }

  function revealParts(parts, dots) {
    var chain = Promise.resolve();
    parts.forEach(function (p, i) {
      chain = chain.then(function () {
        if (i === 0) { hideTyping(dots); addBot(p, now()); return; }
        var d = showTyping();
        return wait(REDUCED ? 0 : Math.min(1600, 500 + p.length * 10)).then(function () { hideTyping(d); addBot(p, now()); });
      });
    });
    return chain;
  }

  function history() {
    return state.messages.slice(-16).map(function (m) { return { role: m.role, content: m.content }; });
  }

  function splitParts(text) {
    var parts = String(text).split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length > 2) parts = [parts[0], parts.slice(1).join('\n\n')];
    return parts.length ? parts : [String(text)];
  }

  // ───────────── Bubbles ─────────────
  function addUser(text, t, instant) {
    var row = el('div', 'ahc-row is-user' + (instant ? ' is-read' : ''));
    var b = el('div', 'ahc-bubble');
    if (instant) b.style.animation = 'none';
    b.innerHTML = '<p>' + esc(text).replace(/\n/g, '<br>') + '</p><span class="ahc-meta">' + esc(t) + I.ticks + '</span>';
    row.appendChild(b);
    log.appendChild(row);
    scrollDown();
    return row;
  }

  function addBot(md, t, instant) {
    var row = el('div', 'ahc-row is-bot');
    var b = el('div', 'ahc-bubble');
    if (instant) b.style.animation = 'none';
    b.innerHTML = render(md) + '<span class="ahc-meta">' + esc(t) + '</span>';
    row.appendChild(b);
    log.appendChild(row);
    statusLive.textContent = 'Neue Antwort';
    scrollDown();
    return row;
  }

  function addBotParts(md, t, instant) {
    splitParts(md).forEach(function (p) { addBot(p, t, instant); });
  }

  function showTyping() {
    root.classList.add('is-typing');
    var row = el('div', 'ahc-row is-bot ahc-typing-row');
    row.innerHTML = '<div class="ahc-typing" aria-label="schreibt"><i></i><i></i><i></i></div>';
    log.appendChild(row);
    scrollDown();
    return row;
  }

  function hideTyping(row) {
    root.classList.remove('is-typing');
    if (row && row.parentNode) row.parentNode.removeChild(row);
  }

  function removeTransient() {
    log.querySelectorAll('[data-suggest],[data-actions]').forEach(function (n) { n.remove(); });
  }

  // ───────────── Übergabe: Call · Mail · Konfigurator ─────────────
  function addActions(action, instant) {
    if (action !== 'kontakt' && action !== 'konfigurator') return;
    var wrap = el('div', 'ahc-chips');
    wrap.setAttribute('data-actions', '');
    if (instant) wrap.style.animation = 'none';

    if (action === 'konfigurator') {
      wrap.appendChild(linkChip(I.calc + '<span class="ahc-chip-t">Preis berechnen</span>', '/anfrage', true, false));
      wrap.appendChild(linkChip(I.cal + '<span class="ahc-chip-t">Call buchen</span>', cfg.calendly, false, true));
    } else {
      wrap.appendChild(linkChip(I.cal + '<span class="ahc-chip-t">Call buchen</span>', cfg.calendly, true, true));
      var m = el('button', 'ahc-chip');
      m.type = 'button';
      m.innerHTML = I.mail + '<span class="ahc-chip-t">Nachricht senden</span>';
      m.addEventListener('click', function () { wrap.remove(); showLeadForm(); });
      wrap.appendChild(m);
    }
    log.appendChild(wrap);
    scrollDown();
  }

  function linkChip(html, href, main, external) {
    var a = el('a', 'ahc-chip' + (main ? ' is-main' : ''));
    a.href = href;
    a.innerHTML = html;
    if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', function () { track('ahchat_' + (href.indexOf('calendly') > -1 ? 'call' : 'konfigurator')); });
    return a;
  }

  function showLeadForm() {
    busy = true;
    var dots = showTyping();
    wait(REDUCED ? 0 : 600).then(function () {
      hideTyping(dots);
      addBot('Gern. Hinterlassen Sie kurz Ihre Daten, Andreas meldet sich persönlich bei Ihnen. Den Chatverlauf schicke ich mit, Sie müssen also nichts wiederholen.', now());

      var lastQ = '';
      for (var i = state.messages.length - 1; i >= 0; i--) if (state.messages[i].role === 'user') { lastQ = state.messages[i].content; break; }

      var row = el('div', 'ahc-row is-bot');
      var f = el('form', 'ahc-card');
      f.setAttribute('novalidate', '');
      f.innerHTML =
        '<label>Name<input name="name" autocomplete="name" required></label>' +
        '<label>E-Mail<input name="email" type="email" autocomplete="email" required></label>' +
        '<label>Nachricht<textarea name="message" maxlength="3000"></textarea></label>' +
        '<label class="ahc-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>' +
        '<label class="ahc-consent"><input type="checkbox" name="consent"><span>Meine Angaben und der Chatverlauf dürfen zur Bearbeitung meiner Anfrage per E-Mail an ah design gesendet werden. <a href="' + esc(cfg.privacy) + '" target="_blank" rel="noopener">Datenschutz</a></span></label>' +
        '<div class="ahc-err" role="alert"></div>' +
        '<button type="submit">Anfrage senden</button>';
      f.elements.message.value = lastQ ? 'Bezug: ' + lastQ : '';
      row.appendChild(f);
      log.appendChild(row);
      scrollDown();
      busy = false;
      setTimeout(function () { f.elements.name.focus(); }, 200);

      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = f.querySelector('.ahc-err');
        var data = {
          name: f.elements.name.value.trim(),
          email: f.elements.email.value.trim(),
          message: f.elements.message.value.trim(),
          website: f.elements.website.value,
          consent: f.elements.consent.checked,
          page: location.href,
          transcript: state.messages.map(function (m) { return { role: m.role, content: m.content }; }),
        };
        if (!data.name) { err.textContent = 'Bitte geben Sie Ihren Namen an.'; return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { err.textContent = 'Bitte prüfen Sie Ihre E-Mail-Adresse.'; return; }
        if (!data.consent) { err.textContent = 'Bitte bestätigen Sie die Weitergabe.'; return; }
        err.textContent = '';
        var btn = f.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Wird gesendet …';

        (DEMO ? wait(900).then(function () { return { ok: true }; }) : callApi('/lead', data))
          .then(function (res) {
            if (!res || !res.ok) throw new Error((res && res.error) || 'Fehler');
            track('ahchat_lead');
            row.remove();
            var d = showTyping();
            return wait(REDUCED ? 0 : 700).then(function () {
              hideTyping(d);
              var msg = 'Danke, ' + data.name.split(' ')[0] + '! Ihre Anfrage ist bei Andreas. Er meldet sich in der Regel innerhalb eines Werktags unter ' + data.email + '.';
              addBot(msg, now());
              state.messages.push({ role: 'assistant', content: msg, t: now(), action: 'keine' });
              save();
            });
          })
          .catch(function (e2) {
            btn.disabled = false;
            btn.textContent = 'Anfrage senden';
            err.innerHTML = esc(e2.message && e2.message !== 'Fehler' ? e2.message : 'Senden hat nicht geklappt.') + ' Alternativ: <a href="mailto:' + esc(cfg.mail) + '">' + esc(cfg.mail) + '</a>';
          });
      });
    });
  }

  // ───────────── Backend ─────────────
  function callApi(path, body) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    if (/DEINNAME/.test(API)) console.warn('[ah-chat] data-api ist noch der Platzhalter – echte Worker-Adresse eintragen:', API);
    return fetch(API + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (r) {
      clearTimeout(timer);
      return r.json().catch(function () { return { ok: false }; }).then(function (j) {
        if (!r.ok) console.warn('[ah-chat] Worker antwortet mit', r.status, j);
        if (!r.ok && path === '/chat') throw new Error('http');
        return j;
      });
    });
  }

  // Demo-Modus (ohne data-api): zeigt Optik + Abläufe mit Beispielantworten
  function demoReply(q) {
    var s = q.toLowerCase();
    var r;
    if (/kost|preis|teuer|budget/.test(s)) r = { reply: 'Website-Pakete starten bei **5.000 €** (Start), das empfohlene Paket Wachstum liegt bei **8.000 €**, Enterprise bei 13.000 €. Alle Preise netto zzgl. USt.\n\nIhre genaue Schätzung sehen Sie in wenigen Klicks im [Konfigurator](/anfrage).', action: 'konfigurator' };
    else if (/lange|dauer|wann|zeit/.test(s)) r = { reply: 'Eine typische Website ist in etwa **vier bis acht Wochen** online. Das hängt vom Umfang ab und davon, wie schnell Inhalte und Feedback kommen.\n\nEinen konkreten Zeitplan legt Andreas gleich im Erstgespräch fest.', action: 'keine' };
    else if (/förder|zuschuss|kmu/.test(s)) r = { reply: 'Ja, zum Beispiel über **KMU.DIGITAL**. Andreas arbeitet mit einem zertifizierten Förderberater zusammen und vermittelt den Kontakt kostenlos. Mehr dazu unter [Digitale Förderung](/foerderung).', action: 'keine' };
    else if (/pfleg|selbst|cms|ändern/.test(s)) r = { reply: 'Ja. Texte, Bilder, Blogartikel oder Projekte ändern Sie direkt im Editor, ohne Programmierkenntnisse. Das Layout bleibt geschützt, und bei der Übergabe zeigt Andreas Ihnen alle Handgriffe.', action: 'keine' };
    else r = { reply: 'Das kann ich Ihnen nicht sicher beantworten. Am besten klären Sie das direkt mit Andreas, per Termin oder kurzer Nachricht.', action: 'kontakt' };
    return wait(500 + Math.random() * 600).then(function () { return r; });
  }

  // ───────────── Helfer ─────────────
  function render(md) {
    var html = esc(md);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, href) {
      var raw = href.replace(/&amp;/g, '&');
      if (!/^(\/[^/]|https:\/\/|mailto:)/.test(raw) && raw !== '/') return t;
      var ext = /^https:\/\//.test(raw) && raw.indexOf(location.host) === -1;
      return '<a href="' + esc(raw) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>';
    });
    return html.split(/\n\s*\n/).map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  function track(name) {
    try { (window.dataLayer = window.dataLayer || []).push({ event: name }); } catch (e) { /* egal */ }
  }

  function autosize() {
    input.style.height = 'auto';
    input.style.height = Math.min(120, input.scrollHeight) + 'px';
  }

  function scrollDown(instant) {
    requestAnimationFrame(function () {
      if (instant) { var b = log.style.scrollBehavior; log.style.scrollBehavior = 'auto'; log.scrollTop = log.scrollHeight; log.style.scrollBehavior = b; }
      else log.scrollTop = log.scrollHeight;
    });
  }

  function now() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function px(v) { return /^\d+(\.\d+)?$/.test(String(v)) ? v + 'px' : String(v); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // Öffentliche Mini-API: AHChat.open(), AHChat.ask('Frage'), AHChat.reset()
  window.AHChat = {
    open: function () { toggle(true); },
    close: function () { toggle(false); },
    ask: function (q) { toggle(true); setTimeout(function () { ask(q); }, 450); },
    reset: function () { state = { messages: [], open: false, nudged: true }; save(); log.querySelectorAll('.ahc-row,.ahc-chips').forEach(function (n) { n.remove(); }); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
