#!/usr/bin/env python3
"""Bounded GitHub repository discovery. Metadata/README ranking is not an audit."""
from __future__ import annotations
import argparse, base64, json, math, os, re, sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API = "https://api.github.com"
AGENT = "github-project-radar/1.1 (read-only discovery)"
STOP = set("""a an and are as at be been by can could for from had has have if in into is it its of on or our that the their then there this to was we were with would project repository github open source tool framework system software based use using support current""".split())

def get_json(url: str, token: str | None):
    headers = {"Accept":"application/vnd.github+json","User-Agent":AGENT,"X-GitHub-Api-Version":"2022-11-28"}
    if token:
        headers["Authorization"] = "Bearer " + token
    try:
        with urlopen(Request(url, headers=headers), timeout=25) as res:
            return json.loads(res.read().decode("utf-8")), {k.lower():v for k,v in res.headers.items()}
    except HTTPError as exc:
        detail = exc.read(800).decode("utf-8","replace")
        raise RuntimeError(f"GitHub HTTP {exc.code} for {url}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Could not reach GitHub API: {exc.reason}") from exc

def terms(s: str) -> set[str]:
    vals = (t.strip("._-+#") for t in re.findall(r"[a-zA-Z][a-zA-Z0-9_+#.-]{2,}",s.lower()))
    return {t for t in vals if len(t)>=3 and t not in STOP}

def context_for(a, token):
    parts, source = [a.project_summary or ""], "provided summary" if a.project_summary else ""
    if a.project_repo:
        name=a.project_repo.strip("/")
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+",name):
            raise RuntimeError("--project-repo must use owner/name")
        repo,_=get_json(f"{API}/repos/{name}",token)
        parts.append("Repository: "+repo.get("full_name","")+"\nDescription: "+(repo.get("description") or "")+"\nLanguage: "+str(repo.get("language") or "")+"\nTopics: "+" ".join(repo.get("topics") or []))
        try:
            rd,_=get_json(f"{API}/repos/{name}/readme",token)
            parts.append("README:\n"+base64.b64decode(rd.get("content","")).decode("utf-8","replace")[:12000])
        except RuntimeError as e:
            print("warning: README fetch failed: "+str(e),file=sys.stderr)
        source=source or "GitHub repository "+name
    if a.project_path:
        root=Path(a.project_path).resolve()
        if not root.is_dir(): raise RuntimeError("Project path is not a directory: "+str(root))
        allow={"README.md","ARCHITECTURE.md","CONTRIBUTING.md","AGENTS.md","package.json","pyproject.toml","requirements.txt","Cargo.toml","go.mod","opencode.json"}
        total=0
        for here,dirs,files in os.walk(root):
            dirs[:]=[d for d in dirs if d not in {"node_modules",".git",".wrangler","dist","build",".next",".cache","coverage"}]
            for name in files:
                if name not in allow: continue
                path=Path(here)/name
                try: body=path.read_text(encoding="utf-8")[:6000]
                except (OSError,UnicodeError): continue
                parts.append(f"\nFILE {path.relative_to(root)}\n{body}")
                total+=len(body)
                if total>=25000: break
            if total>=25000: break
        source=source or "local project path "+str(root)
    joined="\n".join(p for p in parts if p.strip())[:45000]
    if not joined.strip(): raise RuntimeError("Provide --project-summary, --project-path, or --project-repo")
    return joined,source

def search(q,n,token):
    url=API+"/search/repositories?"+urlencode({"q":q+" archived:false","sort":"updated","order":"desc","per_page":n})
    data,headers=get_json(url,token)
    return data.get("items",[]),headers

def readme(name,token):
    data,_=get_json(f"{API}/repos/{name}/readme",token)
    return base64.b64decode(data.get("content","")).decode("utf-8","replace")[:12000],data.get("html_url","")

