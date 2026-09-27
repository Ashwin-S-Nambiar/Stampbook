const A3 =
  'ad:and ae:are af:afg ag:atg ai:aia al:alb am:arm ao:ago aq:ata ar:arg as:asm at:aut au:aus aw:abw ax:ala az:aze ba:bih bb:brb bd:bgd be:bel bf:bfa bg:bgr bh:bhr bi:bdi bj:ben bl:blm bm:bmu bn:brn bo:bol bq:bes br:bra bs:bhs bt:btn bw:bwa by:blr bz:blz ca:can cc:cck cd:cod cf:caf cg:cog ch:che ci:civ ck:cok cl:chl cm:cmr cn:chn co:col cr:cri cu:cub cv:cpv cw:cuw cx:cxr cy:cyp cz:cze de:deu dj:dji dk:dnk dm:dma do:dom dz:dza ec:ecu ee:est eg:egy eh:esh er:eri es:esp et:eth fi:fin fj:fji fk:flk fm:fsm fo:fro fr:fra ga:gab gb:gbr gd:grd ge:geo gf:guf gg:ggy gh:gha gi:gib gl:grl gm:gmb gn:gin gp:glp gq:gnq gr:grc gt:gtm gu:gum gw:gnb gy:guy hk:hkg hn:hnd hr:hrv ht:hti hu:hun id:idn ie:irl il:isr im:imn in:ind io:iot iq:irq ir:irn is:isl it:ita je:jey jm:jam jo:jor jp:jpn ke:ken kg:kgz kh:khm ki:kir km:com kn:kna kp:prk kr:kor kw:kwt ky:cym kz:kaz la:lao lb:lbn lc:lca li:lie lk:lka lr:lbr ls:lso lt:ltu lu:lux lv:lva ly:lby ma:mar mc:mco md:mda me:mne mf:maf mg:mdg mh:mhl mk:mkd ml:mli mm:mmr mn:mng mo:mac mp:mnp mq:mtq mr:mrt ms:msr mt:mlt mu:mus mv:mdv mw:mwi mx:mex my:mys mz:moz na:nam nc:ncl ne:ner nf:nfk ng:nga ni:nic nl:nld no:nor np:npl nr:nru nu:niu nz:nzl om:omn pa:pan pe:per pf:pyf pg:png ph:phl pk:pak pl:pol pm:spm pn:pcn pr:pri ps:pse pt:prt pw:plw py:pry qa:qat re:reu ro:rou rs:srb ru:rus rw:rwa sa:sau sb:slb sc:syc sd:sdn se:swe sg:sgp sh:shn si:svn sj:sjm sk:svk sl:sle sm:smr sn:sen so:som sr:sur ss:ssd st:stp sv:slv sx:sxm sy:syr sz:swz tc:tca td:tcd tf:atf tg:tgo th:tha tj:tjk tk:tkl tl:tls tm:tkm tn:tun to:ton tr:tur tt:tto tv:tuv tw:twn tz:tza ua:ukr ug:uga us:usa uy:ury uz:uzb va:vat vc:vct ve:ven vg:vgb vi:vir vn:vnm vu:vut wf:wlf ws:wsm xk:xkx ye:yem yt:myt za:zaf zm:zmb zw:zwe';

const table = Object.fromEntries(A3.split(' ').map((p) => p.split(':')));

export const alpha3 = (cc) =>
  (table[cc?.toLowerCase()] || cc || '').toUpperCase();

let names;
export function countryName(cc, fallback = '') {
  try {
    names ??= new Intl.DisplayNames(['en'], { type: 'region' });
    return names.of(cc.toUpperCase()) || fallback;
  } catch {
    return fallback;
  }
}