def score(repo,readme_text,project_words):
    desc=repo.get("description") or ""
    corpus=" ".join([repo.get("name",""),desc," ".join(repo.get("topics") or []),readme_text[:7000]])
    matched=sorted(project_words & terms(corpus))
    fit=min(50,round(50*len(matched)/max(8,min(35,len(project_words)))))
    activity=0
    try:
        age=(datetime.now(timezone.utc)-datetime.fromisoformat(repo["pushed_at"].replace("Z","+00:00"))).days
        activity=20 if age<=90 else 15 if age<=365 else 9 if age<=730 else 3
    except (KeyError,ValueError,TypeError): pass
    stars=min(10,round(10*math.log10(1+int(repo.get("stargazers_count") or 0))/5))
    metadata=20 if desc and repo.get("license") and repo.get("language") and repo.get("topics") else 15 if desc and repo.get("language") else 8 if desc else 2
    return min(100,fit+activity+stars+metadata),{"context_overlap_0_50":fit,"recent_activity_0_20":activity,"popularity_0_10":stars,"metadata_0_20":metadata,"matched_terms":matched}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--project-path")
    p.add_argument("--project-repo",help="GitHub repo owner/name")
    p.add_argument("--project-summary",help="Non-sensitive project context and unmet need")
    p.add_argument("--query",action="append",default=[],help="Repeat for complementary repository search queries")
    p.add_argument("--top",type=int,default=15)
    p.add_argument("--per-query",type=int,default=10)
    p.add_argument("--include-forks",action="store_true")
    p.add_argument("--output",default="github-project-radar.md")
    p.add_argument("--json-output",default="github-project-radar.json")
    a=p.parse_args()
    if not (a.project_path or a.project_repo or a.project_summary): p.error("provide project-path, project-repo, or project-summary")
    if not 1<=len(a.query)<=8 or not 1<=a.top<=30 or not 1<=a.per_query<=20: p.error("use 1–8 queries, top 1–30, per-query 1–20")
    token=os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    try:
        ctx,source=context_for(a,token); words=terms(ctx); found={}; errors=[]
        for q in a.query:
            try:
                repos,headers=search(q,a.per_query,token)
                for repo in repos:
                    name=repo.get("full_name")
                    if not name or repo.get("archived") or (repo.get("fork") and not a.include_forks): continue
                    found.setdefault(name,{"repo":repo,"queries":[]})
                    if q not in found[name]["queries"]: found[name]["queries"].append(q)
                remain=headers.get("x-ratelimit-remaining")
                if remain and int(remain)<8: print("warning: GitHub API requests remaining: "+remain,file=sys.stderr)
            except (RuntimeError,ValueError) as e:
                errors.append(f"Search {q}: {e}"); print("warning: "+str(e),file=sys.stderr)
        candidates=sorted(found.values(),key=lambda i:((i["repo"].get("pushed_at") or ""),int(i["repo"].get("stargazers_count") or 0)),reverse=True)[:a.top]
        results=[]
        for item in candidates:
            r=item["repo"]
            try: rd,rdurl=readme(r["full_name"],token)
            except RuntimeError as e: rd,rdurl="", ""; errors.append(f"README {r['full_name']}: {e}")
            priority,breakdown=score(r,rd,words)
            lic=(r.get("license") or {}).get("spdx_id") or "UNKNOWN"
            flags=[]
            if lic=="UNKNOWN": flags.append("license metadata unknown; inspect license file")
            if not rd: flags.append("README not retrieved")
            results.append({"repository":r,"queries":item["queries"],"priority_score":priority,"score_breakdown":breakdown,"license_metadata":lic,"readme_url":rdurl,"readme_excerpt":re.sub(r"\s+"," ",rd[:800]).strip(),"flags":flags})
        results.sort(key=lambda i:(i["priority_score"],int(i["repository"].get("stargazers_count") or 0)),reverse=True)
        date=datetime.now(timezone.utc).date().isoformat()
        lines=["# GitHub Project Radar","",f"- Generated (UTC): {date}",f"- Project context source: {source}",f"- Candidates inspected: {len(results)}",f"- Queries: {'; '.join(a.query)}","","Scores are discovery-priority heuristics, not quality, safety, or adoption verdicts.","","## Ranked candidates","","| # | Repository | Score | Language | License metadata | Last pushed | Stars | Flags |","|---:|---|---:|---|---|---|---:|---|"]
        for n,item in enumerate(results,1):
            r=item["repository"]; flags="; ".join(item["flags"]) or "Source, fit, and security still need review"
            lines.append(f"| {n} | [{r['full_name']}]({r.get('html_url','')}) | {item['priority_score']}/100 | {r.get('language') or 'unknown'} | {item['license_metadata']} | {r.get('pushed_at') or 'unknown'} | {r.get('stargazers_count',0)} | {flags} |")
        for n,item in enumerate(results,1):
            r=item["repository"]
            lines += ["",f"## {n}. {r['full_name']}","",r.get("description") or "No description.", "",f"- Queries: {'; '.join(item['queries'])}",f"- Heuristic breakdown: {json.dumps(item['score_breakdown'])}",f"- License metadata: {item['license_metadata']} (not a legal compatibility determination)",f"- Created: {r.get('created_at') or 'unknown'}; last pushed: {r.get('pushed_at') or 'unknown'}; archived: {r.get('archived')}; fork: {r.get('fork')}",f"- README: {item['readme_url'] or 'not retrieved'}",f"- Flags: {'; '.join(item['flags']) or 'No metadata flag; this is not a security audit'}",f"- README excerpt: {item['readme_excerpt'] or 'not available'}"]
        lines += ["","## Required review before adoption","","Inspect relevant source files, official docs, release and issue history, tests/CI, security advisories, full license terms, dependency footprint, and deployment/data flows. Score serious candidates with references/scorecard.md and define a reversible proof of concept. No candidate code was cloned or executed.","","## Scope limitations","","This is a bounded sample of public GitHub repository search. API limits, indexing, query wording, and excluded forks can hide relevant candidates. README text and metadata do not prove technical correctness, security, maintenance, or project fit."]
        if errors: lines += ["","## Retrieval errors",""]+["- "+e for e in errors]
        payload={"generated_at_utc":datetime.now(timezone.utc).isoformat(),"project_context_source":source,"queries":a.query,"score_warning":"Heuristic discovery priority only; do not treat as proof of quality or safety.","retrieval_errors":errors,"candidates":results}
        out,js=Path(a.output),Path(a.json_output)
        out.parent.mkdir(parents=True,exist_ok=True); js.parent.mkdir(parents=True,exist_ok=True)
        out.write_text("\n".join(lines)+"\n",encoding="utf-8")
        js.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
        print(f"Wrote {len(results)} candidates to {out} and {js}")
        return 0
    except (RuntimeError,OSError,ValueError) as e:
        print("error: "+str(e),file=sys.stderr); return 1

if __name__=="__main__":
    raise SystemExit(main())
